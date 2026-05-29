# Démarrage rapide

## Option recommandée : Docker

```bash
docker-compose up --build
```

Ouvrir ensuite :

- `http://localhost:3117` pour l'image construite localement.
- `http://localhost:3118` pour l'image release candidate configurée dans `docker-compose.yml`.

Pour arrêter :

```bash
docker-compose down
```

## Premier accès

1. Ouvrir l'application.
2. Créer le premier utilisateur.
3. Configurer les étapes du pipeline dans `/setup`.
4. Créer ou adapter les schemas d'opportunités et de comptes.
5. Ajouter des opportunités sur le tableau principal.

## Validation rapide

- Le frontend affiche l'écran de login.
- Le backend ne loggue pas d'erreur `MONGODB_URI` ou `SESSION_SECRET`.
- Les routes `/public/login` et `/api/*` passent par Nginx en mode Docker.

## Arrêt et nettoyage

```bash
docker-compose down
```

La base MongoDB du `docker-compose.yml` n'a pas de volume persistant déclaré. Les données peuvent donc être perdues si le conteneur MongoDB est supprimé.

