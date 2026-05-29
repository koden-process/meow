# Monitoring

## État actuel

L'observabilité est principalement basée sur :

- logs Pino côté backend;
- logs Nginx dans le conteneur;
- logs Docker/Compose;
- erreurs frontend visibles dans la console navigateur et via les modales applicatives.

## Logs backend

Le niveau est contrôlé par `LOG_LEVEL`.

```bash
LOG_LEVEL=debug node build/worker.js
```

En Docker :

```bash
docker-compose logs -f app
```

## Signaux à surveiller

| Signal | Pourquoi |
|---|---|
| Erreurs de connexion MongoDB | Le backend quitte si `MONGODB_URI` est absent et doit refuser les requêtes si la connexion est indisponible. |
| Erreurs `InvalidTokenError` ou auth | Peut indiquer une rotation de secret ou des sessions invalides. |
| Erreurs dans listeners | Les événements in-process ne sont pas rejoués automatiquement. |
| Durée des requêtes forecast | Les agrégations MongoDB peuvent devenir coûteuses avec le volume. |
| Job quotidien | Vérifier qu'il s'exécute et ne se chevauche pas. |

## À formaliser

- Métriques applicatives.
- Healthcheck HTTP dédié.
- Alerting.
- Tracing distribué.
- Dashboard d'exploitation.

