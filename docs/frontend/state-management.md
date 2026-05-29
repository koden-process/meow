# State management

Le state global frontend utilise Redux Toolkit.

## Store

Le store est défini dans `frontend/src/store/Store.ts`.

Middlewares enregistrés :

- `redux-logger`
- `cardLaneListener`
- `cardUpdateListener`
- `cardDeleteListener`

## Sélecteurs

Les sélecteurs principaux sont exportés depuis :

- `frontend/src/store/Store.ts`
- `frontend/src/store/selectors.ts`

Règle : les composants doivent utiliser les sélecteurs plutôt qu'accéder directement à `store.getState()`.

## Données métier globales

Le store contient notamment :

- session;
- team;
- users;
- cards;
- accounts;
- lanes;
- schemas;
- board;
- état UI.

## Listeners Redux

Les listeners mettent à jour localement le board et les cards après certaines actions :

- changement de lane;
- mise à jour de card;
- suppression de card.

## Bonnes pratiques

- Utiliser `useSelector` avec les sélecteurs existants.
- Ajouter un sélecteur si une logique de lecture se répète.
- Éviter le state local pour les données métier persistées.
- Réserver le state local aux états strictement UI : ouverture de modale, saisie temporaire, focus, filtres locaux.

