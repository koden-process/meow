import { useState, useEffect } from 'react';
import { store } from '../store/Store';
import { updateFilter } from '../actions/Actions';
import { FILTER_BY_NONE } from '../Constants';
import { FilterMode } from '../pages/HomePage';

/**
 * Hook pour gérer l'état des filtres (text, userId, mode)
 */
export const useFilterState = (filters: { mode: Set<FilterMode> }) => {
    const [text, setText] = useState<string>('');
    const [userId, setUserId] = useState(FILTER_BY_NONE.key);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    // Synchronisation des filtres avec le store
    useEffect(() => {
        store.dispatch(updateFilter(new Set(filters.mode), userId, text));
    }, [text, userId]);

    const handleFilterToggle = (key: FilterMode) => {
        const updated = new Set(filters.mode);
        if (updated.has(key)) {
            updated.delete(key);
        } else {
            updated.add(key);
        }
        store.dispatch(updateFilter(updated, userId, text));
    };

    return {
        text,
        setText,
        userId,
        setUserId,
        selectedAccountId,
        setSelectedAccountId,
        handleFilterToggle,
    };
};
