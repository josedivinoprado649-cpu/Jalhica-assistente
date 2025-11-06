import React from 'react';
// CORREÇÃO FINAL: Usando o caminho mais robusto, que inclui a subpasta VoiceAssistant e a extensão .tsx,
// o que resolve o problema de resolução de caminho no Vercel (ambiente Linux/case-sensitive).
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant.tsx';
import { JalhicaLogoIcon } from './components/icons';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen font-sans bg-gray-900 text-gray-200">
      <header className="flex items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
        <JalhicaLogoIcon className="h-8 w-8 text-blue-400" />
        <h1 className="ml-3 text-xl font-bold tracking-tight text-white">Jalhica</h1>
        <div className="ml-auto text-right text-gray-500">
          <p className="text-sm">Assistente Pessoal de</p>
          <p className="font-semibold text-gray-300">José Divino Prado</p>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <VoiceAssistant />
      </main>
    </div>
  );
};

export default App;



