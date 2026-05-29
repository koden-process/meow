# Règles métier

## Pipeline

- Une équipe possède ses lanes.
- Une lane représente une étape commerciale.
- L'ordre des lanes est défini par `index`.
- Certaines lanes peuvent être typées `closed-won`, `closed-lost` ou normales.
- Une lane peut être incluse ou exclue du forecast via `inForecast`.

## Opportunités

- Une opportunité appartient à une équipe, un utilisateur et une lane.
- Le montant sert au forecast.
- La date `closedAt` sert aux prévisions par période.
- La date `nextFollowUpAt` sert au suivi de relance.
- Les opportunités peuvent avoir des champs personnalisés.
- Les suppressions utilisent un statut métier lorsque c'est prévu par le code.

## Comptes

- Un compte appartient à une équipe.
- Un compte peut avoir des attributs personnalisés.
- Un compte peut être référencé par des opportunités ou d'autres comptes via les schemas.
- Une fusion de comptes déplace les références et événements vers le compte cible.

## Schemas

- Les schemas sont configurables par équipe.
- Les attributs ont une clé stable.
- Renommer un attribut ne doit pas casser les données existantes car les valeurs sont liées aux clés.
- Supprimer un attribut du schema ne supprime pas automatiquement les valeurs déjà stockées dans les entités.

## Forecast

- Les opportunités supprimées ne doivent pas contribuer aux agrégations.
- Les forecasts sont calculés par période.
- Les lanes gagnées/perdues et les lanes normales incluses dans le forecast ont des usages différents.

## Transferts

- Une demande de transfert a un émetteur, une équipe source, une équipe cible et une opportunité.
- Une demande peut être acceptée ou refusée.
- Les messages de demande et de réponse sont optionnels selon le flux.

