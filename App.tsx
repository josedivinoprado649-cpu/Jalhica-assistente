import React from 'react';
// CORREÇÃO: Coloca o VoiceAssistant na raiz, como o seu 'ls' mostrou.
import VoiceAssistant from './VoiceAssistant.tsx'; 
// CORREÇÃO: Assumindo que a pasta 'components' existe na raiz e contém 'icons'.
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
