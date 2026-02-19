import { Card } from '../interfaces/Card';
import { Account } from '../interfaces/Account';
import { Schema, SchemaAttributeType } from '../interfaces/Schema';

/**
 * Service for business logic related to cards
 */

/**
 * Creates a mapping of account IDs to their names
 */
export const createAccountMapping = (accounts: Account[]): { [id: string]: string } => {
    return Object.fromEntries(accounts.map(acc => [acc._id, acc.name]));
};

/**
 * Creates a global mapping for reference type attributes
 */
export const createSelectMappings = (
    schema: Schema | undefined,
    accountMapping: { [id: string]: string }
): { [key: string]: { [id: string]: string } } => {
    const selectMappings: { [key: string]: { [id: string]: string } } = {};

    if (schema && schema.attributes) {
        schema.attributes.forEach(attr => {
            if (
                attr.type === SchemaAttributeType.Reference &&
                (attr as any).entity === 'contact'
            ) {
                selectMappings[attr.key] = accountMapping;
            }
        });
    }

    return selectMappings;
};

/**
 * Enriches a card with attributesReadable
 */
export const enrichCard = (
    card: Card,
    schema: Schema | undefined,
    accountMapping: { [id: string]: string }
): Card => {
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
};

/**
 * Enriches a list of cards with attributesReadable
 */
export const enrichCards = (
    cards: Card[],
    schema: Schema | undefined,
    accountMapping: { [id: string]: string }
): Card[] => {
    return cards.map(card => enrichCard(card, schema, accountMapping));
};
