# 04 - Modèle cible

## Objets de référence

- **Organisation cliente** : entreprise utilisatrice de Meow.
- **Équipe** : périmètre commercial ou opérationnel.
- **Utilisateur** : personne authentifiée dans Meow.
- **Compte** : société cliente, prospect ou partenaire.
- **Contact** : personne associée à un compte ou à un carnet d'adresses.
- **Carnet d'adresses** : ensemble de comptes et/ou contacts organisé par utilisateur, équipe ou organisation.
- **Opportunité** : affaire commerciale suivie dans un pipeline.
- **Pipeline** : cycle de vente configuré.
- **Étape/Lane** : étape du pipeline.
- **Prévision/Forecast** : projection commerciale fondée sur les opportunités.
- **Événement** : trace d'une action ou modification métier.
- **Export/Intégration** : mécanisme de sortie ou d'échange de données.

## Relations structurantes

- Une organisation contient des équipes et des utilisateurs.
- Une équipe peut porter un ou plusieurs périmètres commerciaux.
- Un utilisateur appartient à une organisation et peut être rattaché à une équipe.
- Un compte peut avoir plusieurs contacts.
- Une opportunité est rattachée à une étape, un compte et un responsable.
- Les champs configurables enrichissent comptes, contacts et opportunités selon le besoin client.
- Les événements tracent les évolutions significatives.

## Temporalité

Le modèle doit distinguer date de création, date de mise à jour, date de changement d'étape, date de clôture prévisionnelle et date de relance. Ces notions sont indispensables au forecast et au pilotage.

## Notions à distinguer

- Compte vs contact.
- Opportunité vs activité commerciale.
- Configuration générique vs spécifique client.
- Export manuel vs intégration automatisée.
- Instance dédiée vs plateforme mutualisée.

## Domaines à préparer tôt

- Carnets d'adresses.
- Qualité et gouvernance des données commerciales.
- Reporting direction et opérationnel.
- Exports robustes.
- Droits et visibilité par équipe.
- Préparation à l'exploitation mutualisée.

## Décisions de modélisation

Le palier 1 ne doit pas chercher à modéliser tout le CRM. Il doit clarifier les objets nécessaires aux besoins client et préserver une capacité de généralisation pour d'autres entreprises industrielles B2B.

