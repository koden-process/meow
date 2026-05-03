import { FILTER_BY_NONE } from '../Constants';
import { FilterMode } from '../pages/HomePage';

/**
 * Indique si un filtre du tableau (hors « état par défaut ») est actif.
 * Quand c’est le cas, le drag-and-drop ne doit pas appliquer l’index de la vue filtrée au board complet.
 */
export function hasActiveBoardFilters(filters: {
  mode: Set<FilterMode>;
  text?: string;
  userId: string;
  accountId: string;
}): boolean {
  if (filters.userId !== FILTER_BY_NONE.key) {
    return true;
  }
  if (filters.accountId) {
    return true;
  }
  if (filters.text?.trim()) {
    return true;
  }
  if (filters.mode.size > 0) {
    return true;
  }
  return false;
}
