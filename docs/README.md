# Documentation Meow

Cette documentation est la source de référence du projet Meow. Elle est destinée aux développeurs, DevOps, chefs de projet, responsables produit et agents IA qui doivent comprendre, maintenir ou faire évoluer l'application.

## Parcours rapides

| Profil | Lire en priorité |
|---|---|
| Nouveau développeur | [Installation](getting-started/installation.md), [Développement local](getting-started/local-development.md), [Standards de code](contributing/coding-standards.md) |
| Développeur backend | [API](backend/api.md), [Authentification](backend/authentication.md), [Logique métier](backend/business-logic.md) |
| Développeur frontend | [Architecture UI](frontend/ui-architecture.md), [State management](frontend/state-management.md), [Routing](frontend/routing.md) |
| DevOps | [Déploiement](infrastructure/deployment.md), [Docker](infrastructure/docker.md), [Secrets](security/secrets-management.md), [Runbooks](operations/runbooks.md) |
| Chef de projet | [Vue produit](product/product-overview.md), [Règles métier](product/business-rules.md), [Workflows utilisateur](product/user-flows.md) |
| Agent IA | [Architecture](architecture/overview.md), [Workflows système](architecture/workflows.md), [Glossaire](reference/glossary.md) |

## Structure

- [Getting started](getting-started/quickstart.md) : installation, quickstart, développement local, variables.
- [Architecture](architecture/overview.md) : design système, base de données, services, workflows, décisions.
- [Backend](backend/api.md) : API REST, authentification, logique métier, intégrations.
- [Frontend](frontend/ui-architecture.md) : UI, Redux, routing, design system.
- [Infrastructure](infrastructure/deployment.md) : Docker, CI/CD, monitoring, scaling.
- [Sécurité](security/security-best-practices.md) : permissions, secrets, pratiques.
- [Opérations](operations/troubleshooting.md) : maintenance, runbooks, incidents.
- [Produit](product/product-overview.md) : périmètre, règles métier, parcours.
- [Contribution](contributing/coding-standards.md) : standards, Git, tests, review.
- [Référence](reference/glossary.md) : glossaire, FAQ, changelog.

## Sources complémentaires conservées

- [ADR](../adr/README.md) : décisions d'architecture historiques.
- [Journal](../journal/README.md) : trace des changements non triviaux.
- [OpenAPI](../meow-api.yml) : spécification API existante, à vérifier contre `backend/src/worker.ts` avant usage automatisé.

## Règles de maintenance documentaire

- Une information ne doit avoir qu'un emplacement principal.
- Les pages détaillées doivent pointer vers les sources de code lorsque c'est utile.
- Toute évolution comportementale, API, configuration ou infrastructure doit mettre à jour la documentation concernée.
- Les décisions structurantes doivent être ajoutées dans `adr/`.
- Les changements non triviaux doivent être consignés dans `journal/`.

