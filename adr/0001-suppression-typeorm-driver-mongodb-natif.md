# ADR-0001 — Suppression de TypeORM au profit du driver MongoDB natif

- Statut : Accepted
- Date : 2023-09-20
- Décideurs : <À compléter>
- Tags : base-de-données, mongodb, orm, architecture

## Contexte

À l'origine, Meow utilisait TypeORM comme couche d'abstraction entre le code métier et MongoDB. L'intention initiale était de maintenir une certaine indépendance vis-à-vis de la base de données — TypeORM supporte plusieurs backends (PostgreSQL, MySQL, MongoDB, etc.).

Cependant, au fil du développement, plusieurs fonctionnalités ont nécessité des interactions directes avec MongoDB impossibles ou trop complexes à exprimer via TypeORM : requêtes d'agrégation pour les forecasts, gestion des events avec des structures imbriquées, indexes spécifiques. Un `MongoClient` séparé avait déjà été introduit en parallèle de TypeORM pour contourner ces limitations, créant deux points d'entrée vers la base.

Par ailleurs, TypeORM 0.3.x présentait des incompatibilités avec les versions récentes du driver MongoDB natif.

## Décision

Supprimer TypeORM entièrement. Utiliser le driver MongoDB natif (`mongodb` npm package) directement via un `DatabaseHelper` centralisé. Assumer et documenter le couplage fort avec MongoDB.

## Conséquences

**Positives :**
- Accès à toutes les fonctionnalités MongoDB sans contournement (agrégations, indexes, transactions)
- Suppression du `MongoClient` parallèle — un seul point d'entrée base de données
- Moins de dépendances, moins d'indirections dans le code

**Négatives :**
- Le projet ne peut plus être migré vers une autre base de données sans réécriture significative
- Les requêtes sont directement exprimées en syntaxe MongoDB — moins portable
- Tout développeur qui arrive doit connaître l'API MongoDB native (pas d'abstraction ORM)

## Alternatives considérées

**Conserver TypeORM et mettre à jour** — rejeté car les incompatibilités avec le driver MongoDB v6 rendaient la mise à jour risquée, et les limitations d'expressivité restaient entières.

**Migrer vers Mongoose** — rejeté car Mongoose ajoute une couche de schema/validation déjà couverte par AJV dans les middlewares Express. Ajouter Mongoose aurait créé une duplication de la validation et des types.

**Migrer vers PostgreSQL + TypeORM** — rejeté car la structure des données (attributs dynamiques via Schema, events imbriqués) est naturellement documentaire et bénéficie du modèle MongoDB.

## Liens

- Entrée CHANGELOG : `2023-09-20` — "Removed TypeORM from the project"
- `backend/src/helpers/DatabaseHelper.ts` — point d'entrée unique vers MongoDB
- `backend/src/entities/` — entités manipulées directement via le driver natif
