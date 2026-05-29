# FAQ

## Pourquoi MongoDB ?

Le projet a supprimé TypeORM au profit du driver MongoDB natif. La décision est documentée dans [ADR-0001](../../adr/0001-suppression-typeorm-driver-mongodb-natif.md).

## Où sont les routes API ?

Les routes exécutées sont enregistrées dans `backend/src/worker.ts`. Voir aussi [API backend](../backend/api.md).

## Pourquoi mes tokens deviennent invalides ?

Le JWT est signé avec `SESSION_SECRET`. Si ce secret change, les tokens existants ne sont plus valides.

## Comment personnaliser le nom ou le logo ?

Utiliser les variables `VITE_CUSTOM_*`. Voir [Variables d'environnement](../getting-started/environment-variables.md).

## Les tests backend démarrent-ils le serveur ?

Non. Le serveur backend doit être démarré séparément et l'URL passée via `URL`.

## Où écrire une décision d'architecture ?

Dans `adr/`, avec le format documenté dans [adr/README.md](../../adr/README.md).

## Où écrire une trace de changement ?

Dans `journal/`, pour toute modification non triviale.

