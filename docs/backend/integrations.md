# Intégrations backend

## API REST

L'intégration principale est l'API REST exposée par le backend. Elle permet notamment :

- créer des leads via `POST /api/cards`;
- créer des comptes via `POST /api/accounts`;
- lire les schemas via `GET /api/schemas`;
- récupérer les forecasts;
- gérer les transferts d'opportunités.

Voir [API backend](api.md).

## OpenAPI

Le fichier `meow-api.yml` fournit une base OpenAPI. Il doit être vérifié contre `backend/src/worker.ts` avant usage en génération de client, car certaines routes récentes peuvent ne pas y être reflétées.

## Intégrations d'équipe

L'entité `Team` contient un champ `integrations?: Integration[]`.

```typescript
interface Integration {
  key: string;
  attributes: { [key: string]: string | number | null | boolean };
}
```

Les routes suivantes existent :

- `POST /api/teams/:id/integrations`
- `POST /api/teams/:id/allow-team-registration`

## Import de leads depuis un site

Flux recommandé :

1. Créer un utilisateur système dans `/setup`.
2. Créer une lane dédiée, par exemple `Website Leads`.
3. Appeler `POST /public/login` pour obtenir un token.
4. Appeler `POST /api/cards` avec `laneName` ou `laneId`.

Exemple :

```json
{
  "name": "Merida Industria",
  "amount": 40000,
  "laneName": "Website Leads"
}
```

## Personnalisation runtime

La personnalisation visuelle est exposée via variables `VITE_CUSTOM_*` et injectée au frontend Docker par `start.sh`. Voir [Variables d'environnement](../getting-started/environment-variables.md).

