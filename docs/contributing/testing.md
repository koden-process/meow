# Tests

## Backend

Framework :

- AVA
- Supertest

Emplacement :

- `backend/src/tests/`

Les tests s'exécutent contre le build compilé et nécessitent un serveur backend en cours d'exécution.

```bash
cd backend
npm run build
URL=http://localhost:9000 npx ava
```

## Frontend

Le frontend possède une configuration issue de l'écosystème React Testing Library, mais la validation principale documentée dans la CI actuelle est le build :

```bash
cd frontend
npm run build
```

## CI

La CI build le frontend et le backend. Elle ne lance pas encore les tests d'intégration backend.

## Quand ajouter des tests

Ajouter ou adapter des tests lorsque :

- une route backend change;
- une règle métier change;
- une fusion ou migration touche plusieurs collections;
- un bug est corrigé avec impact comportemental;
- un service partagé est modifié.

