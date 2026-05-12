# 2026-05-12 — Correction des menus et calendriers en espace contraint

## Contexte
Des utilisateurs rencontraient un bug dans les fiches opportunité très longues, notamment avec plus de 15 champs configurés et plusieurs listes déroulantes. Les menus de sélection et les calendriers des champs "prochain suivi" et "date de clôture prévue" devenaient difficiles ou impossibles à utiliser lorsqu'ils étaient ouverts près du bas d'une fenêtre ou dans un panneau scrollable.

## Changement
Ajout de wrappers communs dans `frontend/src/components/common/SafeSpectrumFields.tsx` pour les composants Adobe React Spectrum `Picker`, `ComboBox`, `DatePicker` et `DateRangePicker`.

Ces wrappers recentrent le champ dans son conteneur scrollable avant l'ouverture du menu ou du calendrier, puis conservent le comportement Spectrum existant, notamment le `shouldFlip` par défaut. Les imports directs ont été remplacés dans les écrans et composants concernés.

Des styles globaux ciblés ont été ajoutés dans `frontend/src/App.css` pour limiter la hauteur des popovers et permettre le scroll interne des listes et calendriers.

## Décisions implicites
Le correctif conserve Adobe React Spectrum et les menus ancrés plutôt que de remplacer les sélecteurs par des modales plein écran. Cette option limite le changement UX tout en traitant le problème de place dans les conteneurs scrollables.

## Impact
- Frontend uniquement.
- Aucun changement API ou modèle MongoDB.
- Aucun changement de configuration ou de dépendance.
- Les formulaires, filtres, pages forecast/statistiques/setup et modales utilisant des menus Spectrum bénéficient du même comportement.

## Suivi
Vérifier manuellement une fiche opportunité longue sur desktop et mobile, avec plusieurs listes et les deux champs de date ouverts près du bas de la fenêtre.
