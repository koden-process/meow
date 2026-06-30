# Maintenance

## Tâches régulières

| Fréquence | Tâche |
|---|---|
| À chaque PR | Build frontend et backend, revue des changements de documentation. |
| Avant release | Tester Docker Compose, vérifier les variables, lire les logs. |
| Régulier | Sauvegarder MongoDB. |
| Régulier | Vérifier les performances des forecasts et activités. |
| Après changement métier | Mettre à jour `docs/`, `adr/` si décision structurante, `journal/` si changement non trivial. |

## Sauvegarde MongoDB

La stratégie de backup dépend de l'environnement d'hébergement. Pour une instance MongoDB classique :

```bash
mongodump --uri="<mongodb-uri>" --out=backup-meow
```

Restauration :

```bash
mongorestore --uri="<mongodb-uri>" backup-meow
```

Tester les restaurations sur un environnement non production.

### Restauration locale isolée d'une archive

Le script `backend/scripts/restore-local-mongodb-archive.sh` restaure une archive
`mongodump --archive --gzip` dans un conteneur dédié. Il ne réutilise ni le
MongoDB de Docker Compose ni une autre base locale.

```bash
./backend/scripts/restore-local-mongodb-archive.sh \
  --archive /chemin/vers/sauvegarde.archive.gz
```

Par défaut, le script :

- lance `mongo:7.0.34` dans `meow-local-restore` ;
- publie MongoDB uniquement sur `127.0.0.1:27018` ;
- conserve les données dans le volume `meow-local-restore-data` ;
- restaure `test.*` vers `meow_local_restore.*` ;
- ignore les collections `admin.*` et la collection technique `test.restore` ;
- contrôle les collections principales et leurs références structurelles ;
- signale sans les corriger les références historiques d'opportunités vers des
  utilisateurs ou étapes absents de la sauvegarde ;
- demande quel compte actif utiliser puis remplace uniquement son mot de passe
  dans la copie locale.

Si une restauration existe déjà, le script s'arrête. Pour recréer exclusivement
ce conteneur et ce volume dédiés :

```bash
./backend/scripts/restore-local-mongodb-archive.sh \
  --archive /chemin/vers/nouvelle-sauvegarde.archive.gz \
  --replace
```

La sauvegarde et les mots de passe ne doivent jamais être copiés dans le dépôt.
Les extensions `.archive`, `.archive.gz` et `.bson` sont ignorées par Git.

Pour démarrer Meow sur la copie restaurée :

```bash
cd backend
export MONGODB_URI=mongodb://127.0.0.1:27018/meow_local_restore
export SESSION_SECRET=local-dev-secret
npm start
```

Dans un second terminal :

```bash
cd frontend
export VITE_URL=http://127.0.0.1:9000
unset VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL
npm start -- --host 127.0.0.1
```

Le frontend est alors accessible sur `http://127.0.0.1:3119`.

Pour arrêter et supprimer la copie locale :

```bash
docker rm -f meow-local-restore
docker volume rm meow-local-restore-data
```

## Dépendances

Le projet possède deux arbres npm :

- `backend/package.json`
- `frontend/package.json`

Mettre à jour séparément et vérifier les builds correspondants.

## Documentation

La documentation doit évoluer avec le code :

- API modifiée : mettre à jour [API backend](../backend/api.md).
- Variable ajoutée : mettre à jour [Variables d'environnement](../getting-started/environment-variables.md).
- Workflow modifié : mettre à jour [Workflows système](../architecture/workflows.md).
- Déploiement modifié : mettre à jour [Déploiement](../infrastructure/deployment.md).
