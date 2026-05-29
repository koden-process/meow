# Bonnes pratiques de sécurité

## Backend

- Toutes les routes POST avec body doivent valider via AJV.
- Les erreurs doivent être typées avec `ApplicationError`.
- Les routes authentifiées doivent utiliser la chaîne `verifyJwt -> addEntityToHeader`.
- Les filtres MongoDB doivent inclure `teamId` dès qu'une entité métier est lue ou modifiée.
- Ne jamais exposer les attributs sensibles d'authentification dans les réponses.

## CORS

Dans `backend/src/worker.ts`, CORS est ouvert en développement :

```typescript
origin: '*'
```

En `NODE_ENV=production`, l'origine est désactivée :

```typescript
corsOptions.origin = false;
```

En production Docker, le frontend et l'API sont servis sur la même origine via Nginx.

## Frontend

- Ne jamais stocker de secret backend dans le frontend.
- Les variables `VITE_*` sont publiques par nature.
- Les erreurs techniques doivent être transformées en messages utilisateur via les helpers existants.

## Déploiement

- Servir l'application derrière HTTPS.
- Ne pas exposer MongoDB à Internet.
- Utiliser un `SESSION_SECRET` robuste.
- Sauvegarder MongoDB.
- Surveiller les erreurs d'authentification répétées.

## Données

Meow traite des données commerciales potentiellement sensibles. Les exports, backups et environnements de test doivent respecter les règles internes de confidentialité.

