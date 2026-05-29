# Design system

Meow utilise plusieurs bibliothèques UI historiques :

- Chakra UI v3;
- MUI v7;
- Adobe React Spectrum;
- composants internes dans `frontend/src/components/`.

## Personnalisation visuelle

Les helpers suivants appliquent la personnalisation :

- `AppNameHelper`
- `FaviconHelper`
- `LogoHelper`
- `ThemeHelper`
- `NavigationHelper`
- `frontend/src/utils/env.ts`

Variables supportées :

- `VITE_CUSTOM_APP_NAME`
- `VITE_CUSTOM_FAVICON_URL`
- `VITE_CUSTOM_LOGO_URL`
- `VITE_CUSTOM_LOGO_ALT`
- `VITE_CUSTOM_THEME_COLOR`
- `VITE_CUSTOM_NAVIGATION_COLOR`

## Traductions

Toute chaîne affichée à l'utilisateur doit passer par `frontend/src/Translations.ts`.

## Principes UI

- Respecter les composants existants avant d'ajouter une nouvelle bibliothèque.
- Préserver la cohérence entre pages dashboard, accounts, forecast et setup.
- Tester les overlays, select et calendriers dans les espaces contraints.
- Vérifier les vues mobiles lorsque la modification touche `Application.tsx`, navigation ou formulaires.

## Assets

Les assets publics vivent dans `frontend/public/`. Les captures et images de documentation vivent dans `docs/assets/`.

