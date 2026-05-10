# 05 - Trajectoire produit / technique

## Grands axes de travail

1. Stabiliser le socle existant.
2. Cadrer et implémenter les besoins structurants du premier client.
3. Généraliser les adaptations réutilisables.
4. Industrialiser déploiement, hébergement et exploitation.
5. Préparer progressivement une plateforme mutualisée.

## Axe produit

Le produit doit rester centré sur le pilotage commercial B2B industriel. Les fonctionnalités prioritaires du palier 1 sont la configuration des données commerciales, le reporting/pilotage et l'export/intégration.

## Axe technique

Le socle actuel repose sur React, Express, MongoDB, Docker et Nginx. Les choix existants doivent être stabilisés avant toute refonte profonde. MongoDB et l'architecture événementielle interne sont assumés à court terme.

## Interfaces ou composants majeurs

- Interface de pipeline et opportunités.
- Gestion des comptes, contacts et carnets d'adresses.
- Configuration des champs et étapes.
- Reporting et forecast.
- Exports de données.
- API REST existante.
- Chaîne de déploiement et hébergement Koden.

## Choix structurants

- Privilégier la configuration au spécifique lorsque c'est pertinent.
- Préserver la simplicité du produit.
- Éviter le moteur de workflow générique au palier 1.
- Commencer par des exports fiables avant les intégrations automatisées complexes.
- Opérer d'abord des instances dédiées ou semi-standardisées, puis préparer la mutualisation.

## Points de vigilance

- Risque de sur-adaptation au premier client.
- Dette technique du socle open source.
- Ambiguïté possible entre CRM générique et produit vertical.
- Complexité de la future mutualisation.
- Besoin de support et d'exploitation dès la première offre.

