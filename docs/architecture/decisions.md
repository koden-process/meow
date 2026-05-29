# Décisions d'architecture

Les décisions structurantes sont conservées dans le dossier [adr/](../../adr/README.md). Cette page sert d'index fonctionnel pour les relier au système actuel.

## Décisions acceptées

| ADR | Décision | Impact |
|---|---|---|
| [ADR-0001](../../adr/0001-suppression-typeorm-driver-mongodb-natif.md) | Suppression de TypeORM au profit du driver MongoDB natif. | Meow assume un couplage fort à MongoDB. `DatabaseHelper` devient le point d'entrée unique. |
| [ADR-0002](../../adr/0002-architecture-evenementielle-node-eventemitter.md) | Architecture événementielle via Node EventEmitter. | Les effets de bord métier passent par `EventStrategy`, `EventHelper` et les listeners. |

## Décisions opérationnelles actuelles

| Sujet | Décision actuelle | Remarque |
|---|---|---|
| Déploiement | Image Docker unique frontend + backend + Nginx. | Adapté à l'auto-hébergement et aux instances dédiées. |
| Frontend | React + Vite. | Migration depuis CRA déjà effectuée. |
| Validation | AJV côté backend. | Les schemas de requête vivent dans `backend/src/middlewares/schema-validation/`. |
| Tests | Intégration backend AVA contre serveur lancé. | Pas encore de pipeline de tests avec MongoDB éphémère en CI. |

## Quand écrire une nouvelle ADR

Créer une ADR pour toute décision difficile à comprendre depuis le code seul :

- changement de base de données ou stratégie de migration;
- changement d'authentification;
- introduction d'un broker ou d'un worker externe;
- modification profonde du modèle de données;
- stratégie multi-tenant ou changement d'isolation client;
- refonte frontend structurante.

