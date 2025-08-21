# Design Document

## Overview

Cette fonctionnalité ajoute un bouton "Supprimer" dans le formulaire de modification des affaires (cards/opportunités). Le système utilise déjà une architecture Redux avec des listeners middleware pour gérer les actions asynchrones, et il existe déjà une infrastructure de suppression de cartes qui marque les cartes comme supprimées plutôt que de les supprimer physiquement.

## Architecture

### Frontend Architecture
- **Composant Layer**: `frontend/src/components/card/Layer.tsx` - Contient la logique de présentation et les boutons d'action
- **Actions Redux**: Utilisation de l'action `CARD_DELETE` existante via le système d'actions Redux
- **Middleware Listener**: Le `CardDeleteListener` existant gère déjà la logique de suppression asynchrone
- **RequestHelper**: L'API client existant sera utilisé pour communiquer avec le backend

### Backend Architecture
- **API Endpoint**: Utilisation de l'endpoint existant `POST /api/cards/:id` avec le statut `CardStatus.Deleted`
- **Soft Delete**: Le système utilise un soft delete en marquant les cartes avec `status: CardStatus.Deleted`
- **Event System**: Les événements existants seront émis lors de la suppression

## Components and Interfaces

### Frontend Components

#### 1. Card Layer Component (`frontend/src/components/card/Layer.tsx`)
**Modifications requises:**
- Ajouter un bouton "Supprimer" dans la section `card-submit`
- Implémenter une fonction `deleteCard` qui dispatche l'action `CARD_DELETE`
- Ajouter une boîte de dialogue de confirmation avant la suppression
- Gérer la visibilité du bouton (seulement pour les cartes existantes)

#### 2. Confirmation Modal
**Nouveau composant:** `frontend/src/components/modal/DeleteCardModal.tsx`
- Modal de confirmation avec message explicatif
- Boutons "Confirmer" et "Annuler"
- Gestion de l'état d'ouverture/fermeture

### Backend Integration

#### API Endpoint
**Endpoint existant:** `POST /api/cards/:id`
- Utilisation du paramètre `status: CardStatus.Deleted` dans le body
- Le `CardController.update` gère déjà cette logique

#### Request Flow
1. Frontend dispatche l'action `CARD_DELETE`
2. `CardDeleteListener` intercepte l'action
3. Appel API via `RequestHelper.updateCard()` avec `status: CardStatus.Deleted`
4. Backend met à jour le statut de la carte
5. Événements émis pour notifier les autres composants

## Data Models

### Card Interface
```typescript
interface Card {
  _id: string;
  status: CardStatus; // Existing field
  // ... autres propriétés existantes
}

enum CardStatus {
  Active = 'active',
  Deleted = 'deleted'
}
```

### Action Interface (Existante)
```typescript
interface ApplicationCardDeleteAction extends Action<ActionType.CARD_DELETE> {
  payload: Card;
}
```

## Error Handling

### Frontend Error Handling
- **Confirmation annulée**: Fermeture de la modal sans action
- **Erreur API**: Affichage d'un message d'erreur via `showModalError`
- **Carte non trouvée**: Gestion via les erreurs HTTP du backend

### Backend Error Handling
- **Carte non trouvée**: Retour d'une erreur 404
- **Permissions insuffisantes**: Validation via `validateAndFetchCard`
- **Erreur de base de données**: Gestion par le middleware d'erreur existant

## Testing Strategy

### Frontend Tests
1. **Unit Tests pour Card Layer**
   - Test de la visibilité du bouton supprimer
   - Test de l'ouverture de la modal de confirmation
   - Test du dispatch de l'action CARD_DELETE

2. **Unit Tests pour Delete Modal**
   - Test de l'affichage du modal
   - Test des actions de confirmation/annulation

3. **Integration Tests**
   - Test du flux complet de suppression
   - Test de la gestion des erreurs

### Backend Tests
- Les tests existants dans `backend/src/tests/card.test.ts` couvrent déjà la suppression
- Test `"/cards delete a card returns 200"` valide le comportement de soft delete

## User Experience Flow

### Flux Principal
1. **Ouverture du formulaire**: L'utilisateur clique sur une affaire dans le dashboard
2. **Affichage du bouton**: Le bouton "Supprimer" est visible pour les cartes existantes
3. **Clic sur supprimer**: L'utilisateur clique sur le bouton "Supprimer"
4. **Confirmation**: Une modal de confirmation s'affiche
5. **Validation**: L'utilisateur confirme la suppression
6. **Suppression**: La carte est marquée comme supprimée
7. **Feedback**: Message de confirmation et fermeture du formulaire

### Flux d'Erreur
1. **Erreur API**: Affichage d'un message d'erreur, formulaire reste ouvert
2. **Annulation**: Fermeture de la modal, retour au formulaire

## Styling and Layout

### Button Placement
- Position: À côté des boutons "Enregistrer" et "Fermer"
- Style: Bouton avec variant destructif (couleur rouge/orange)
- Ordre: "Enregistrer" | "Supprimer" | "Fermer"

### Modal Styling
- Style cohérent avec les autres modals de l'application
- Icône d'avertissement
- Texte explicatif clair
- Boutons avec couleurs appropriées (rouge pour confirmer, gris pour annuler)

## Internationalization

### Nouvelles Traductions Requises
```typescript
// Ajouts au fichier Translations.ts
DeleteButton: {
  en: 'Delete',
  fr: 'Supprimer',
},

DeleteCardConfirmation: {
  en: 'Are you sure you want to delete this opportunity? This action cannot be undone.',
  fr: 'Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action ne peut pas être annulée.',
},

CardDeletedConfirmation: {
  en: 'Opportunity deleted successfully',
  fr: 'Opportunité supprimée avec succès',
},

ConfirmButton: {
  en: 'Confirm',
  fr: 'Confirmer',
},

CancelButton: {
  en: 'Cancel',
  fr: 'Annuler',
},
```

## Security Considerations

### Authorization
- Utilisation du système d'authentification existant via JWT
- Validation des permissions via `validateAndFetchCard` dans le backend
- Seuls les utilisateurs autorisés peuvent supprimer les cartes de leur équipe

### Data Integrity
- Soft delete préserve l'intégrité référentielle
- Les événements associés restent disponibles pour l'audit
- Possibilité de restauration future si nécessaire

## Performance Considerations

### Frontend Performance
- Pas d'impact significatif sur les performances
- Modal chargée à la demande
- Utilisation des composants React optimisés existants

### Backend Performance
- Utilisation de l'endpoint existant optimisé
- Pas de requêtes supplémentaires nécessaires
- Soft delete plus performant qu'une suppression physique

## Migration and Deployment

### Frontend Deployment
- Aucune migration de données nécessaire
- Déploiement standard des composants React
- Ajout des nouvelles traductions

### Backend Deployment
- Aucune modification backend requise
- Utilisation de l'infrastructure existante
- Aucune migration de base de données nécessaire