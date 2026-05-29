# 2026-05-29 — Correction v3 des menus en bas de fiche opportunité

## Contexte
Le correctif v2 sur les champs Adobe React Spectrum ne couvrait pas encore tous les cas de la fiche opportunité. Les tests ont montré que le bug touchait surtout les menus et calendriers ouverts tout en bas de la fiche lorsqu'elle était affichée au-dessus de pages scrollées comme le kanban ou les contacts.

## Changement
`frontend/src/components/card/Layer.tsx` encapsule désormais la fiche opportunité dans un `UNSAFE_PortalProvider` afin que les overlays Spectrum (menus et calendriers) soient rendus dans la layer elle-même plutôt que dans le `document.body` global.

`frontend/src/components/common/SafeSpectrumFields.tsx` a été simplifié : le wrapper ne déclenche plus aucun scroll préventif au `pointerdown`, au focus ou au clavier. Les composants React Spectrum conservent simplement `shouldFlip`, et le positionnement de l'overlay est laissé à la bibliothèque.

`frontend/src/App.css` donne aussi au wrapper `.safe-spectrum-field` un vrai conteneur de layout avec `position: relative`, ce qui stabilise le calcul des overlays proches du bas du viewport.

## Décisions implicites
La correction privilégie un conteneur de portal local à la fiche plutôt qu'un rendu des overlays dans le `body` global. Sur les écrans scrollés, cette approche évite que les menus et calendriers soient calculés hors de la zone visible alors que le déclencheur, lui, est dans un panneau `fixed`.

## Impact
- Frontend uniquement.
- Aucun changement API ou modèle MongoDB.
- Aucun changement de dépendance.
- Les `Picker`, `ComboBox`, `DatePicker` et `DateRangePicker` enveloppés par `SafeSpectrumFields` ne déclenchent plus de scroll programmatique avant ouverture.
- Les overlays de la fiche opportunité sont maintenant rendus dans la layer elle-même.

## Suivi
Vérifier manuellement les cas kanban et contacts, ainsi que la non-régression sur forecast et activity.
