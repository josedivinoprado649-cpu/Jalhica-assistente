import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, FunctionCall } from '@google/genai';
import type { TranscriptEntry } from '../types';
import { createBlob, decode, decodeAudioData } from '../utils/audio';
import { functionDeclarations } from '../components/voice-assistant/config';

type ToolExecutor = (fc: FunctionCall) => { result: any, textForTranscript: string };

export const useLiveConversation = (toolExecutor: ToolExecutor) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'processing' | 'speaking'>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioRefs = useRef({
        inputCtx: null as AudioContext | null,
        outputCtx: null as AudioContext | null,
        stream: null as MediaStream | null,
        processor: null as ScriptProcessorNode | null,
        source: null as MediaStreamAudioSourceNode | null,
        nextStartTime: 0,
        playingSources: new Set<AudioBufferSourceNode>(),
    }).current;

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
            sessionPromiseRef.current = null;
        }
        if (audioRefs.processor) {
            audioRefs.processor.disconnect();
            audioRefs.processor = null;
        }
        if (audioRefs.source) {
            audioRefs.source.disconnect();
            audioRefs.source = null;
        }
        audioRefs.stream?.getTracks().forEach(track => track.stop());
        audioRefs.inputCtx?.close().catch(console.error);
        audioRefs.outputCtx?.close().catch(console.error);
        Object.assign(audioRefs, { inputCtx: null, outputCtx: null, stream: null });
        setStatus('idle');
    }, [audioRefs]);

    const startConversation = useCallback(async () => {
        if (status !== 'idle' || sessionPromiseRef.current) return;

        setStatus('connecting');
        setError(null);

        try {
            if (!process.env.API_KEY) throw new Error("A variável de ambiente API_KEY não está definida.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            audioRefs.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRefs.inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioRefs.outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioRefs.nextStartTime = 0;
            audioRefs.playingSources.clear();

            let currentInput = '', currentOutput = '';

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        audioRefs.source = audioRefs.inputCtx!.createMediaStreamSource(audioRefs.stream!);
                        audioRefs.processor = audioRefs.inputCtx!.createScriptProcessor(4096, 1, 1);
                        audioRefs.processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
                        };
                        audioRefs.source.connect(audioRefs.processor);
                        audioRefs.processor.connect(audioRefs.inputCtx!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.interrupted) {
                            audioRefs.playingSources.forEach(s => s.stop());
                            audioRefs.playingSources.clear();
                            audioRefs.nextStartTime = 0;
                        }
                        if (message.serverContent?.inputTranscription) currentInput += message.serverContent.inputTranscription.text;
                        if (message.serverContent?.outputTranscription) currentOutput += message.serverContent.outputTranscription.text;

                        if (message.toolCall) {
                            setStatus('processing');
                            for (const fc of message.toolCall.functionCalls) {
                                const { result, textForTranscript } = toolExecutor(fc);
                                setTranscript(p => [...p, { id: fc.id, role: 'tool', text: textForTranscript }]);
                                sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result } } }));
                            }
                        }

                        if (message.serverContent?.modelTurn?.parts[0]?.inlineData.data) {
                            setStatus('speaking');
                            const audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                            const outCtx = audioRefs.outputCtx!;
                            audioRefs.nextStartTime = Math.max(audioRefs.nextStartTime, outCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audio), outCtx, 24000, 1);
                            const source = outCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outCtx.destination);
                            source.addEventListener('ended', () => audioRefs.playingSources.delete(source));
                            source.start(audioRefs.nextStartTime);
                            audioRefs.nextStartTime += audioBuffer.duration;
                            audioRefs.playingSources.add(source);
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscript(prev => {
                                const newT = [...prev];
                                if (currentInput.trim()) newT.push({ id: `user-${Date.now()}`, role: 'user', text: currentInput.trim() });
                                if (currentOutput.trim()) newT.push({ id: `model-${Date.now()}`, role: 'model', text: currentOutput.trim() });
                                return newT;
                            });
                            currentInput = '';
                            currentOutput = '';
                            if (audioRefs.playingSources.size === 0) setStatus('listening');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Erro de conexão: ${e.message}`);
                        stopConversation();
                    },
                    onclose: () => stopConversation(),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {}, outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    tools: [{ functionDeclarations }],
                    systemInstruction: "Você é Jalhica, assistente de José. Seja concisa. Use ferramentas para tarefas como salvar arquivos ou gerenciar dados. Confirme ações em voz alta. Ao listar itens, formate-os de forma clara. Você também pode navegar entre as seções da aplicação (conversa, estoque, notas, visitas) usando o comando 'navigateTo'."
                },
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (err) {
            setError(`Falha ao iniciar: ${err instanceof Error ? err.message : String(err)}`);
            stopConversation();
        }
    }, [status, audioRefs, stopConversation, toolExecutor]);

    useEffect(() => {
        startConversation();
        return () => stopConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startConversation]);

    return { status, transcript, error };
};
