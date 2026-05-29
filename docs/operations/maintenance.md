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

