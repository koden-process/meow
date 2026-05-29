# CI/CD

La CI est définie dans `.github/workflows/build_all.yml`.

## Déclencheurs

Le workflow se déclenche sur :

- push vers `main`;
- pull request vers `main`.

## Job

Le job `build` tourne sur Ubuntu avec Node.js 18.x.

Étapes :

1. checkout du dépôt;
2. setup Node.js;
3. `npm ci` et `npm run build` dans `frontend/`;
4. `npm ci` et `npm run build` dans `backend/`;
5. affichage de la branche courante.

## Limites actuelles

- Les tests AVA backend ne sont pas lancés dans cette CI.
- Aucun MongoDB de test n'est démarré dans le workflow.
- Aucune image Docker n'est publiée par ce workflow.

## Évolution recommandée

- Ajouter un service MongoDB pour les tests d'intégration.
- Lancer `URL=<backend> npx ava` après démarrage du backend.
- Ajouter un build Docker si l'image devient un artefact de release.
- Ajouter des checks de documentation pour détecter les liens cassés.

