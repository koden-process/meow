# Scalabilité

## Position actuelle

Meow est conçu aujourd'hui comme une application web monolithique auto-hébergée, adaptée à des instances dédiées ou semi-standardisées.

## Points de charge

| Zone | Risque |
|---|---|
| Forecast | Agrégations MongoDB sur `Cards`. |
| Activity | Agrégations et lookup sur `Events`, `Cards`, `Users`. |
| Event listeners | Exécution in-process sans file persistante. |
| Frontend board | Nombre important de cards par lane. |
| MongoDB | Absence de stratégie d'index documentée dans cette passe. |

## Scalabilité horizontale

Le backend peut être répliqué uniquement si les contraintes suivantes sont clarifiées :

- cohérence des jobs planifiés pour éviter plusieurs exécutions simultanées;
- impact de l'event bus in-process;
- stratégie de sessions JWT et rotation de `SESSION_SECRET`;
- connexion MongoDB partagée;
- reverse proxy/load balancer.

## Recommandations

- Garder une instance dédiée tant que les besoins multi-tenant ne sont pas cadrés.
- Mesurer les requêtes forecast et activity avant optimisation.
- Documenter les indexes MongoDB nécessaires.
- Déplacer les effets de bord critiques vers un broker si le système devient distribué.
- Externaliser les jobs planifiés si plusieurs replicas backend sont déployés.

