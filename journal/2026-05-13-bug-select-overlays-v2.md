# 2026-05-13 — Correction v2 des menus et calendriers en bas de fiche

## Contexte
Après la mise en production du correctif des menus et calendriers en espace contraint, les derniers champs d'une fiche opportunité très longue restaient problématiques. Les boutons des derniers `select` et des deux date pickers réagissaient, mais les popups ne s'affichaient pas lorsque l'ascenseur de la fiche était en bas.

## Changement
Le wrapper `frontend/src/components/common/SafeSpectrumFields.tsx` ne déclenche plus de scroll dans `onOpenChange(true)`.

Le repositionnement du champ reste effectué avant l'ouverture via les événements de capture (`pointerdown`, focus et clavier), mais il n'y a plus de mouvement du conteneur scrollable après l'ouverture déclarée par React Spectrum.

## Décisions implicites
React Spectrum ferme ses popovers lorsqu'un parent scrollable du déclencheur bouge pendant que la popup est ouverte. Le scroll dans `onOpenChange(true)` pouvait donc ouvrir puis fermer immédiatement la popup, ce qui correspondait au symptôme observé en production.

## Impact
- Frontend uniquement.
- Aucun changement API ou modèle MongoDB.
- Aucun changement de dépendance.
- Le correctif concerne les champs Spectrum déjà enveloppés par `SafeSpectrumFields`.

## Suivi
Vérifier en production-like une fiche opportunité longue avec le dernier select et les deux date pickers lorsque l'ascenseur de la fiche est positionné tout en bas.
