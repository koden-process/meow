import { DateTime } from 'luxon';
import { Card } from '../interfaces/Card';
import { FilterMode } from '../pages/HomePage';
import { FILTER_BY_NONE } from '../Constants';
import { Lane as LaneInterface } from '../interfaces/Lane';
import { ApplicationStore } from '../store/ApplicationStore';
import { SchemaHelper } from './SchemaHelper';
import { SchemaType, SchemaAttributeType } from '../interfaces/Schema';

function isOverDue(card: Card) {
  const today = DateTime.now().startOf('day');

  if (card.closedAt && DateTime.fromISO(card.closedAt).startOf('day') < today) {
    return true;
  }

  if (card.nextFollowUpAt && DateTime.fromISO(card.nextFollowUpAt).startOf('day') < today) {
    return true;
  }

  return false;
}

// Fonction pour enrichir les attributs avec les valeurs lisibles
function getReadableAttributes(
  card: Card,
  store: ApplicationStore
): Record<string, string> {
  const schema = store.schemas.find((s) => s.type === SchemaType.Card);
  if (!schema || !card.attributes) return {};

  const readable: Record<string, string> = {};

  for (const attr of schema.attributes) {
    const value = card.attributes[attr.key];
    if (value == null || value === '') continue;

    // Si c'est une référence vers contact, architect ou moe
    if (
      SchemaHelper.isReferenceAttribute(attr) &&
      ['contact', 'architect', 'moe'].includes(attr.entity ?? '')
    ) {
      // Pour l'instant, on utilise les accounts pour tous les types de références
      // Tu pourras adapter plus tard si tu as des entités spécifiques
      const found = store.accounts.find((account) => account._id === value);
      readable[attr.name] = found ? found.name : String(value);
    } else if (
      attr.type === SchemaAttributeType.Text ||
      attr.type === SchemaAttributeType.TextArea ||
      attr.type === SchemaAttributeType.Select ||
      attr.type === SchemaAttributeType.Email ||
      attr.type === SchemaAttributeType.Boolean
    ) {
      readable[attr.name] = String(value);
    }
  }
  return readable;
}

function filterAll(
  lanes: LaneInterface[],
  cards: Card[],
  filters: { mode: Set<FilterMode>; userId: string; text?: string },
  store: ApplicationStore
) {
  const filtered = lanes.map((lane) => filterByLane(lane, cards, filters, store));

  return filtered.reduce((previous, current) => {
    return previous.concat(current);
  }, []);
}

function filterByLane(
  lane: LaneInterface,
  cards: Card[],
  filters: { mode: Set<FilterMode>; userId: string; text?: string },
  store: ApplicationStore
) {
  console.log(cards);
  return cards
    .filter((card) => card.laneId === lane._id)
    .filter((card) => {
      const updatedAt = card.closedAt ? DateTime.fromISO(card.updatedAt) : undefined;

      if (
        filters.mode.has(FilterMode.RecentlyUpdated) &&
        updatedAt &&
        updatedAt < DateTime.now().startOf('day').minus({ days: 3 })
      ) {
        return;
      }

      if (filters.mode.has(FilterMode.RequireUpdate) && lane.tags?.type !== 'normal') {
        return;
      }

      if (filters.mode.has(FilterMode.RequireUpdate) && lane.inForecast === false) {
        return;
      }

      if (filters.mode.has(FilterMode.RequireUpdate) && !isOverDue(card)) {
        return;
      }

      if (filters.userId !== FILTER_BY_NONE.key && card.userId !== filters.userId) {
        return;
      }

      if (filters.text) {
        const regex = new RegExp(`${filters.text}`, 'i');

        if (regex.test(lane.name)) {
          return card;
        }

        if (regex.test(card.name)) {
          return card;
        }

        // Recherche dans les attributs enrichis
        const readableAttributes = getReadableAttributes(card, store);
        for (const value of Object.values(readableAttributes)) {
          if (regex.test(value)) {
            return card;
          }
        }
        // Si rien trouvé, on ne garde pas la carte
        return;
      }

      return card;
    });
}

export const CardHelper = {
  isOverDue,
  filterByLane,
  filterAll,
};
