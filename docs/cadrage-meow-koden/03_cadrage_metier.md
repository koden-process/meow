# 03 - Cadrage métier

## Périmètre par phase

**Palier 1 - Socle client industrialisable**

- Stabiliser l'existant.
- Répondre à la commande du premier client.
- Structurer la configuration des données commerciales.
- Renforcer le reporting et le pilotage du pipeline.
- Préparer les exports et intégrations.

**Palier 2 - Offre réutilisable**

- Formaliser un processus d'onboarding client.
- Standardiser la configuration initiale.
- Renforcer les garanties d'hébergement et de support.
- Préparer le modèle abonnement.

**Palier 3 - Plateforme opérée**

- Aller vers une plateforme mutualisée.
- Industrialiser l'exploitation, la supervision et les évolutions.
- Étendre les intégrations selon la demande marché.

## Personas

- Direction commerciale : suit performance, prévisions, risques et priorités.
- Manager commercial : pilote l'activité d'équipe et la qualité du pipeline.
- Commercial : crée, met à jour et fait avancer les opportunités.
- Administrateur métier : configure les étapes, champs, carnets et droits.
- Équipe Koden : déploie, héberge, maintient, accompagne et fait évoluer.

## Cas d'usage structurants

- Configurer les étapes de vente.
- Structurer comptes, contacts, carnets d'adresses et opportunités.
- Suivre une opportunité de la qualification à la clôture.
- Piloter les montants, dates, statuts et prévisions.
- Transférer une opportunité entre équipes si nécessaire.
- Exporter les données pour analyse, reporting externe ou intégration SI.

## Invariants métier

- Une opportunité appartient à un pipeline et progresse par étapes.
- Les données commerciales doivent être historisées ou traçables lorsque leur évolution est significative.
- Les configurations client ne doivent pas casser le socle commun.
- La réversibilité des données est un principe fort.
- Le premier client oriente les développements, mais ne définit pas seul le produit.

## Statuts utiles

- Opportunité ouverte.
- Opportunité gagnée.
- Opportunité perdue.
- Opportunité supprimée/logiquement masquée.
- Transfert demandé.
- Transfert accepté.
- Transfert refusé.

## Arbitrages de gouvernance

Toute demande du premier client est classée en trois catégories : coeur produit, configuration client, spécifique client isolé. Cette classification conditionne la roadmap, les choix techniques et le niveau d'investissement.

## Indicateurs de supervision par phase

- Palier 1 : stabilité, adoption client, qualité des données, capacité d'export.
- Palier 2 : temps d'onboarding, réutilisation des configurations, coût de support.
- Palier 3 : disponibilité, incidents, marge run, mutualisation effective.

