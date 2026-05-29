# Gestion des incidents

## Classification simple

| Niveau | Exemple | Action |
|---|---|---|
| P1 | Application inaccessible, perte d'accès base | Restaurer le service, préserver les logs, prévenir les utilisateurs. |
| P2 | Authentification cassée, forecast indisponible | Corriger ou rollback, documenter l'impact. |
| P3 | Bug UI contournable, erreur sur une page secondaire | Planifier correction, ajouter test si pertinent. |

## Processus

1. Identifier l'impact utilisateur.
2. Capturer les logs backend, Nginx et MongoDB.
3. Vérifier les changements récents.
4. Stabiliser le service.
5. Corriger durablement.
6. Documenter dans `journal/` si l'incident entraîne une modification non triviale.

## Informations à collecter

- Date et heure.
- Environnement.
- Version ou commit.
- Logs backend.
- Requête ou action utilisateur.
- Utilisateur/équipe impacté si disponible.
- Collections MongoDB concernées.

## Post-mortem

Pour un incident P1/P2, documenter :

- cause racine;
- impact;
- détection;
- résolution;
- actions préventives.

