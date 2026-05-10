# 2026-05-10 — Export de la fiche opportunité

## Contexte

L'issue https://github.com/koden-process/Projet-Unikalo-Meow/issues/127 demande de préparer une fiche opportunité transférable. Le besoin initial mentionnait Outlook, mais la décision produit retenue est de supprimer toute liaison Outlook et de fournir uniquement un téléchargement de la fiche.

## Changement

- Ajout de `frontend/src/helpers/OpportunitySheetExportHelper.ts`.
- Ajout d'un bouton de téléchargement dans `frontend/src/components/card/Layer.tsx`, visible depuis la fiche d'une opportunité existante.
- Ajout des libellés d'export dans `frontend/src/Translations.ts`.
- Ajout de la dépendance frontend `jspdf`.
- L'export génère un fichier PDF nommé `fiche-opportunite-<nom>.pdf`.

## Décisions implicites

Le PDF est généré côté navigateur avec `jspdf` pour éviter tout changement backend et fournir un téléchargement direct.

La dépendance PDF est chargée dynamiquement au clic afin de ne pas alourdir le chargement initial du board.

Les attributs de référence vers les contacts sont exportés uniquement sous forme de nom. Les coordonnées ou attributs détaillés du contact référencé ne sont pas inclus dans le fichier.

## Impact

- Aucun changement backend.
- Aucun changement de schéma MongoDB.
- Aucune intégration Outlook ajoutée.
- Compatibilité ascendante conservée : l'export s'appuie sur les données déjà chargées dans le store frontend.
