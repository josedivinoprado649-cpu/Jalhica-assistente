import React from 'react';
import type { Note } from '../types';
import { XIcon } from './icons';

interface CalculatorNotesProps {
    notes: Note[];
    onClose: () => void;
}

const CalculatorNotes: React.FC<CalculatorNotesProps> = ({ notes, onClose }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 w-full max-w-4xl h-full flex flex-col">
            <header className="flex items-center justify-between pb-3 border-b border-gray-700 mb-4">
                <h2 className="text-lg font-semibold text-white">Anotações</h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Fechar Anotações">
                    <XIcon className="w-5 h-5" />
                </button>
            </header>
            <div className="overflow-y-auto flex-1 pr-2">
                {notes.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Nenhuma nota salva.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notes.map(note => (
                            <div key={note.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <h3 className="font-bold text-white text-md mb-2">{note.title}</h3>
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculatorNotes;