# ADR-0002 — Architecture événementielle via Node EventEmitter pour l'historique

- Statut : Accepted
- Date : 2023-07-18
- Décideurs : <À compléter>
- Tags : événements, historique, découplage, architecture

## Contexte

L'historique des modifications sur les Cards (opportunités) et les Accounts (comptes) doit être persisté en base à chaque changement. Avant cette décision, les écritures d'historique étaient faites directement dans les controllers, couplant la logique métier avec la création d'événements.

Cette approche posait deux problèmes : les controllers devenaient complexes à maintenir, et l'ajout d'un nouveau type d'effet de bord (notification, calcul de forecast) nécessitait de modifier des controllers déjà chargés.

## Décision

Introduire une stratégie événementielle basée sur l'EventEmitter Node.js natif. Les controllers émettent des événements de domaine (ex : `card-moved`, `account-updated`). Des listeners dédiés s'abonnent à ces événements et prennent en charge les effets de bord : écriture d'historique, mise à jour des forecasts, gestion des références.

L'abstraction `EventStrategy` / `NodeEventStrategy` permet de remplacer l'implémentation (ex : passer à un broker externe) sans modifier les émetteurs.

## Conséquences

**Positives :**
- Controllers allégés — ils ne font qu'émettre, pas persister l'historique
- Ajout d'un nouvel effet de bord = ajout d'un listener, sans toucher au code existant
- L'abstraction `EventStrategy` laisse la porte ouverte à un broker externe

**Négatives :**
- Flux d'exécution moins linéaire — un bug dans un listener peut être difficile à tracer
- En cas d'erreur dans un listener, l'événement est perdu (pas de retry, pas de dead-letter queue avec l'implémentation actuelle)
- Les tests d'intégration doivent tenir compte des effets de bord asynchrones éventuels

## Alternatives considérées

**Écritures directes dans les controllers** — rejeté car trop couplé : chaque controller devait connaître tous les effets de bord de ses actions.

**Message broker externe (RabbitMQ, Redis Streams)** — rejeté pour cette version car il aurait ajouté une dépendance d'infrastructure. L'abstraction `EventStrategy` permet de passer à cette solution ultérieurement si le besoin se présente.

## Liens

- Entrée CHANGELOG : `2023-07-18` — "Opportunity and Account histories are now created in an event-driven approach"
- `backend/src/events/EventStrategy.ts` — interface de la stratégie
- `backend/src/events/NodeEventStrategy.ts` — implémentation avec Node EventEmitter
- `backend/src/events/CardEventListener.ts`, `AccountEventListener.ts`, `LaneEventListener.ts` — listeners actifs
- `backend/src/helpers/EventHelper.ts` — utilitaire d'émission
