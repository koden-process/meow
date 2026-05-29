# Installation

## Prérequis

| Outil | Usage |
|---|---|
| Node.js 18+ | Build et exécution backend/frontend en développement. |
| npm | Installation des dépendances. |
| MongoDB | Base de données applicative. |
| Docker et Docker Compose | Exécution intégrée recommandée. |
| Git | Gestion de version. |

Le `Dockerfile` utilise actuellement l'image `node:24`, tandis que la CI GitHub Actions build avec Node.js 18.x. En développement, rester sur Node.js 18+ est cohérent avec la configuration CI.

## Cloner le projet

```bash
git clone https://github.com/nash-md/meow.git
cd meow
```

## Installer les dépendances localement

Backend :

```bash
cd backend
npm install
```

Frontend :

```bash
cd frontend
npm install
```

## Base MongoDB

Meow dépend fortement de MongoDB. Le backend accède à la base via `backend/src/helpers/DatabaseHelper.ts`, qui est le point d'entrée unique vers le driver MongoDB natif.

Pour un démarrage simple, utiliser Docker Compose :

```bash
docker-compose up --build
```

Pour un développement séparé, fournir une URI MongoDB via `MONGODB_URI`.

## Variables minimales

Backend :

```bash
export MONGODB_URI=mongodb://localhost:27017/meow
export SESSION_SECRET=change-me
```

Frontend en développement :

```bash
export VITE_URL=http://localhost:9000
```

Voir [Variables d'environnement](environment-variables.md) pour la liste complète.

