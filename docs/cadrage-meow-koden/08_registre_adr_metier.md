# 08 - Registre ADR métier

## ADR-M-001 - Positionner Meow comme produit vertical B2B industriel

**Contexte** : Meow pourrait être présenté comme CRM générique, outil interne ou offre accompagnée. Cette ambiguïté nuit à la priorisation.

**Décision** : Positionner Meow comme une solution de pilotage commercial pour fabricants, distributeurs et fournisseurs d'équipements B2B.

**Alternatives écartées** : CRM horizontal, plateforme de workflow générique, outil interne Koden.

**Conséquences** : La roadmap doit privilégier les besoins récurrents de cette cible et éviter l'exhaustivité CRM.

## ADR-M-002 - Faire du premier client un pilote structurant, pas un modèle unique

**Contexte** : Le premier client finance et oriente les développements, mais le produit doit rester commercialisable.

**Décision** : Classer chaque demande en coeur produit, configuration client ou spécifique client isolé.

**Alternatives écartées** : Tout intégrer au coeur produit, ou tout traiter comme sur-mesure.

**Conséquences** : Les arbitrages produit doivent être explicitement documentés.

## ADR-M-003 - Commercialiser d'abord sur devis, puis évoluer vers abonnement

**Contexte** : Le produit n'est pas encore assez standardisé pour une offre packagée.

**Décision** : Démarrer par une offre sur devis pour le premier client, puis évoluer vers cadrage/adaptation initiale + abonnement.

**Alternatives écartées** : SaaS standard immédiat, prestation pure sans capitalisation.

**Conséquences** : Le palier 1 doit produire autant de stabilisation produit que de valeur client.

## ADR-M-004 - Viser une plateforme mutualisée à moyen terme

**Contexte** : Koden porte le déploiement et l'hébergement dans son offre.

**Décision** : Opérer d'abord des instances dédiées ou semi-standardisées, puis préparer une plateforme mutualisée.

**Alternatives écartées** : Multi-tenant immédiat, auto-hébergement client seul.

**Conséquences** : Les choix techniques doivent préserver la possibilité de mutualisation sans bloquer le palier 1.

