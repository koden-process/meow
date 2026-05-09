# 2026-05-09 — Mise en place de la documentation agent

## Contexte

Le projet ne disposait d'aucune documentation structurée pour les agents de codage (humains ou IA). Les décisions d'architecture passées (suppression TypeORM, introduction des events) n'étaient documentées que dans le CHANGELOG sans contexte de décision. La structure du projet n'était pas explicitée pour un nouvel arrivant.

## Changement

- Création de `AGENTS.md` à la racine — document d'entrée obligatoire pour tout agent
- Création de `SKILLS.md` à la racine — recettes paramétriques pour les tâches récurrentes
- Création de `adr/README.md` — cadre et template pour les ADR
- Création de `adr/0001-suppression-typeorm-driver-mongodb-natif.md` — ADR rétrospective (décision 2023-09-20)
- Création de `adr/0002-architecture-evenementielle-node-eventemitter.md` — ADR rétrospective (décision 2023-07-18)
- Création de `journal/README.md` — cadre et template pour le journal

## Décisions implicites

Les ADR 0001 et 0002 sont des reconstructions rétrospectives à partir du CHANGELOG et du code source. Les noms des décideurs et certains détails de contexte sont marqués `<À compléter>` — ils doivent être validés par l'équipe.

La découverte automatique n'a pas permis de déterminer l'usage exact du dossier `.dev/` (outils de migration inter-instances) ni les conventions non écrites du projet. Ces zones sont signalées `<À compléter>` dans `AGENTS.md`.

## Impact

- Aucun code modifié
- Ces fichiers servent de point d'entrée obligatoire pour tout agent futur
- Le `journal/README.md` doit être maintenu à jour (index) à chaque nouvelle entrée

## Suivi

- [ ] Valider et compléter les champs `<À compléter>` dans les ADR 0001 et 0002
- [ ] Documenter le fonctionnement du dossier `.dev/` dans AGENTS.md (section 9 ou ADR dédiée)
- [ ] Ajouter des skills dans SKILLS.md dès que de nouvelles tâches récurrentes sont identifiées
- [ ] Envisager une ADR pour la migration CRA → Vite (visible dans le code, non documentée)
