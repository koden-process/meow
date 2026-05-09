# AGENTS.md — Meow

Document d'entrée pour tout agent de codage (humain ou IA) intervenant sur ce projet.
**Lecture obligatoire avant toute modification.**

---

## 1. Contexte projet

Meow est un outil de gestion de pipeline de vente open source, publié sous licence AGPLv3. Il permet à des équipes commerciales de gérer leurs opportunités (cards) dans un funnel visuel (lanes), de suivre les comptes clients (accounts), de construire des prévisions de vente (forecast) et d'analyser l'évolution du pipeline dans le temps.

Le projet est conçu pour être auto-hébergé. Il supporte la personnalisation visuelle (logo, couleurs, nom de l'application) via des variables d'environnement injectées au runtime, ce qui permet de le déployer sous une marque différente sans modifier le code.

Une instance de démonstration est disponible sur [https://hello.sales-funnel.app/](https://hello.sales-funnel.app/).

---

## 2. Carte du projet

| Dossier / Fichier | Rôle |
|---|---|
| `backend/src/` | Serveur Express TypeScript — API REST + logique métier |
| `backend/src/worker.ts` | Point d'entrée du backend — initialise Express, routes, connexion MongoDB |
| `backend/src/controllers/` | Handlers HTTP (un fichier par ressource) |
| `backend/src/entities/` | Modèles de données MongoDB (Card, Account, Lane, Team, User, Schema, Event…) |
| `backend/src/services/` | Logique métier complexe (ForecastService, ActivityService, TeamConfigService) |
| `backend/src/helpers/` | Utilitaires (DatabaseHelper, EntityHelper, TokenHelper, SchemaHelper…) |
| `backend/src/middlewares/` | Middlewares Express : auth JWT, validation AJV, gestion d'erreurs, headers |
| `backend/src/events/` | Architecture événementielle — EventStrategy, listeners, NodeEventStrategy |
| `backend/src/jobs/` | Jobs planifiés (notifyOnMissedFollowUpDatesTimeline) |
| `backend/src/errors/` | Hiérarchie d'erreurs typées (héritent de ApplicationError) |
| `backend/src/tests/` | Tests d'intégration AVA (nécessitent un serveur en cours d'exécution) |
| `frontend/src/` | Application React 18 + Redux Toolkit — interface utilisateur |
| `frontend/src/pages/` | Pages principales (Dashboard, Forecast, Accounts, Setup…) |
| `frontend/src/components/` | Composants réutilisables (card, account, lane, schema, forecast, modal…) |
| `frontend/src/store/` | Store Redux + sélecteurs |
| `frontend/src/reducers/` | Reducers Redux |
| `frontend/src/services/` | Appels API vers le backend |
| `frontend/src/interfaces/` | Types et interfaces TypeScript |
| `.dev/` | Outillage de migration de données inter-instances — voir section 9 |
| `docs/` | Documentation utilisateur (setup, API, fonctionnalités) |
| `adr/` | Architecture Decision Records — décisions passées documentées |
| `journal/` | Journal des modifications — trace de tout changement non trivial |
| `scripts/` | Scripts shell de démarrage local |
| `docker-compose.yml` | Composition Docker : app (build local) + apprc (image RC) + MongoDB |
| `Dockerfile` | Build multi-étapes : install + build frontend/backend + Nginx |
| `nginx.conf` | Configuration Nginx — proxy vers le backend, serve le frontend statique |
| `start.sh` | Script de démarrage du container Docker (injection des variables VITE_*) |
| `meow-api.yml` | Spécification OpenAPI de l'API (à vérifier si à jour) |
| `CHANGELOG.md` | Historique des versions — utile pour comprendre l'évolution du projet |

**Ports :**
- Backend (dev) : `9000`
- Frontend (dev Vite) : `5173`
- App complète (Docker) : `3117` (build local), `3118` (image release candidate)

---

## 3. Stack technique

| Couche | Technologie |
|---|---|
| Langage | TypeScript (frontend + backend) |
| Backend | Express.js v4, Node.js v18+ |
| Frontend | React 18, Redux Toolkit, React Router v6, Vite |
| UI | Chakra UI v3, MUI v7, @adobe/react-spectrum |
| Base de données | MongoDB v6 — driver natif (pas d'ORM) |
| Authentification | JWT (jsonwebtoken) + bcrypt |
| Validation | AJV (JSON Schema) côté backend |
| Tests | AVA v5 + Supertest (backend, intégration uniquement) |
| Logger | Pino |
| Date/heure | Luxon |
| CI/CD | GitHub Actions (build frontend + backend sur main) |
| Infrastructure | Docker + Nginx (reverse proxy + static files) |
| Analyses Python | venv + Jupyter (usage ponctuel, non lié à l'application) |

---

## 4. Ordre de lecture pour comprendre le projet

Pour s'orienter rapidement sur le projet, lire dans cet ordre :

1. `README.md` — vue d'ensemble et instructions d'installation
2. `CHANGELOG.md` — historique des décisions techniques majeures
3. `adr/README.md` puis les ADR dans l'ordre — pourquoi les choix structurants ont été faits
4. `backend/src/worker.ts` — point d'entrée du backend, toutes les routes sont enregistrées ici
5. `backend/src/entities/Card.ts` et `Account.ts` — les deux entités centrales du domaine
6. `backend/src/events/NodeEventStrategy.ts` — comprendre l'architecture événementielle
7. `frontend/src/store/Store.ts` — state management global du frontend
8. `frontend/src/pages/` — les pages principales pour comprendre le flux utilisateur
9. `docker-compose.yml` + `Dockerfile` + `start.sh` — comprendre le déploiement

---

## 5. Conventions

### Backend

- **Toutes les erreurs sont typées.** Ne jamais lancer `throw new Error(message)` dans un controller ou service. Utiliser les classes dans `backend/src/errors/` (ex : `EntityNotFoundError`, `ForbiddenOperationError`). Le middleware `handleError` les transforme automatiquement en réponse HTTP.

- **La validation de toutes les requêtes entrantes passe par AJV.** Chaque route avec body POST doit avoir un schema dans `backend/src/middlewares/schema-validation/`. Ne pas valider manuellement dans un controller.

- **Les effets de bord passent par les events.** Ne pas écrire l'historique ou déclencher des calculs directement dans un controller. Émettre un événement via `EventHelper` et créer un listener dédié.

- **`DatabaseHelper` est le seul point d'entrée vers MongoDB.** Ne pas instancier `MongoClient` ailleurs.

- **Les routes API authentifiées utilisent toujours la chaîne `verifyJwt → addEntityToHeader`.** Ces deux middlewares injectent l'utilisateur et l'équipe sur la requête.

### Frontend

- **Le state global passe par Redux.** Pas de state local pour les données métier — tout passe par le store et les actions.

- **Les sélecteurs sont dans `frontend/src/store/Store.ts` et `frontend/src/store/selectors.ts`.** Ne pas accéder à `store.getState()` directement dans les composants.

- **Les appels API sont centralisés dans `frontend/src/services/`.** Les composants ne font pas de fetch directement.

- **Les traductions sont dans `frontend/src/Translations.ts`.** Toute chaîne affichée à l'utilisateur doit passer par ce fichier.

### Général

- **Ne pas committer de secrets.** `MONGODB_URI` et `SESSION_SECRET` ne doivent jamais apparaître en clair dans un fichier commité. Les scripts `scripts/` contiennent des exemples — ne pas les modifier avec de vraies credentials.

- **Les `build/` sont gitignorés** mais présents dans le repo (`backend/build/`, `frontend/build/`). Ne pas modifier les fichiers compilés directement.

---

## 6. Démarrage local

### Option A — Docker (recommandé pour tester)

```bash
docker-compose up --build
```
L'application est accessible sur `http://localhost:3117`. Requiert Docker. Voir SK-01.

### Option B — Développement (backend + frontend séparés)

**Backend** (terminal 1) :
```bash
export MONGODB_URI=<uri-mongodb>
export SESSION_SECRET=<secret>
cd backend && npm install && npm run build && node build/worker.js
```
Le backend écoute sur `http://localhost:9000`.

**Frontend** (terminal 2) :
```bash
cd frontend && npm install
VITE_URL=http://localhost:9000 npm run dev
```
L'interface est accessible sur `http://localhost:5173`.

Voir SK-02 pour le détail complet.

### Variables d'environnement obligatoires (backend)

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `MONGODB_URI` | Oui | — | URI de connexion MongoDB |
| `SESSION_SECRET` | Oui | — | Secret pour signer les JWT |
| `PORT` | Non | `9000` | Port d'écoute du backend |
| `LOG_LEVEL` | Non | `info` | Niveau de log Pino |
| `NODE_ENV` | Non | — | `production` désactive CORS |
| `IP_ADDRESS` | Non | `127.0.0.1` | Adresse d'écoute |

### Variables de personnalisation (runtime Docker)

| Variable | Description |
|---|---|
| `VITE_CUSTOM_APP_NAME` | Nom de l'application (remplace "Meow Sales Pipeline") |
| `VITE_CUSTOM_FAVICON_URL` | URL du favicon |
| `VITE_CUSTOM_LOGO_URL` | URL du logo dans la navigation |
| `VITE_CUSTOM_LOGO_ALT` | Texte alternatif du logo |
| `VITE_CUSTOM_THEME_COLOR` | Couleur principale du thème |
| `VITE_CUSTOM_NAVIGATION_COLOR` | Couleur de la barre de navigation |

---

## 7. Règle du journal — OBLIGATOIRE

Toute modification non triviale doit être consignée dans `journal/YYYY-MM-DD-slug.md`.

**Définition de "non triviale" pour ce projet :**
- Ajout, suppression ou déplacement de fichiers de code
- Changement de structure des entités MongoDB (Card, Account, Lane, Schema, User, Team, Event…)
- Ajout ou retrait d'une dépendance npm (frontend ou backend)
- Décision technique non évidente à la lecture du code
- Correction d'un bug avec impact comportemental
- Changement de variable d'environnement ou de configuration
- Modification des routes API ou des contrats HTTP
- Ajout ou modification d'un job schedulé
- Opération de migration de données (`.dev/`)
- Tout refactor touchant plusieurs modules

Voir `journal/README.md` pour le template complet.

---

## 8. Fichiers clés à la racine

| Fichier | Rôle |
|---|---|
| `AGENTS.md` | Ce fichier — point d'entrée obligatoire pour tout agent |
| `SKILLS.md` | Recettes paramétriques pour les tâches récurrentes |
| `adr/` | Décisions d'architecture — à lire avant de toucher aux couches concernées |
| `journal/` | Trace de toutes les modifications non triviales |
| `README.md` | Documentation utilisateur et instructions d'installation |
| `CHANGELOG.md` | Historique des versions et changements notables |
| `docker-compose.yml` | Déploiement complet avec MongoDB |
| `Dockerfile` | Build de l'image Docker |
| `nginx.conf` | Configuration Nginx (proxy API + static files) |
| `start.sh` | Script d'init du container (injection des variables VITE_*) |
| `meow-api.yml` | Spécification OpenAPI — vérifier si à jour avant usage |
| `backend/api.rest` | Fichier de requêtes HTTP pour tester l'API manuellement |
| `backend/tsconfig.json` | Configuration TypeScript du backend |
| `frontend/vite.config.ts` | Configuration Vite du frontend |
| `frontend/.env.example` | Variables d'environnement frontend documentées |
| `.github/workflows/build_all.yml` | CI : build frontend + backend sur push/PR vers main |

---

## 9. Ce qui n'est pas dans ce fichier

- **Roadmap et tickets** — <À compléter : indiquer où sont gérés les tickets>
- **Documentation utilisateur** — dans `docs/` et sur <À compléter>
- **Dossier `.dev/`** — contient des fichiers de configuration par instance (erwan, paris, zn, zs) avec des IDs MongoDB, schemas et lanes. Il semble servir à des migrations de données inter-instances. L'usage exact est à documenter — voir `/.dev/fusion.md` comme point de départ.
- **Notebook Python** — `notebook/one-team.ipynb` sert à des analyses ponctuelles de données MongoDB. Non lié à l'application, utilise le venv à la racine.
