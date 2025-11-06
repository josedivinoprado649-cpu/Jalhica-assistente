import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FunctionCall } from '@google/genai';
import { useJalhicaData } from '../hooks/useJalhicaData';
import { useLiveConversation } from '../hooks/useLiveConversation';
import { executeToolCall } from '../utils/toolExecutor';
import InventoryManager from './InventoryManager';
import CalculatorNotes from './CalculatorNotes';
import VisitationSheet from './VisitationSheet';
import TranscriptView from './voice-assistant/TranscriptView';

const statusText: Record<string, string> = {
    idle: "Iniciando...",
    connecting: "Conectando ao cérebro da Jalhica...",
    listening: "Ouvindo...",
    processing: "Processando sua solicitação...",
    speaking: "Falando...",
};

const VoiceAssistant: React.FC = () => {
    const [activeView, setActiveView] = useState<'transcript' | 'inventory' | 'notes' | 'visitations'>('transcript');
    
    const { inventory, setInventory, notes, setNotes, visitations, setVisitations } = useJalhicaData();

    // Use a ref to hold the latest data to keep toolExecutor stable
    const dataRef = useRef({ inventory, notes, visitations });
    useEffect(() => {
        dataRef.current = { inventory, notes, visitations };
    }, [inventory, notes, visitations]);

    const toolExecutor = useCallback((fc: FunctionCall) => {
        // Now using the ref for data, which is always up-to-date
        return executeToolCall(
            fc,
            { setInventory, setNotes, setVisitations, setActiveView },
            dataRef.current.inventory,
            dataRef.current.notes,
            dataRef.current.visitations
        );
    }, [setInventory, setNotes, setVisitations, setActiveView]); // Dependencies are now stable

    const { status, transcript, error } = useLiveConversation(toolExecutor);
    
    const renderActiveView = () => {
        switch (activeView) {
            case 'inventory':
                return <InventoryManager products={inventory} onClose={() => setActiveView('transcript')} />;
            case 'notes':
                return <CalculatorNotes notes={notes} onClose={() => setActiveView('transcript')} />;
            case 'visitations':
                return <VisitationSheet visitations={visitations} onClose={() => setActiveView('transcript')} />;
            case 'transcript':
            default:
                return <TranscriptView transcript={transcript} status={status} statusText={statusText} error={error} />;
        }
    }
    
    return (
        <div className="flex flex-col h-full items-center justify-center p-4 md:p-8">
            <div key={activeView} className="animate-fade-in w-full h-full flex flex-col items-center justify-center">
                {renderActiveView()}
            </div>
        </div>
    );
};

export default VoiceAssistant;