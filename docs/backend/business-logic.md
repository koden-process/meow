# Logique métier

## Domaine principal

Meow modélise un pipeline commercial configurable.

| Objet | Description |
|---|---|
| Team | Organisation ou équipe commerciale. |
| User | Membre d'une équipe, responsable d'opportunités. |
| Lane | Étape du funnel commercial. |
| Card | Opportunité commerciale. |
| Account | Compte client ou contact. |
| Schema | Définition des champs personnalisés. |
| Event | Historique des changements et événements forecast. |
| OpportunityTransfer | Demande de transfert d'opportunité entre équipes. |

## Opportunités

Une opportunité est une `Card`. Elle appartient à une `Team`, à un `User` et à une `Lane`.

Règles importantes :

- Une opportunité supprimée est marquée par un statut, elle n'est pas nécessairement retirée physiquement.
- `inLaneSince` permet de mesurer le temps passé dans une étape.
- `closedAt` sert aux forecasts.
- `nextFollowUpAt` sert au suivi des relances et au job quotidien.
- Les attributs personnalisés sont stockés dans `attributes`.

## Pipeline

Les étapes du pipeline sont des `Lane`.

- L'ordre est porté par `index`.
- `tags.type` peut identifier des lanes de clôture comme `closed-won` ou `closed-lost`.
- `inForecast` indique si une lane normale entre dans le forecast prévisionnel.

## Forecast

Le forecast agrège les opportunités selon :

- la période demandée;
- la lane;
- le type de lane;
- l'utilisateur optionnel;
- le statut de l'opportunité.

`ForecastService` utilise des agrégations MongoDB sur la collection `Cards`.

## Accounts et références

Les comptes supportent des attributs personnalisés et des références.

Les attributs de type `reference` permettent de relier des Cards et Accounts. Les références inverses sont maintenues par des helpers/listeners/services, notamment pendant la fusion de comptes.

## Activité

L'activité utilisateur est construite à partir de la collection `Events`, en excluant les événements techniques de forecast (`ForecastTotal`, `ForecastCard`).

## Transferts

Une opportunité peut être transférée entre équipes via `OpportunityTransfer`.

Statuts :

- `pending`
- `accepted`
- `declined`

## Configuration d'équipe

`TeamConfigService` permet d'exporter et d'appliquer une configuration composée de schemas, lanes et devise. Cette fonctionnalité doit être manipulée avec prudence car l'application d'une configuration supprime les schemas et lanes existants de l'équipe cible avant copie.

