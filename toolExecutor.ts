import type { FunctionCall } from '@google/genai';
import type { Product, Note, Visitation } from '../types';
import type { Dispatch, SetStateAction } from 'react';

type Setters = {
    setInventory: Dispatch<SetStateAction<Product[]>>;
    setNotes: Dispatch<SetStateAction<Note[]>>;
    setVisitations: Dispatch<SetStateAction<Visitation[]>>;
    setActiveView: Dispatch<SetStateAction<'transcript' | 'inventory' | 'notes' | 'visitations'>>;
}

export const executeToolCall = (fc: FunctionCall, setters: Setters, inventory: Product[], notes: Note[], visitations: Visitation[]) => {
    let result: any;
    let textForTranscript: string;
    const { setInventory, setNotes, setVisitations, setActiveView } = setters;

    switch (fc.name) {
        case 'navigateTo':
            const { section } = fc.args;
            const validSections = ['transcript', 'inventory', 'notes', 'visitations'];
            if (validSections.includes(section)) {
                setActiveView(section as any);
                result = { success: true, section };
                const sectionPortuguese: Record<string, string> = {
                    transcript: 'conversa',
                    inventory: 'estoque',
                    notes: 'notas',
                    visitations: 'visitas'
                };
                textForTranscript = `Navegando para a seção de ${sectionPortuguese[section]}.`;
            } else {
                result = { success: false, error: 'Seção inválida' };
                textForTranscript = `Desculpe, a seção "${section}" não existe.`;
            }
            break;
        case 'saveContentAsFile':
            const { filename, content } = fc.args;
            const blob = new window.Blob([content], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            result = { success: true };
            textForTranscript = `Arquivo "${filename}" salvo com sucesso.`;
            break;
        case 'addProductToInventory':
            const newProduct = { ...fc.args, id: Date.now().toString() };
            setInventory(prev => [...prev, newProduct]);
            result = newProduct;
            textForTranscript = `Produto "${newProduct.name}" adicionado ao estoque.`;
            break;
        case 'listInventory':
            result = inventory;
            textForTranscript = `Listando ${inventory.length} produtos do estoque.`;
            break;
        case 'updateProductNotes':
            const { productName, notes: productNotes } = fc.args;
            let productUpdated = false;
            setInventory(prev => prev.map(p => {
                if (p.name.toLowerCase() === productName.toLowerCase()) {
                    productUpdated = true;
                    return { ...p, notes: productNotes };
                }
                return p;
            }));
            if (productUpdated) {
                result = { success: true, name: productName };
                textForTranscript = `Anotações do produto "${productName}" atualizadas com sucesso.`;
            } else {
                result = { success: false, name: productName, error: 'Produto não encontrado' };
                textForTranscript = `Não foi possível encontrar o produto "${productName}" no estoque.`;
            }
            break;
        case 'createNote':
             const newNote = { ...fc.args, id: Date.now().toString() };
             setNotes(prev => [...prev, newNote]);
             result = newNote;
             textForTranscript = `Nota "${newNote.title}" criada.`;
            break;
        case 'listNotes':
            result = notes;
            textForTranscript = `Listando ${notes.length} notas.`;
            break;
        case 'addVisitationRecord':
            const newVisitation = { ...fc.args, id: Date.now().toString() };
            setVisitations(prev => [...prev, newVisitation]);
            result = newVisitation;
            const timeText = newVisitation.time ? ` às ${newVisitation.time}` : '';
            textForTranscript = `Visita para "${newVisitation.client}" agendada para ${newVisitation.date}${timeText}.`;
            break;
        case 'listVisitations':
            result = visitations;
            textForTranscript = `Listando ${visitations.length} visitas registradas.`;
            break;
        default:
            result = { error: 'Função desconhecida' };
            textForTranscript = `Desculpe, não reconheço a função "${fc.name}".`;
    }

    return { result, textForTranscript };
};
