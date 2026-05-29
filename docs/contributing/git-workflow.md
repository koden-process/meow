# Workflow Git

## Branches

Créer une branche dédiée par changement :

```bash
git switch -c codex/ma-fonctionnalite
```

La branche actuelle de cette refonte documentaire est `documention`.

## Commits

Un commit doit être cohérent et relire :

- code modifié;
- tests ou build;
- documentation;
- entrée journal si nécessaire.

## Avant PR

Vérifier :

```bash
cd frontend && npm run build
cd backend && npm run build
```

Si le backend est impacté :

```bash
cd backend
URL=http://localhost:9000 npx ava
```

## Journal

Toute modification non triviale doit ajouter un fichier :

```text
journal/YYYY-MM-DD-slug.md
```

Voir [journal/README.md](../../journal/README.md).

