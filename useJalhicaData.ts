import { useStoredState } from './useStoredState';
import type { Product, Note, Visitation } from '../types';

export const useJalhicaData = () => {
    const [inventory, setInventory] = useStoredState<Product[]>('jalhica-inventory', []);
    const [notes, setNotes] = useStoredState<Note[]>('jalhica-notes-v2', []);
    const [visitations, setVisitations] = useStoredState<Visitation[]>('jalhica-visitations', []);

    return {
        inventory,
        setInventory,
        notes,
        setNotes,
        visitations,
        setVisitations,
    };
};
