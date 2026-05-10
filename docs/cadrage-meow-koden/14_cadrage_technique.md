# 14 - Cadrage technique

## Objectif du document

Décrire l'architecture technique globale de Meow, les choix structurants, les composants principaux, les technologies utilisées et les contraintes d'implémentation à respecter pendant le passage vers une offre opérée par Koden.

## Vue d'ensemble de l'architecture

L'architecture actuelle est une application web full-stack TypeScript, composée d'un frontend React, d'un backend Express, d'une base MongoDB, d'une couche événementielle interne et d'un déploiement Docker/Nginx.

À court terme, l'objectif est de stabiliser cette architecture. À moyen terme, Koden vise une exploitation plus industrialisée et une trajectoire vers plateforme mutualisée.

## Stack technique actuelle

### Backend

- Langage : TypeScript.
- Framework : Express.js.
- Architecture applicative : controllers, services, helpers, middlewares, entities.
- API exposées : REST.
- Authentification : JWT et bcrypt.
- Validation : AJV via schémas JSON.

### Frontend

- Framework : React 18.
- Build : Vite.
- Gestion d'état : Redux Toolkit.
- UI : Chakra UI, MUI, Adobe React Spectrum selon l'existant.

### Base de données

- Moteur : MongoDB.
- Accès : driver natif via `DatabaseHelper`.
- Usage : entités métier, événements, forecast, configurations.
- Stratégie de migration : à formaliser pour les prochaines évolutions.

### Messaging / Event bus

- Technologie actuelle : Node EventEmitter via `EventStrategy` / `NodeEventStrategy`.
- Types d'événements : card, account, lane, forecast.
- Garanties : faibles à ce stade, sans retry ni dead-letter queue.
- Évolution possible : broker externe si les effets de bord deviennent critiques.

### IA / Agents

- Hors-scope du palier 1.
- Sujet à réouvrir uniquement après stabilisation du coeur produit.

### Infrastructure

- Déploiement actuel : Docker, Nginx, MongoDB.
- CI/CD : GitHub Actions pour build frontend/backend.
- Secrets : variables d'environnement, à renforcer pour exploitation Koden.
- Observabilité : à cadrer pour le run.

## Architecture cible

### Composants principaux

- Utilisateur.
- Frontend.
- Backend API.
- Base MongoDB.
- Event bus interne.
- Jobs / workers existants.
- Exports.
- Services d'hébergement et supervision Koden.

### Flux principaux

- Utilisateur vers Frontend.
- Frontend vers Backend API.
- Backend API vers MongoDB.
- Backend API vers EventStrategy.
- EventStrategy vers listeners.
- Exports vers fichiers ou systèmes externes.
- Koden Run vers supervision et support.

## Contraintes techniques

- Sécurité : contrôle d'accès, secrets, séparation clients à préparer.
- Scalabilité : suffisante pour instances dédiées, mutualisation à cadrer.
- Auditabilité : événements et historiques métier à préserver.
- Traçabilité : décisions et changements non triviaux documentés.
- Réversibilité : exports fiables et compréhensibles.
- Maintenabilité : KISS, DRY, SRP, patterns existants.
- Performance : surveiller forecast, exports et requêtes MongoDB.
- Coûts : éviter les dépendances d'infrastructure prématurées.
- Conformité : à préciser selon clients et données hébergées.

## Décisions techniques structurantes

| Sujet | Décision | Justification | Alternatives écartées |
|---|---|---|---|
| Architecture | Stabiliser le monolithe web actuel. | Plus rapide pour le palier 1. | Microservices prématurés. |
| Base de données | Assumer MongoDB. | Déjà décidé par ADR, adapté aux données configurables. | Migration SQL court terme. |
| Authentification | Conserver JWT à court terme. | Cohérent avec l'existant. | SSO immédiat hors-scope. |
| Event bus | Conserver EventEmitter à court terme. | Suffisant pour stabilisation. | Broker externe prématuré. |
| Déploiement | Instance dédiée/semi-standardisée opérée par Koden. | Réduit le risque court terme. | Multi-tenant immédiat. |

## Risques techniques

| Risque | Impact | Probabilité | Mitigation |
|---|---:|---:|---|
| Dette technique héritée | Moyen | Moyenne | Stabiliser et documenter avant refonte. |
| Données client mal isolées en cible mutualisée | Fort | Moyenne | Cadrer la mutualisation comme chantier dédié. |
| Exports non fiables | Fort | Moyenne | Tester sur données représentatives. |
| Observabilité insuffisante | Moyen | Moyenne | Définir logs, métriques et alertes minimales. |

## Pré-requis pour le développement

- Node.js compatible avec le projet.
- MongoDB disponible.
- Variables `MONGODB_URI` et `SESSION_SECRET`.
- Environnement Docker pour validation intégrée.
- Convention de routes API existante.
- Validation AJV pour requêtes entrantes.
- Erreurs typées côté backend.
- Journal obligatoire pour changements non triviaux.

## Sorties attendues

Ce cadrage doit permettre de produire ensuite les tâches techniques, tickets de développement, ADR techniques, choix d'infrastructure, conventions d'exploitation, scripts de déploiement et premiers contrôles de supervision.

