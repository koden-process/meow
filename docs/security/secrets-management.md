# Gestion des secrets

## Secrets connus

| Secret | Usage | Où l'injecter |
|---|---|---|
| `MONGODB_URI` | Connexion MongoDB | Environnement backend ou Docker. |
| `SESSION_SECRET` | Signature JWT | Environnement backend ou Docker. |

## Règles

- Ne jamais committer de secrets.
- Ne pas mettre de secrets réels dans `scripts/`, `.env.example`, `docker-compose.yml` ou la documentation.
- Utiliser un secret stable par environnement.
- Changer `SESSION_SECRET` invalide les JWT existants.
- Restreindre l'accès réseau à MongoDB.

## Développement

Exemple local acceptable :

```bash
export MONGODB_URI=mongodb://localhost:27017/meow
export SESSION_SECRET=local-dev-secret
```

## Production

Utiliser le gestionnaire de secrets de l'hébergeur :

- Docker secrets;
- variables d'environnement protégées;
- vault externe;
- secret manager cloud.

## Rotation

La rotation de `SESSION_SECRET` doit être planifiée car elle déconnecte les utilisateurs. Une stratégie de rotation sans interruption n'est pas encore documentée.

