# Docker

## Dockerfile

Le `Dockerfile` :

1. part de `node:24`;
2. installe Nginx et `gettext` pour `envsubst`;
3. copie `nginx.conf`;
4. copie `frontend/` et `backend/`;
5. installe les dépendances npm des deux applications;
6. build le frontend et copie le résultat dans `/var/www/html`;
7. copie `start.sh`;
8. expose le port `80`;
9. démarre `/start.sh`.

## start.sh

`start.sh` :

- définit des valeurs vides pour les variables `VITE_CUSTOM_*` absentes;
- substitue ces variables dans `/var/www/html/env-config.js`;
- démarre Nginx;
- lance le backend avec `npm start`.

## Nginx

`nginx.conf` :

- sert le frontend statique depuis `/var/www/html`;
- redirige les routes SPA vers `index.html`;
- proxy `/public/` vers `http://localhost:9000`;
- proxy `/api/` vers `http://localhost:9000`.

## Docker Compose

`docker-compose.yml` démarre :

| Service | Description |
|---|---|
| `app` | Image construite depuis le dépôt courant. |
| `db` | MongoDB. |
| `apprc` | Image release candidate existante. |

Ports :

- `3117:80` pour `app`;
- `3118:80` pour `apprc`.

## Points d'attention

- Aucun volume MongoDB n'est déclaré actuellement dans `docker-compose.yml`.
- Le `SESSION_SECRET` généré dans Compose peut changer au redémarrage selon le mode d'exécution; en production, fournir un secret stable.
- Les logs de `start.sh` affichent les variables de personnalisation; ne jamais y placer de secret.

