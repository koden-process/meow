# SKILLS.md — Recettes pour Meow

Recettes paramétriques pour les tâches récurrentes sur ce projet.
Numérotées `SK-NN`. À compléter au fur et à mesure.

---

## SK-01 — Lancer le projet en local (Docker, mode production)

**Contexte :** démarrer l'application complète (backend + frontend + MongoDB) en une commande, pour tester le comportement en conditions proches de la production.

### Prérequis

- Docker et Docker Compose installés
- Port `3117` disponible sur la machine hôte

### Étapes

1. Se placer à la racine du projet
2. Lancer l'ensemble des services :
   ```bash
   docker-compose up --build
   ```
3. L'application est accessible sur `http://localhost:3117`

Le service `app` (build local) tourne sur le port `3117`. Le service `apprc` (image release candidate `killiankopp/meow:1.5`) tourne sur le port `3118` — il partage la même base MongoDB.

Pour lancer en arrière-plan :
```bash
docker-compose up -d --build
```

Pour arrêter :
```bash
docker-compose down
```

### Validation

- `http://localhost:3117` affiche l'interface de login
- Les logs du backend (`docker-compose logs app`) ne contiennent pas d'erreur `MONGODB_URI` ou `SESSION_SECRET`

### Notes

Les variables `MONGODB_URI` et `SESSION_SECRET` sont générées automatiquement dans `docker-compose.yml`. Pour pointer vers une instance MongoDB externe, modifier la valeur de `MONGODB_URI` dans `docker-compose.yml` ou passer `-e MONGODB_URI=...` à `docker run`.

---

## SK-02 — Lancer le projet en mode développement (backend + frontend séparés)

**Contexte :** développement actif, avec hot-reload sur le frontend et rebuild manuel du backend.

### Prérequis

- Node.js v18+ installé
- Une instance MongoDB accessible (locale ou distante)
- Variables d'environnement backend définies (voir étape 1)

### Étapes

**Terminal 1 — Backend**

1. Définir les variables d'environnement :
   ```bash
   export MONGODB_URI=<uri-vers-mongodb>
   export SESSION_SECRET=<secret-quelconque>
   export PORT=9000
   export LOG_LEVEL=info
   ```
   (Ou utiliser le script `scripts/start-backend.sh` après avoir mis à jour ses variables.)

2. Se placer dans `backend/` et démarrer :
   ```bash
   cd backend
   npm install
   npm run build
   node build/worker.js
   ```
   Le serveur écoute sur `http://localhost:9000`.

**Terminal 2 — Frontend**

3. Se placer dans `frontend/` et démarrer Vite :
   ```bash
   cd frontend
   npm install
   VITE_URL=http://localhost:9000 npm run dev
   ```
   Vite démarre sur `http://localhost:5173` (port par défaut).

### Validation

- `http://localhost:5173` affiche l'interface de login
- Les requêtes API dans les DevTools pointent vers `http://localhost:9000`
- Aucune erreur `MONGODB_URI not set` dans les logs backend

### Notes

Sans `VITE_URL`, le frontend essaie de contacter le backend sur la même origine (utile en production derrière Nginx). En développement, `VITE_URL` est obligatoire.

Pour rebuild automatique du backend au fil des modifications TypeScript, remplacer `npm run build && node build/worker.js` par un watcher (ex : `npx tsc --watch` dans un troisième terminal).

---

## SK-03 — Lancer les tests d'intégration (backend)

**Contexte :** valider le comportement de l'API avant un merge ou après une modification du backend. Les tests AVA nécessitent un serveur backend en cours d'exécution.

### Prérequis

- Le backend est démarré et accessible (voir SK-02, Terminal 1)
- L'URL du serveur est connue (ex : `http://localhost:9000`)

### Étapes

1. Se placer dans `backend/`
2. Builder d'abord (les tests s'exécutent sur le build compilé) :
   ```bash
   npm run build
   ```
3. Lancer les tests en fournissant l'URL du serveur :
   ```bash
   URL=http://localhost:9000 npx ava
   ```

Pour lancer un fichier de test spécifique :
```bash
URL=http://localhost:9000 npx ava build/tests/card.test.js
```

Pour voir la sortie détaillée :
```bash
URL=http://localhost:9000 npx ava --tap
```

### Validation

Tous les tests passent avec `✔` dans la sortie. Aucun `✘`.

### Notes

