# Guide d'utilisation des Transferts d'Opportunités

## Vue d'ensemble

La fonctionnalité de transferts d'opportunités permet aux équipes de transférer des opportunités entre elles de manière organisée et traçable. Cette fonctionnalité est maintenant accessible via l'interface utilisateur.

## Fonctionnalités implémentées

### 1. Page des Transferts (`/transfers`)
- **Navigation** : Nouvelle icône "Transferts" dans la barre de navigation principale
- **Vue d'ensemble** : Liste de toutes les demandes de transfert (reçues et envoyées)
- **Tabs** : 
  - **Reçus** : Demandes que vous avez reçues (en attente d'acceptation/refus)
  - **Envoyés** : Demandes que vous avez envoyées (avec statut)

### 2. Onglet Transfert dans la fiche d'opportunité
- **Initiation** : Bouton "Transfer Opportunity" pour créer une nouvelle demande
- **Historique** : Affichage des transferts liés à cette opportunité spécifique
- **Modale** : Interface pour sélectionner l'équipe cible et ajouter un message

### 3. Fonctionnalités de gestion
- **Accepter** : Bouton pour accepter une demande de transfert avec message de réponse
- **Refuser** : Bouton pour refuser une demande de transfert avec message de réponse
- **Suivi** : Affichage du statut (En attente, Accepté, Refusé) et des dates

## Comment utiliser

### Pour transférer une opportunité :
1. Ouvrir la fiche d'une opportunité
2. Cliquer sur l'onglet "Transfer"
3. Cliquer sur "Transfer Opportunity"
4. Sélectionner l'équipe destinataire
5. Ajouter un message optionnel
6. Cliquer sur "Transfer"

### Pour gérer les demandes reçues :
1. Aller sur `/transfers` (icône dans la navigation)
2. Dans l'onglet "Reçus", voir les demandes en attente
3. Pour chaque demande :
   - Lire le message de la demande
   - Ajouter une réponse
   - Cliquer sur "Accept" ou "Decline"

### Pour suivre vos demandes envoyées :
1. Aller sur `/transfers`
2. Cliquer sur l'onglet "Envoyés"
3. Voir le statut de toutes vos demandes

## API utilisée

La fonctionnalité utilise les endpoints suivants (déjà implémentés dans RequestHelper.ts) :
- `GET /api/opportunity-transfers` - Liste des transferts
- `POST /api/opportunity-transfers` - Créer un transfert
- `POST /api/opportunity-transfers/:id/accept` - Accepter un transfert
- `POST /api/opportunity-transfers/:id/decline` - Refuser un transfert

## Interface et traductions

- Toutes les traductions sont disponibles en français et en anglais
- Interface responsive (mobile et desktop)
- Intégration avec le système de navigation existant

## Notes techniques

- **Composants principaux** :
  - `TransfersPage.tsx` : Page principale des transferts
  - `TransferRequests.tsx` : Composant de liste des transferts
  - `TransferModal.tsx` : Modale pour initier un transfert
  
- **Navigation** : Nouveau lien "/transfers" ajouté dans Navigation.tsx et NavigationMobile.tsx
- **Routes** : Nouvelle route ajoutée dans Application.tsx
- **Icône** : Nouvelle icône transfer-icon.svg créée

La fonctionnalité est maintenant complètement intégrée et prête à être utilisée !
