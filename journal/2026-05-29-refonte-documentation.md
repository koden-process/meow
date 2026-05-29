# 2026-05-29 — Refonte de la documentation projet

## Contexte

Le projet disposait d'un README historique en anglais, de guides dispersés dans `docs/`, d'un pack de cadrage produit/technique séparé et de sources de référence déjà présentes dans `AGENTS.md`, `SKILLS.md`, `adr/` et `journal/`.

L'objectif était de produire une documentation française, structurée, maintenable et exploitable par plusieurs profils : développeurs, DevOps, chefs de projet, responsables produit et agents IA.

## Changement

- Réécriture du `README.md` racine pour en faire une entrée courte et immédiatement utile.
- Création d'une arborescence documentaire structurée dans `docs/` :
  - `getting-started/`
  - `architecture/`
  - `backend/`
  - `frontend/`
  - `infrastructure/`
  - `security/`
  - `operations/`
  - `product/`
  - `contributing/`
  - `reference/`
- Consolidation des anciens guides dans les nouvelles pages produit, backend, infrastructure et getting-started.
- Déplacement des captures de documentation dans `docs/assets/`.
- Suppression des anciens fichiers Markdown du dossier `docs/` qui faisaient doublon avec la nouvelle structure.

## Décisions implicites

- `backend/src/worker.ts` est documenté comme source d'exécution des routes API, la spécification `meow-api.yml` restant une source utile mais à vérifier avant usage automatisé.
- Les ADR et le journal restent hors de `docs/` car ils sont déjà des registres structurés du projet, mais la nouvelle documentation les référence comme sources complémentaires.
- Les limites actuelles non formalisées sont explicitées plutôt que remplacées par des hypothèses : healthcheck, monitoring, migrations MongoDB, RBAC, stratégie multi-tenant.

## Impact

- Impact code applicatif : aucun.
- Impact documentation : majeur.
- Migration nécessaire : non.
- Compatibilité ascendante : oui, les fichiers supprimés étaient des guides consolidés dans la nouvelle structure.
- Points d'attention : maintenir les nouvelles pages à jour lors de toute évolution API, configuration, déploiement ou règle métier.

## Suivi

- Vérifier ultérieurement l'alignement complet de `meow-api.yml` avec les routes réelles.
- Formaliser une stratégie de migration MongoDB et de healthcheck applicatif.
- Ajouter des contrôles de liens Markdown dans la CI si la documentation continue de croître.