Les tests sont **sériels** (`test.serial`) car ils partagent un état serveur (création d'utilisateur, login, etc.). Ne pas les lancer en parallèle. Chaque suite de tests crée son propre utilisateur de test avec un nom aléatoire — les données restent en base après les tests (pas de teardown automatique).

---

## SK-04 — Ajouter un nouvel endpoint REST au backend

**Contexte :** ajouter une nouvelle route HTTP (GET, POST, DELETE) au backend Express.

### Étapes

1. **Créer le controller** dans `backend/src/controllers/` :
   ```typescript
   // MonNouveauController.ts
   export class MonNouveauController {
     static async handle(req: AuthenticatedRequest, res: Response) {
       // logique métier
       res.status(200).json({ ... });
     }
   }
   ```

2. **Créer le schéma de validation de la requête** dans `backend/src/middlewares/schema-validation/` si la route accepte un body (POST) :
   ```typescript
   // MonNouveauRequestSchema.ts
   export const MonNouveauRequestSchema = { ... }; // JSON Schema AJV
   ```

3. **Enregistrer la route** dans `backend/src/worker.ts` en suivant les patterns existants :
   ```typescript
   app.post(
     '/api/mon-endpoint',
     verifyJwt,
     addEntityToHeader,
     rejectIfContentTypeIsNot('application/json'),
     validateAgainst(MonNouveauRequestSchema),
     MonNouveauController.handle
   );
   ```
   Pour une route publique (sans auth) : utiliser `/public/` et omettre `verifyJwt` et `addEntityToHeader`.

4. **Rebuilder** :
   ```bash
   cd backend && npm run build
   ```

5. **Écrire le test d'intégration** dans `backend/src/tests/` si la route est critique.

### Validation

- `npm run build` sans erreur TypeScript
- Appel manuel via `backend/api.rest` ou les fichiers `.http` dans `debug/`
- Le test d'intégration correspondant passe

### Notes

- `verifyJwt` injecte le token JWT décodé dans `req.headers`
- `addEntityToHeader` charge l'utilisateur et l'équipe depuis MongoDB et les attache à la requête
- Toutes les erreurs doivent être des instances de `ApplicationError` (voir `backend/src/errors/`) — le middleware `handleError` les transforme en réponse HTTP appropriée
- En production, CORS est désactivé (`origin: false`) — les routes API ne sont accessibles que depuis la même origine

---

## SK-05 — Créer un nouveau type d'événement de domaine

**Contexte :** ajouter un nouvel effet de bord déclenché quand une entité est modifiée (ex : notification, calcul, mise à jour d'une entité liée).

### Étapes

1. **Déclarer le nouveau type d'événement** dans `backend/src/entities/EventType.ts` si l'event doit être persisté.

2. **Créer le listener** dans `backend/src/events/` :
   ```typescript
   // MonNouveauListener.ts
   export class MonNouveauListener {
     static register(strategy: EventStrategy) {
       strategy.on('mon-evenement', async (payload) => {
         // traitement
       });
     }
   }
   ```

3. **Enregistrer le listener** dans `backend/src/worker.ts` au moment où `EventHelper` est initialisé (chercher les autres `register(strategy)` existants).

4. **Émettre l'événement** depuis le controller ou le service concerné via `EventHelper` :
   ```typescript
   EventHelper.emit('mon-evenement', { ...payload });
   ```

### Validation

- L'événement est émis et le listener s'exécute (vérifiable dans les logs avec `LOG_LEVEL=debug`)
- Aucune régression sur les listeners existants

### Notes

L'implémentation actuelle utilise `NodeEventStrategy` (EventEmitter synchrone). Les listeners s'exécutent dans le même processus. En cas d'erreur dans un listener, l'erreur est catchée par `uncaughtException` mais l'événement est perdu — prévoir un try/catch dans les listeners critiques.

---

## SK-06 — Builder et déployer avec Docker (image custom)

**Contexte :** publier une nouvelle image Docker et la déployer sur un serveur.

### Étapes

1. **Builder l'image** depuis la racine du projet :
   ```bash
   docker build -t <registry>/<nom>:<tag> .
   ```
   Exemple :
   ```bash
   docker build -t killiankopp/meow:2.0 .
   ```

2. **Pousser l'image** :
   ```bash
   docker push killiankopp/meow:2.0
   ```

3. **Déployer sur le serveur** :
   ```bash
   docker run -d \
     --name meow \
     -e MONGODB_URI="<uri>" \
     -e SESSION_SECRET="<secret>" \
     -e PORT=9000 \
     -e LOG_LEVEL=info \
     -e NODE_ENV=production \
     -p <port-hote>:80 \
     --restart always \
     killiankopp/meow:2.0
   ```

   Ou via `docker-compose up` après avoir mis à jour la version de l'image dans `docker-compose.yml`.

### Validation

- L'interface est accessible sur `http://<serveur>:<port-hote>`
- `docker logs meow` ne contient pas d'erreur de démarrage

### Notes

Le `Dockerfile` build le frontend pendant la construction de l'image (les variables `VITE_*` de personnalisation sont injectées au runtime via `start.sh` et `env-config.js`, pas au build). Il n'est donc pas nécessaire de rebuilder l'image pour changer le logo ou la couleur de navigation — passer simplement les variables `-e VITE_CUSTOM_*` au `docker run`.

---

## SK-07 — Ajouter un champ personnalisé (attribut de Schema)

**Contexte :** les Cards (opportunités) et les Accounts (comptes) supportent des champs personnalisables via le Schema. Cette recette couvre l'ajout d'un nouveau type d'attribut.

### Étapes

1. **Définir le nouveau type** dans `backend/src/entities/Attribute.ts` (ou l'équivalent frontend dans `frontend/src/interfaces/`).

2. **Mettre à jour la validation AJV** du SchemaRequestSchema (`backend/src/middlewares/schema-validation/SchemaRequestSchema.ts`) pour accepter le nouveau type.

3. **Mettre à jour le SchemaController** (`backend/src/controllers/SchemaController.ts`) si le nouveau type nécessite un traitement spécial à la sauvegarde.

4. **Mettre à jour le SchemaHelper** (`backend/src/helpers/SchemaHelper.ts`) si le nouveau type nécessite un rendu ou une validation spécifique.

5. **Ajouter le composant frontend** dans `frontend/src/components/schema/` pour l'affichage et l'édition du nouveau type dans l'éditeur de schema drag-and-drop.

6. **Ajouter le rendu du champ** dans les composants card et account (`frontend/src/components/card/`, `frontend/src/components/account/`).

### Validation

- Le nouveau type apparaît dans l'éditeur de schema
- Les valeurs sont correctement sauvegardées et rechargées
- Les attributs existants ne sont pas affectés

### Notes

Les clés d'attribut sont des UUID générés côté client et stockés sur les entités Card et Account. Un attribut supprimé du Schema ne supprime pas les données existantes sur les entités — prévoir une migration si nécessaire.
