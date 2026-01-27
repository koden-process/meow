import { useMemo, useEffect, useState } from 'react';
import { Card } from '../interfaces/Card';
import { Lane } from '../interfaces/Lane';
import { CardHelper } from '../helpers/CardHelper';
import { FilterMode } from '../pages/HomePage';

/**
 * Hook pour filtrer les cards et calculer le montant total du forecast
 */
export const useCardFiltering = (
    cards: Card[],
    lanes: Lane[],
    filters: { mode: Set<FilterMode>; userId: string; text?: string },
    selectedAccountId: string,
    selectMappings: { [key: string]: { [id: string]: string } }
) => {
    const [amount, setAmount] = useState(0);

    // Filtrage par account sélectionné
    const filteredCardsByAccount = useMemo(() => {
        if (!selectedAccountId) return cards;
        return cards.filter(card => {
            if (!card.attributes) return false;
            return Object.values(card.attributes).includes(selectedAccountId);
        });
    }, [cards, selectedAccountId]);

    // Calcul du montant total du forecast
    useEffect(() => {
        if (!lanes || !filteredCardsByAccount) {
            setAmount(0);
            return;
        }

        const lanesWithForecast = lanes.filter((lane) => lane.inForecast === true);

        setAmount(
            CardHelper.filterAll(lanesWithForecast, filteredCardsByAccount, filters, selectMappings).reduce(
                (acc, card) => {
                    return card.amount ? acc + card.amount : acc;
                },
                0
            )
        );
    }, [filteredCardsByAccount, lanes, filters, selectMappings]);

    return {
        filteredCardsByAccount,
        amount,
    };
};
