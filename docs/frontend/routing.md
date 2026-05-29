# Routing

Le routing frontend utilise React Router v6.

## Routing desktop

Défini dans `frontend/src/Application.tsx` :

| Route | Composant | Usage |
|---|---|---|
| `/forecast/*` | `ForecastPage` | Prévisions commerciales. |
| `/setup` | `SetupPage` | Configuration pipeline, schemas, devise, labels. |
| `/activity` | `ActivityPage` | Activité récente. |
| `/transfers` | `TransfersPage` | Transferts d'opportunités. |
| `/user-setup` | `UserSetupPage` | Préférences utilisateur. |
| `/hire` | `HirePage` | Gestion/invitation d'utilisateurs. |
| `/accounts` | `AccountsPage` | Gestion des comptes. |
| `*` | `HomePage` | Dashboard principal. |

## Routing mobile

Lorsque l'application détecte un petit écran, les routes changent :

| Route | Composant |
|---|---|
| `/ajouter-opportunite` | `AddOpportunityMobile` |
| `/ajouter-commentaire` | `AddCommentMobile` |
| `*` | `MobileMain` |

## Ajout d'une route

1. Créer la page dans `frontend/src/pages/`.
2. Ajouter la route dans `Application.tsx`.
3. Ajouter l'entrée de navigation si nécessaire dans `Navigation.tsx` et `NavigationMobile.tsx`.
4. Ajouter les traductions dans `frontend/src/Translations.ts` si du texte utilisateur est introduit.
5. Vérifier le rendu desktop et mobile.

