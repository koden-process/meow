# Authentification

Meow utilise une authentification locale basée sur JWT et bcrypt.

## Flux

1. Le frontend envoie `POST /public/login` avec `name` et `password`.
2. Le backend vérifie le mot de passe avec bcrypt.
3. `TokenHelper` signe un JWT avec `SESSION_SECRET`.
4. Le frontend stocke le token côté client.
5. Les appels `/api/*` envoient le token dans le header `Token`.
6. `verifyJwt` valide le token.
7. `addEntityToHeader` charge l'utilisateur et l'équipe.

## Header attendu

```http
Token: <jwt>
```

## Middlewares

| Middleware | Rôle |
|---|---|
| `verifyJwt` | Vérifie le JWT et extrait le payload. |
| `addEntityToHeader` | Charge les entités utilisateur/équipe associées. |
| `setHeaders` | Ajoute les headers de réponse applicatifs. |
| `isDatabaseConnectionEstablished` | Refuse la requête si MongoDB n'est pas connecté. |
| `rejectIfContentTypeIsNot` | Vérifie le `Content-Type` attendu. |
| `validateAgainst` | Valide le body avec AJV. |

## Secrets

`SESSION_SECRET` est obligatoire. Il doit être :

- long;
- aléatoire;
- différent par environnement;
- stocké dans le gestionnaire de secrets de l'infrastructure;
- jamais commité.

## Limites actuelles

- Pas de RBAC détaillé documenté.
- Pas de refresh token documenté.
- Des interfaces prévoient des authentifications `google` ou `github`, mais le flux actif documenté est l'authentification locale.

