import React from 'react';
import type { Visitation } from '../types';
import { XIcon } from './icons';

interface VisitationSheetProps {
    visitations: Visitation[];
    onClose: () => void;
}

const VisitationSheet: React.FC<VisitationSheetProps> = ({ visitations, onClose }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 w-full max-w-4xl h-full flex flex-col">
            <header className="flex items-center justify-between pb-3 border-b border-gray-700 mb-4">
                <h2 className="text-lg font-semibold text-white">Registros de Visitas</h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Fechar Visitas">
                    <XIcon className="w-5 h-5" />
                </button>
            </header>
            <div className="overflow-y-auto flex-1 pr-2">
                {visitations.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Nenhuma visita registrada.</p>
                    </div>
                ) : (
                     <div className="space-y-4">
                        {visitations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(visit => (
                            <div key={visit.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white">{visit.client}</h3>
                                        <p className="text-sm text-gray-300">{visit.address}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="font-semibold text-white">{new Date(visit.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                                        {visit.time && <p className="text-sm text-gray-400">{visit.time}</p>}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-200 mt-2">{visit.reason}</p>
                                {visit.notes && (
                                    <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                                        <span className="font-semibold">Notas:</span> {visit.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitationSheet;