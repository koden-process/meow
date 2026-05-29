# 2026-05-29 — Stabilisation de la fiche opportunité entre pages

## Contexte
La fiche opportunité était rendue directement dans plusieurs pages. Lorsqu'une opportunité restait ouverte pendant la navigation, son comportement variait selon la route : elle pouvait se vider sur certaines pages ou disparaître sur d'autres.

## Changement
- Centralisation du rendu de la fiche opportunité dans `frontend/src/components/Layout.tsx`.
- Affichage de la fiche uniquement sur les routes métier capables d'ouvrir une opportunité : `/`, `/activity`, `/forecast/*` et `/accounts`.
- Suppression des rendus `CardLayer` redondants dans les pages concernées.
- Ajout de `frontend/src/helpers/CardLayerHelper.ts` pour bloquer l'ouverture d'une autre opportunité lorsqu'une fiche est déjà ouverte.
- Ajout d'un message utilisateur indiquant de fermer ou enregistrer la fiche avant d'en ouvrir une autre.

## Décisions implicites
Le state Redux `ui.state` / `ui._id` reste conservé lors des changements de route. Les pages non autorisées masquent seulement la fiche, sans la fermer.

Le blocage d'une autre opportunité ouverte est volontaire même si la fiche courante ne contient pas de modification non enregistrée.

## Impact
- Frontend uniquement.
- Aucun changement API ou modèle de données.
- Le comportement d'ouverture d'une opportunité est harmonisé entre kanban, activity, forecast et accounts.

## Suivi
Vérifier manuellement la navigation entre les pages autorisées et non autorisées avec une fiche ouverte.
