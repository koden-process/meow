import { useState, useEffect, useRef } from 'react';
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

    /**
     * Ref miroir d'accountSearchText : toujours à jour sans être une dépendance
     * de l'effet métier, ce qui évite de dispatcher FILTER_UPDATE à chaque frappe
     * dans le ComboBox (état UI éphémère, non métier).
     * La valeur est persistée dans Redux lors du prochain changement de filtre
     * métier (text, userId, selectedAccountId) ou à la sélection d'un compte.
     */
    const accountSearchTextRef = useRef(accountSearchText);
    useEffect(() => {
        accountSearchTextRef.current = accountSearchText;
    });

    useEffect(() => {
        store.dispatch(
            updateFilter(new Set(filters.mode), userId, text, selectedAccountId, accountSearchTextRef.current)
        );
    // accountSearchText est intentionnellement exclu des dépendances : c'est un
    // état UI pur (filtre la liste déroulante du ComboBox) qui ne pilote pas le
    // filtrage métier. Sa valeur courante est lue via accountSearchTextRef pour
    // éviter toute stale closure, et sera persistée dans Redux lors du prochain
    // changement d'un filtre métier (text, userId, selectedAccountId).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, userId, selectedAccountId]);

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
