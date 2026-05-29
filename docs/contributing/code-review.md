# Revue de code

## Objectif

La revue doit prioriser :

- bugs;
- régressions fonctionnelles;
- risques sécurité;
- erreurs d'isolation `teamId`;
- absence de validation AJV;
- effets de bord non documentés;
- tests manquants pour changement risqué.

## Checklist backend

- La route est-elle protégée si nécessaire ?
- Le body est-il validé ?
- Les erreurs sont-elles typées ?
- Les accès MongoDB filtrent-ils par `teamId` ?
- Les effets de bord passent-ils par events ou services ?
- Les tests couvrent-ils le comportement critique ?

## Checklist frontend

- Les appels API passent-ils par `RequestHelper` ?
- Les données métier sont-elles dans Redux ?
- Les textes utilisateur passent-ils par `Translations.ts` ?
- Le routing desktop/mobile reste-t-il cohérent ?
- Les overlays et formulaires sont-ils utilisables en espaces contraints ?

## Checklist documentation

- Le README reste-t-il concis ?
- La page `docs/` concernée est-elle mise à jour ?
- Une ADR est-elle nécessaire ?
- Une entrée journal est-elle nécessaire ?

