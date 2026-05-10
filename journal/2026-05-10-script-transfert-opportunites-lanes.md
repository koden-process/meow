# 2026-05-10 — Script de transfert des opportunités entre colonnes

## Contexte

Une opération de maintenance MongoDB doit permettre de transférer les opportunités d'une colonne kanban vers une autre avant suppression de l'ancienne colonne.

Dans Meow, une colonne correspond à une `Lane` et une opportunité correspond à une `Card`. Le rattachement courant est porté par `Cards.laneId`. Les utilisateurs peuvent aussi avoir un `Users.board` qui conserve l'ordre visuel des cartes par colonne.

## Changement

- Ajout de `backend/scripts/move-cards-between-lanes.mjs`.
- Le script résout les colonnes source et cible par identifiant ou par nom, avec filtres optionnels par équipe et board.
- Le script fonctionne en dry-run par défaut et nécessite `--execute` pour écrire.
- Lors de l'exécution, il met à jour `Cards.laneId`, nettoie `Users.board` et insère des événements `card-moved` sauf si `--no-events` est fourni.

## Décisions implicites

Le script ne supprime pas l'ancienne colonne. La suppression doit rester une action séparée après vérification du transfert.

Les opportunités avec `status: deleted` sont exclues par défaut, comme dans la liste principale de l'API. Elles peuvent être incluses explicitement via `--include-deleted`.

## Impact

- Aucun changement de contrat API.
- Aucun changement de schéma MongoDB.
- Migration manuelle possible sur base locale ou distante en passant `MONGODB_URI`.
- Point d'attention : exécuter d'abord en dry-run et faire un backup avant toute base en ligne.

## Suivi

- Valider les identifiants exacts des colonnes source et cible sur la base en ligne avant exécution.
