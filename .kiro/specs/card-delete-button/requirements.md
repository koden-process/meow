# Requirements Document

## Introduction

Cette fonctionnalité ajoute un bouton "Supprimer" dans le formulaire de modification des affaires (cards/opportunités) qui s'ouvre lorsqu'un utilisateur clique sur une affaire dans le dashboard. Actuellement, le formulaire ne propose que les boutons "Enregistrer" et "Fermer", mais les utilisateurs ont besoin de pouvoir supprimer une affaire directement depuis ce formulaire.

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur, je veux pouvoir supprimer une affaire directement depuis le formulaire de modification, afin de ne pas avoir à naviguer vers une autre interface pour effectuer cette action.

#### Acceptance Criteria

1. WHEN l'utilisateur ouvre le formulaire de modification d'une affaire existante THEN le système SHALL afficher un bouton "Supprimer" en plus des boutons "Enregistrer" et "Fermer"
2. WHEN l'utilisateur clique sur le bouton "Supprimer" THEN le système SHALL demander une confirmation avant de procéder à la suppression
3. WHEN l'utilisateur confirme la suppression THEN le système SHALL supprimer l'affaire de la base de données
4. WHEN la suppression est réussie THEN le système SHALL fermer le formulaire et afficher un message de confirmation
5. WHEN la suppression échoue THEN le système SHALL afficher un message d'erreur approprié
6. WHEN l'utilisateur crée une nouvelle affaire (pas encore sauvegardée) THEN le bouton "Supprimer" SHALL NOT être visible

### Requirement 2

**User Story:** En tant qu'utilisateur, je veux recevoir une confirmation avant la suppression d'une affaire, afin d'éviter les suppressions accidentelles.

#### Acceptance Criteria

1. WHEN l'utilisateur clique sur "Supprimer" THEN le système SHALL afficher une boîte de dialogue de confirmation
2. WHEN l'utilisateur confirme dans la boîte de dialogue THEN le système SHALL procéder à la suppression
3. WHEN l'utilisateur annule dans la boîte de dialogue THEN le système SHALL fermer la boîte de dialogue sans supprimer l'affaire
4. IF l'affaire a des événements associés THEN le système SHALL informer l'utilisateur que ces données seront également supprimées

### Requirement 3

**User Story:** En tant qu'utilisateur, je veux que le bouton "Supprimer" soit visuellement distinct des autres boutons, afin de comprendre immédiatement la nature destructive de cette action.

#### Acceptance Criteria

1. WHEN le bouton "Supprimer" est affiché THEN le système SHALL utiliser une couleur ou un style qui indique une action destructive
2. WHEN le bouton "Supprimer" est affiché THEN le système SHALL positionner le bouton de manière à éviter les clics accidentels
3. WHEN l'utilisateur survole le bouton "Supprimer" THEN le système SHALL afficher un tooltip explicatif