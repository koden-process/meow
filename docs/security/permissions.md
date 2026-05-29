# Permissions

## Modèle actuel

Le modèle de permission actuel repose principalement sur l'appartenance à une équipe (`teamId`) et l'utilisateur authentifié.

Chaque requête authentifiée passe par :

1. `verifyJwt`
2. `addEntityToHeader`
3. middlewares de validation et de connexion base

`addEntityToHeader` charge l'utilisateur et l'équipe afin que les controllers filtrent les opérations par contexte d'équipe.

## Rôles

Il n'existe pas de RBAC complet documenté dans le code actuel.

Les statuts utilisateurs connus sont :

- `invited`
- `enabled`
- `disabled`
- `deleted`
- `single-sign-on`

## Équipes

Les entités métier portent un `teamId`. Toute nouvelle requête ou agrégation doit préserver cette isolation.

Points à vérifier pour toute contribution :

- le filtre MongoDB contient bien `teamId`;
- un utilisateur ne peut pas accéder à une entité d'une autre équipe;
- les transferts inter-équipes sont explicitement gérés par `OpportunityTransfer`;
- les routes de configuration d'équipe ne permettent pas d'écraser une autre équipe sans contrôle.

## À formaliser

- rôles applicatifs;
- permissions par action;
- droits d'administration;
- audit des actions sensibles;
- politique d'accès aux transferts.

