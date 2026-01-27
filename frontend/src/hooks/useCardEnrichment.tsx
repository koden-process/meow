import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAccounts, selectSchemaByType, store } from '../store/Store';
import { SchemaType, SchemaAttributeType } from '../interfaces/Schema';
import { updateCards, showModalError } from '../actions/Actions';
import { getErrorMessage } from '../helpers/ErrorHelper';
import { getRequestClient } from '../helpers/RequestHelper';
import { Card } from '../interfaces/Card';

/**
 * Hook pour enrichir les cards avec des valeurs lisibles (attributesReadable)
 * Charge les cards depuis l'API et les enrichit avec les noms des références
 */
export const useCardEnrichment = (token: string | undefined) => {
    const accounts = useSelector(selectAccounts);
    const schema = useSelector((store: any) => selectSchemaByType(store, SchemaType.Card));

    useEffect(() => {
        const execute = async () => {
            try {
                const client = getRequestClient(token);
                let cards = await client.getCards();

                // Création du mapping id -> nom pour les accounts
                const accountMapping = Object.fromEntries(
                    accounts.map(acc => [acc._id, acc.name])
                );

                // Enrichissement des cards avec attributesReadable
                let enrichedCards = cards.map((card: Card) => {
                    const attributesReadable: Record<string, any> = {};
                    if (card.attributes && schema && schema.attributes) {
                        schema.attributes.forEach(attr => {
                            if (card.attributes && attr.key in card.attributes) {
                                const value = card.attributes[attr.key];
                                if (
                                    attr.type === SchemaAttributeType.Reference &&
                                    (attr as any).entity === 'contact' &&
                                    typeof value === 'string'
                                ) {
                                    attributesReadable[attr.key] = accountMapping[value] || value;
                                } else {
                                    attributesReadable[attr.key] = value;
                                }
                            }
                        });
                    }
                    return { ...card, attributesReadable };
                });

                store.dispatch(updateCards([...enrichedCards]));
            } catch (error) {
                console.error(error);
                store.dispatch(showModalError(await getErrorMessage(error)));
            }
        };

        execute();
    }, [accounts, schema, token]);
};
