import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './Store';
import { FilterMode } from '../pages/HomePage';

/**
 * Sélecteur mémorisé pour les filtres.
 * Utilise createSelector de Redux Toolkit pour ne recréer l'objet filters
 * que si les valeurs réelles dans le store changent.
 *
 * Avantages :
 * - Évite de recréer un nouvel objet à chaque appel
 * - Réduit les re-renders inutiles dans les composants
 * - Améliore les performances globales de l'application
 */
export const selectFilters = createSelector(
  [(store: RootState) => store.ui.filters],
  (filters) => ({
    mode: new Set<FilterMode>(filters.mode),
    text: filters.text,
    userId: filters.userId,
  })
);
