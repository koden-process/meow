# 13 - Gouvernance et RACI détaillé

## Niveaux de gouvernance

**Stratégique** : positionnement, modèle d'offre, investissements, priorités marché.

**Produit** : arbitrage des besoins, roadmap, classification coeur/configuration/spécifique.

**Delivery** : planification, réalisation, tests, recette, déploiement.

**Run** : hébergement, supervision, support, incidents, maintenance.

## Acteurs cibles

- Sponsor Koden.
- Responsable produit Meow.
- Référent technique / architecte.
- Responsable delivery.
- Référent run/hébergement.
- Référent métier client.
- Utilisateurs pilotes client.

## RACI cible

| Activité | Sponsor | Produit | Tech | Delivery | Run | Client |
|---|---|---|---|---|---|---|
| Vision et offre | A | R | C | C | C | C |
| Priorisation roadmap | A | R | C | C | C | C |
| Classification des demandes | C | A/R | C | C | C | C |
| Architecture | C | C | A/R | C | C | I |
| Développement | I | C | A | R | C | I |
| Recette métier | I | C | C | R | I | A/R |
| Déploiement | I | C | C | R | A/R | C |
| Support | I | C | C | C | A/R | C |
| Arbitrage spécifique client | A | R | C | C | C | C |

## Comités

- Point produit hebdomadaire pendant le palier 1.
- Point delivery hebdomadaire ou selon cadence projet.
- Revue client aux jalons clés.
- Revue run après mise en production.
- Revue stratégique à chaque changement de palier.

## Circuits de décision

Les demandes client sont analysées par le responsable produit avec avis technique. Les arbitrages structurants sont validés par le sponsor Koden. Les décisions durables sont consignées dans le registre ADR métier ou les ADR techniques.

## Logique build / run

Le build doit préparer le run dès le palier 1 : déploiement reproductible, configuration documentée, support organisé, incidents suivis et responsabilités explicites.

## Priorités par phase

- Palier 1 : livrer, stabiliser, apprendre.
- Palier 2 : standardiser, documenter, vendre à nouveau.
- Palier 3 : mutualiser, superviser, industrialiser.

