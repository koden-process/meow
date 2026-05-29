# Développement local

Le mode développement lance le backend et le frontend séparément. Il est adapté aux contributions frontend/backend avec hot reload côté Vite.

## Backend

```bash
export MONGODB_URI=mongodb://localhost:27017/meow
export SESSION_SECRET=change-me
export PORT=9000
export LOG_LEVEL=info

cd backend
npm install
npm run build
node build/worker.js
```

Le backend écoute sur `http://127.0.0.1:9000` par défaut.

## Frontend

```bash
cd frontend
npm install
VITE_URL=http://localhost:9000 npm run dev
```

Le frontend écoute sur `http://localhost:5173` par défaut.

## Tests backend

Les tests AVA sont des tests d'intégration. Ils nécessitent un backend déjà démarré.

```bash
cd backend
npm run build
URL=http://localhost:9000 npx ava
```

Pour lancer un fichier précis :

```bash
URL=http://localhost:9000 npx ava build/tests/card.test.js
```

## Points d'attention

- Les tests créent des données en base et ne font pas de teardown complet.
- Le backend doit être rebuild avant d'exécuter les tests compilés.
- Sans `VITE_URL`, le frontend utilise l'origine courante, ce qui est utile en production derrière Nginx mais rarement suffisant en développement local.

