# 2026-05-10 — Dédoublonnage manuel des contacts

## Contexte

L'issue https://github.com/koden-process/Projet-Unikalo-Meow/issues/117 demande de dédoublonner les contacts. Le dédoublonnage doit rester une action explicite de l'utilisateur, avec un outil de fusion et non une suppression automatique.

## Changement

- Ajout de `backend/src/services/AccountMergeService.ts`.
- Ajout de `POST /api/accounts/:id/merge`, où `:id` est le contact conservé et `sourceAccountId` le doublon à fusionner.
- Ajout de `frontend/src/components/account/AccountDeduplicationModal.tsx`.
- Ajout du bouton `Dédoublonner` sur la page Répertoire.
- Ajout des libellés frontend dans `frontend/src/Translations.ts`.

## Décisions implicites

La fusion ne mélange pas automatiquement les champs métier du doublon dans le contact conservé. L'utilisateur choisit le contact maître, puis l'outil rattache les chaînes de dépendance au maître.

Les chaînes reprises sont :

- attributs de référence des opportunités vers le contact fusionné ;
- attributs de référence d'autres contacts vers le contact fusionné ;
- index inverse `Account.references` utilisé par la fiche contact ;
- favoris utilisateurs ;
- historique/commentaires du contact fusionné.

Le doublon est marqué `deleted` au lieu d'être supprimé physiquement.

## Impact

- Nouveau contrat HTTP backend : `POST /api/accounts/:id/merge`.
- Aucun changement de schéma MongoDB requis.
- Les clients doivent rafraîchir contacts, opportunités et utilisateurs après fusion pour récupérer les références réécrites.
