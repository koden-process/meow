# Standards de code

## Général

- Lire `AGENTS.md` avant toute modification.
- Préférer les patterns existants.
- Garder les changements focalisés.
- Mettre à jour la documentation avec le comportement modifié.
- Ajouter une entrée `journal/` pour toute modification non triviale.

## Backend

- Ne pas instancier `MongoClient` hors de `DatabaseHelper`.
- Utiliser les erreurs typées de `backend/src/errors/`.
- Valider les bodies POST avec AJV.
- Garder les controllers minces.
- Déplacer la logique métier complexe dans `services/`.
- Utiliser les events pour les effets de bord métier.
- Respecter la chaîne `verifyJwt -> addEntityToHeader` sur les routes authentifiées.

## Frontend

- Centraliser les appels API dans `RequestHelper`.
- Utiliser Redux pour les données métier globales.
- Utiliser les sélecteurs de `Store.ts` ou `selectors.ts`.
- Ajouter les traductions dans `Translations.ts`.
- Vérifier desktop et mobile quand une page, route ou navigation change.

## Documentation

- Documentation en français.
- Noms de fonctions, classes et fichiers conservés en anglais.
- Markdown uniquement.
- Pas de duplication volontaire : lier vers la page source.

