# Journal des modifications

Ce dossier est la mémoire longue du projet Meow. Il remplace les notes de passation orales et les messages Slack perdus.

---

## Pourquoi un journal ?

Le code montre *ce qui est fait*. Le journal explique *pourquoi* et *comment on en est arrivé là*. Il permet à n'importe quel agent ou développeur qui reprend le projet de comprendre le contexte d'une modification sans avoir à reconstituer l'histoire à partir des commits.

---

## Quand écrire une entrée ?

Écrire une entrée pour **toute modification non triviale**, c'est-à-dire :

- Ajout, suppression ou déplacement de fichiers de code significatifs
- Changement de schéma MongoDB (structure des entités, nouveaux champs, indexes)
- Ajout ou retrait d'une dépendance npm (frontend ou backend)
- Décision technique non évidente à la lecture du code
- Correction d'un bug avec impact comportemental (pas juste un typo)
- Changement de variable d'environnement ou de configuration
- Modification des routes API ou des contrats HTTP
- Ajout ou modification d'un job schedulé
- Opération de migration de données (`.dev/`)
- Tout refactor touchant plusieurs modules
- Mise en place ou modification de la CI/CD

**Ne pas écrire** pour : corrections de style, renommages purement cosmétiques, ajouts de commentaires.

---

## Format des fichiers

Les fichiers sont nommés `YYYY-MM-DD-slug-court.md` :

```
2026-05-09-init-docs-agent.md
2026-03-15-migration-team-paris-vers-zn.md
2025-11-02-ajout-favoris-accounts.md
```

Un même jour peut avoir plusieurs entrées si les changements sont indépendants.

---

## Template

```markdown
# YYYY-MM-DD — Titre court et explicite

## Contexte
Pourquoi ce changement, problème ou besoin amont.

## Changement
Ce qui a été fait. Fichiers / modules clés touchés (chemins relatifs).

## Décisions implicites
Choix techniques pris au passage non évidents à la lecture du code.
(Omettre s'il n'y en a pas.)

## Impact
- Modules / services impactés
- Migration nécessaire ?
- Compatibilité ascendante ?
- Points d'attention pour la suite

## Suivi
Ce qui reste à faire. (Omettre si rien.)
```

---

## Index

| Date | Titre |
|---|---|
| [2026-05-12](2026-05-12-bug-select-date-overlays.md) | Correction des menus et calendriers en espace contraint |
| [2026-05-10](2026-05-10-dedoublonnage-contacts.md) | Dédoublonnage manuel des contacts |
| [2026-05-10](2026-05-10-export-fiche-opportunite.md) | Export de la fiche opportunité |
| [2026-05-10](2026-05-10-script-transfert-opportunites-lanes.md) | Script de transfert des opportunités entre colonnes |
| [2026-05-09](2026-05-09-init-docs-agent.md) | Mise en place de la documentation agent |
