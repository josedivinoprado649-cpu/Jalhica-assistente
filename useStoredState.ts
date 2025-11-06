// Fix: Import Dispatch and SetStateAction to resolve React namespace error.
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export const useStoredState = <T,>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(error);
            return defaultValue;
        }
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
};