import { Card } from '../interfaces/Card';
import { Account } from '../interfaces/Account';
import { Schema, SchemaAttributeType } from '../interfaces/Schema';

/**
 * Service pour la logique métier liée aux cards
 */

/**
 * Crée un mapping des IDs d'accounts vers leurs noms
 */
export const createAccountMapping = (accounts: Account[]): { [id: string]: string } => {
    return Object.fromEntries(accounts.map(acc => [acc._id, acc.name]));
};

/**
 * Crée un mapping global pour les attributs de type référence
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
            // Ici tu pourras ajouter architect/moe si tu as les mappings
        });
    }

    return selectMappings;
};

/**
 * Enrichit une card avec attributesReadable
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
 * Enrichit une liste de cards avec attributesReadable
 */
export const enrichCards = (
    cards: Card[],
    schema: Schema | undefined,
    accountMapping: { [id: string]: string }
): Card[] => {
    return cards.map(card => enrichCard(card, schema, accountMapping));
};
