# Déploiement

Le déploiement standard actuel repose sur une image Docker unique qui contient :

- le backend Node/Express;
- le build statique frontend;
- Nginx comme serveur HTTP et reverse proxy.

## Déploiement Docker simple

```bash
docker build -t meow:local .

docker run -d \
  --name meow \
  -e MONGODB_URI="mongodb://<host>:27017/meow" \
  -e SESSION_SECRET="<secret>" \
  -e PORT=9000 \
  -e LOG_LEVEL=info \
  -e NODE_ENV=production \
  -p 8080:80 \
  --restart always \
  meow:local
```

Ouvrir `http://localhost:8080`.

## Déploiement avec Compose

```bash
docker-compose up -d --build
```

Services :

- `app` : build local exposé sur `3117`.
- `apprc` : image `killiankopp/meow:1.5` exposée sur `3118`.
- `db` : MongoDB.

## Production

Pour une production réelle :

- utiliser un MongoDB persistant et sauvegardé;
- injecter `SESSION_SECRET` via un gestionnaire de secrets;
- configurer TLS en amont ou dans le reverse proxy;
- définir une stratégie de sauvegarde/restauration;
- surveiller les logs backend et Nginx;
- éviter d'exposer MongoDB publiquement.

## Personnalisation sans rebuild

Les variables `VITE_CUSTOM_*` sont injectées au démarrage du conteneur par `start.sh`. Il n'est pas nécessaire de reconstruire l'image pour changer le logo, le nom ou les couleurs.

