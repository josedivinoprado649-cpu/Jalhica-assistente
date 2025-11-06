import React from 'react';
import type { Product } from '../types';
import { XIcon } from './icons';

interface InventoryManagerProps {
    products: Product[];
    onClose: () => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ products, onClose }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 w-full max-w-4xl h-full flex flex-col">
            <header className="flex items-center justify-between pb-3 border-b border-gray-700 mb-4">
                <h2 className="text-lg font-semibold text-white">Estoque de Produtos</h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Fechar Estoque">
                    <XIcon className="w-5 h-5" />
                </button>
            </header>
            <div className="overflow-y-auto flex-1 pr-2">
                {products.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Nenhum produto no estoque.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map(product => (
                            <div key={product.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <h3 className="font-bold text-white truncate">{product.name}</h3>
                                <p className="text-sm text-gray-300">Quantidade: <span className="font-semibold text-white">{product.quantity}</span></p>
                                <p className="text-sm text-gray-300">Preço: <span className="font-semibold text-white">R$ {product.price.toFixed(2)}</span></p>
                                {product.notes && (
                                    <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                                        <span className="font-semibold">Notas:</span> {product.notes}
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

export default InventoryManager;