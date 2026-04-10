import { useState, useEffect } from 'react';
import { store, selectFavoriteAccountIds } from '../store/Store';
import { updateFilter } from '../actions/Actions';
import { FILTER_BY_NONE } from '../Constants';
import { FilterMode } from '../pages/HomePage';
import { useSelector } from 'react-redux';
import { Account } from '../interfaces/Account';

/**
 * Filtres du tableau de bord : état local synchronisé avec Redux pour survivre
 * aux changements de route / remontages du composant (menu, mobile, etc.).
 */
export const useFilterState = (
    filters: {
        mode: Set<FilterMode>;
        text: string | undefined;
        userId: string;
        accountId: string;
        accountSearchText: string;
    },
    accounts: Account[] = []
) => {
    const favoriteAccountIds = useSelector(selectFavoriteAccountIds);

    const [text, setText] = useState<string>(() => filters.text ?? '');
    const [userId, setUserId] = useState(() => filters.userId || FILTER_BY_NONE.key);
    const [selectedAccountId, setSelectedAccountId] = useState(() => filters.accountId ?? '');
    const [accountSearchText, setAccountSearchText] = useState(() => filters.accountSearchText ?? '');

    useEffect(() => {
        store.dispatch(
            updateFilter(new Set(filters.mode), userId, text, selectedAccountId, accountSearchText)
        );
    }, [text, userId, selectedAccountId, accountSearchText]);

    const handleFilterToggle = (key: FilterMode) => {
        const updated = new Set(filters.mode);
        if (updated.has(key)) {
            updated.delete(key);
        } else {
            updated.add(key);
        }
        store.dispatch(updateFilter(updated, userId, text, selectedAccountId, accountSearchText));
    };

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
        accountSearchText,
        setAccountSearchText,
        handleFilterToggle,
        hasFavorites,
        accountsForFilter,
    };
};
