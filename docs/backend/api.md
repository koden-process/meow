# API backend

L'API REST est enregistrée dans `backend/src/worker.ts`. La spécification `meow-api.yml` existe, mais le code de `worker.ts` doit être vérifié comme source d'exécution avant génération de clients ou documentation contractuelle.

## Conventions HTTP

- Routes publiques : `/public/*`
- Routes authentifiées : `/api/*`
- Authentification : header HTTP `Token: <jwt>`
- Corps JSON : `Content-Type: application/json`
- Méthodes utilisées : `GET`, `POST`, `DELETE`
- Validation : AJV via les schemas de `backend/src/middlewares/schema-validation/`

## Routes publiques

| Méthode | Route | Usage |
|---|---|---|
| `POST` | `/public/login` | Authentifie un utilisateur et retourne un JWT. |
| `POST` | `/public/register` | Crée une première équipe ou inscrit via invitation. |
| `GET` | `/public/register/invite` | Récupère les informations d'une invitation. |
| `GET` | `/public/register/status` | Indique l'état d'inscription initiale. |
| `POST` | `/public/validate-token` | Valide un token existant. |

## Routes authentifiées principales

| Ressource | Routes |
|---|---|
| Cards | `GET /api/cards`, `POST /api/cards`, `GET /api/cards/:id`, `POST /api/cards/:id`, `GET/POST /api/cards/:id/events` |
| Accounts | `GET /api/accounts`, `POST /api/accounts`, `GET /api/accounts/:id`, `POST /api/accounts/:id`, `POST /api/accounts/:id/merge`, `GET/POST /api/accounts/:id/events` |
| Lanes | `GET /api/lanes`, `POST /api/lanes`, `POST /api/lanes/:id`, `GET /api/lanes/statistic` |
| Users | `GET /api/users`, `POST /api/users`, `POST /api/users/:id`, `POST /api/users/:id/board`, `GET /api/users/:id/flags`, `POST /api/users/:id/favorites`, `POST /api/users/:id/password` |
| Teams | `GET /api/teams`, `GET /api/teams/:id`, `POST /api/teams/:id`, `POST /api/teams/:id/integrations`, `POST /api/teams/:id/allow-team-registration` |
| Forecast | `GET /api/forecast/achieved`, `GET /api/forecast/predicted`, `GET /api/forecast/list`, `GET /api/forecast/time-series`, `GET /api/forecast/generated` |
| Schemas | `GET /api/schemas`, `POST /api/schemas` |
| Activities | `GET /api/activities` |
| Opportunity transfers | `GET /api/opportunity-transfers`, `POST /api/opportunity-transfers`, `GET /api/opportunity-transfers/:id`, `POST /api/opportunity-transfers/:id/accept`, `POST /api/opportunity-transfers/:id/decline` |
| Team config | Routes montées via `TeamConfigRoutes` sous `/api` |

## Exemple : login

```bash
curl -X POST http://localhost:9000/public/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Website","password":"change-me"}'
```

Réponse attendue : un JSON contenant au minimum un `token`, un `user` et une `team`.

## Exemple : créer une opportunité

```bash
curl -X POST http://localhost:9000/api/cards \
  -H "Content-Type: application/json" \
  -H "Token: <jwt>" \
  -d '{
    "name": "Merida Industria",
    "amount": 40000,
    "laneName": "Website Leads"
  }'
```

Le body accepte une lane par `laneId` ou `laneName` selon la validation backend.

## Exemple : créer un compte

```bash
curl -X POST http://localhost:9000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Token: <jwt>" \
  -d '{
    "name": "Merida Industria",
    "attributes": {
      "712f854e-73e1-1bec-cd54-7f920a846574": true
    }
  }'
```

## Erreurs

Les nouvelles erreurs backend doivent hériter de `ApplicationError`. Le middleware `handleError` transforme ces erreurs en réponses HTTP. Éviter `throw new Error(...)` dans les controllers et services exposés aux routes.

