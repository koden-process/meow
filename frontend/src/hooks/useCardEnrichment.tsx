import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAccounts, selectSchemaByType, store } from '../store/Store';
import { SchemaType } from '../interfaces/Schema';
import { updateCards, showModalError } from '../actions/Actions';
import { getErrorMessage } from '../helpers/ErrorHelper';
import { getRequestClient } from '../helpers/RequestHelper';
import { createAccountMapping, enrichCards } from '../services/cardService';

/**
 * Hook to enrich cards with readable values (attributesReadable)
 * Load cards from the API and enrich them with reference names
 */
export const useCardEnrichment = (token: string | undefined) => {
    const accounts = useSelector(selectAccounts);
    const schema = useSelector((store: any) => selectSchemaByType(store, SchemaType.Card));

    useEffect(() => {
        const execute = async () => {
            try {
                const client = getRequestClient(token);
                const cards = await client.getCards();

                const accountMapping = createAccountMapping(accounts);
                const enrichedCards = enrichCards(cards, schema, accountMapping);

                store.dispatch(updateCards([...enrichedCards]));
            } catch (error) {
                console.error(error);
                store.dispatch(showModalError(await getErrorMessage(error)));
            }
        };

        execute();
    }, [accounts, schema, token]);
};
