import { useMemo, useEffect, useState } from 'react';
import { Card } from '../interfaces/Card';
import { Lane } from '../interfaces/Lane';
import { CardHelper } from '../helpers/CardHelper';
import { FilterMode } from '../pages/HomePage';

/**
 * Hook to filter cards and calculate the total forecast amount
 */
export const useCardFiltering = (
    cards: Card[],
    lanes: Lane[],
    filters: { mode: Set<FilterMode>; userId: string; text?: string },
    selectedAccountId: string,
    selectMappings: { [key: string]: { [id: string]: string } }
) => {
    const [amount, setAmount] = useState(0);

    const filteredCardsByAccount = useMemo(() => {
        if (!selectedAccountId) return cards;
        return cards.filter(card => {
            if (!card.attributes) return false;
            return Object.values(card.attributes).includes(selectedAccountId);
        });
    }, [cards, selectedAccountId]);

    // Extraction des propriétés primitives pour éviter les fausses dépendances
    // Le Set filters.mode est sérialisé en string stable pour la comparaison
    const filterMode = useMemo(() => Array.from(filters.mode).sort().join(','), [filters.mode]);
    const filterUserId = filters.userId;
    const filterText = filters.text;

    useEffect(() => {
        if (!lanes || !filteredCardsByAccount) {
            setAmount(0);
            return;
        }

        const lanesWithForecast = lanes.filter((lane) => lane.inForecast);

        setAmount(
            CardHelper.filterAll(lanesWithForecast, filteredCardsByAccount, filters, selectMappings).reduce(
                (acc, card) => {
                    return card.amount ? acc + card.amount : acc;
                },
                0
            )
        );
    }, [filteredCardsByAccount, lanes, filterMode, filterUserId, filterText, selectMappings, filters]);

    return {
        filteredCardsByAccount,
        amount,
    };
};
