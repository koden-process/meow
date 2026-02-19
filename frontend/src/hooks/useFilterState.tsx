import { useState, useEffect } from 'react';
import { store, selectFavoriteAccountIds } from '../store/Store';
import { updateFilter } from '../actions/Actions';
import { FILTER_BY_NONE } from '../Constants';
import { FilterMode } from '../pages/HomePage';
import { useSelector } from 'react-redux';
import { Account } from '../interfaces/Account';

/**
 * Hook to manage filter state (text, userId, mode)
 */
export const useFilterState = (filters: { mode: Set<FilterMode> }, accounts: Account[] = []) => {
    const favoriteAccountIds = useSelector(selectFavoriteAccountIds);

    const [text, setText] = useState<string>('');
    const [userId, setUserId] = useState(FILTER_BY_NONE.key);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

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

    // Liste des comptes à afficher dans le filtre :
    // si l'utilisateur a des favoris → seulement les favoris, sinon tous
    const hasFavorites = favoriteAccountIds.length > 0;
    const accountsForFilter = hasFavorites
        ? accounts.filter((a) => favoriteAccountIds.includes(a._id))
        : accounts;

    return {
        text,
        setText,
        userId,
        setUserId,
        selectedAccountId,
        setSelectedAccountId,
        handleFilterToggle,
        hasFavorites,
        accountsForFilter,
    };
};
