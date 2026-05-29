# Architecture frontend

Le frontend est une application React 18 construite avec Vite.

## Entrées principales

| Fichier | Rôle |
|---|---|
| `frontend/src/index.tsx` | Point d'entrée React. |
| `frontend/src/Application.tsx` | Routing principal, chargement initial des données, layout desktop/mobile. |
| `frontend/src/SessionOrNot.tsx` | Gestion de la session. |
| `frontend/src/components/Layout.tsx` | Structure d'écran desktop. |
| `frontend/src/MobileMain.tsx` | Expérience mobile. |

## Chargement initial

Quand un token est disponible, `Application.tsx` charge :

- users;
- schemas;
- accounts;
- lanes.

Les données sont envoyées au store Redux via les actions définies dans `frontend/src/actions/Actions.ts`.

## Appels API

Les appels HTTP sont centralisés dans `frontend/src/helpers/RequestHelper.ts`.

Règles :

- Ne pas faire de `fetch` direct depuis les composants.
- Ajouter les nouvelles méthodes d'API dans `RequestHelper`.
- Garder les erreurs utilisateur compatibles avec `ErrorHelper`.

## Desktop et mobile

`Application.tsx` bascule vers les vues mobiles lorsque la fenêtre est sous le seuil configuré. Les routes mobiles principales sont :

- `/ajouter-opportunite`
- `/ajouter-commentaire`
- route fallback vers `MobileMain`

## Pages desktop principales

| Route | Page |
|---|---|
| `/` | `HomePage` |
| `/forecast/*` | `ForecastPage` |
| `/setup` | `SetupPage` |
| `/activity` | `ActivityPage` |
| `/transfers` | `TransfersPage` |
| `/user-setup` | `UserSetupPage` |
| `/hire` | `HirePage` |
| `/accounts` | `AccountsPage` |

