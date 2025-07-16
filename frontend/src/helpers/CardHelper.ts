import { DateTime } from 'luxon';
import { Card } from '../interfaces/Card';
import { FilterMode } from '../pages/HomePage';
import { FILTER_BY_NONE } from '../Constants';
import { Lane as LaneInterface } from '../interfaces/Lane';

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

function filterAll(
  lanes: LaneInterface[],
  cards: Card[],
  filters: { mode: Set<FilterMode>; userId: string; text?: string },
  selectMappings: { [key: string]: { [id: string]: string } } = {}
) {
  const filtered = lanes.map((lane) => filterByLane(lane, cards, filters, selectMappings));

  return filtered.reduce((previous, current) => {
    return previous.concat(current);
  }, []);
}

function filterByLane(
  lane: LaneInterface,
  cards: Card[],
  filters: { mode: Set<FilterMode>; userId: string; text?: string },
  selectMappings: { [key: string]: { [id: string]: string } } = {}
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

        // Recherche dans les attributs de la carte
        if (card.attributes && typeof card.attributes === 'object') {
          // Liste des rôles à prendre en compte
          const roleKeys = ['architecte', 'moe', 'tiger', 'langue', 'account'];
          for (const key in card.attributes) {
            let value = card.attributes[key];
            // Utilisation du mapping par UUID d'attribut
            if (
              typeof key === 'string' &&
              selectMappings[key] &&
              typeof value === 'string' &&
              selectMappings[key][value]
            ) {
              value = selectMappings[key][value];
            }
            if (typeof value === 'string' && regex.test(value)) {
              return card;
            }
            if (typeof value === 'number' && regex.test(value.toString())) {
              return card;
            }
          }
        }

        // Si aucun match, on exclut la carte
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
