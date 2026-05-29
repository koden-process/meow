# Runbooks

## Redémarrer l'application Docker Compose

```bash
docker-compose down
docker-compose up -d --build
docker-compose logs -f app
```

Valider :

- l'interface répond;
- `/public/login` répond;
- aucune erreur MongoDB dans les logs.

## Vérifier la santé du backend

Il n'existe pas encore de route healthcheck dédiée. Vérification minimale :

```bash
curl -i http://localhost:9000/public/register/status
```

En Docker, passer par le port exposé :

```bash
curl -i http://localhost:3117/public/register/status
```

## Relancer les tests d'intégration

Terminal backend :

```bash
export MONGODB_URI=mongodb://localhost:27017/meow
export SESSION_SECRET=change-me
cd backend
npm run build
node build/worker.js
```

Terminal tests :

```bash
cd backend
URL=http://localhost:9000 npx ava
```

## Changer l'identité visuelle Docker

```bash
docker run -d \
  -e MONGODB_URI="<uri>" \
  -e SESSION_SECRET="<secret>" \
  -e VITE_CUSTOM_APP_NAME="Mon CRM" \
  -e VITE_CUSTOM_LOGO_URL="https://example.com/logo.svg" \
  -e VITE_CUSTOM_NAVIGATION_COLOR="#067BC2" \
  -p 8080:80 \
  meow:local
```

## Restaurer une sauvegarde MongoDB

1. Arrêter l'application.
2. Restaurer la base sur l'instance cible.
3. Redémarrer l'application avec la même `MONGODB_URI`.
4. Vérifier login, dashboard, accounts et forecast.

