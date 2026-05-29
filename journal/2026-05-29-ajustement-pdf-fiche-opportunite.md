# 2026-05-29 — Ajustement esthétique du PDF fiche opportunité

## Contexte
Le PDF de fiche opportunité devait être rapproché d'un modèle fourni, tout en conservant un fond blanc pour la version finale. La première refonte avait structuré les données mais ne reproduisait pas encore suffisamment l'apparence attendue.

## Changement
- Refonte du rendu `frontend/src/helpers/OpportunitySheetExportHelper.ts` vers une mise en page A4 fixe avec fond blanc.
- Ajout de deux assets extraits du PDF de référence dans `frontend/public/pdf-assets/` :
  - `preskription-logo.png` ;
  - `unikalo-footer-logo.png`.
- Dessin en jsPDF des cartes, pictogrammes, footer, titres et lignes de données.
- Correction du libellé de footer en `Fiche opportunité - Export du ...`.
- Priorisation de `owner.name` pour le champ `Utilisateur`, avec fallback sur `_id`.
- Formatage de la devise `MT2` en surface (`m²`) sans format monétaire.

## Décisions implicites
Les logos sont embarqués comme images extraites du modèle pour préserver la fidélité visuelle, tandis que les pictogrammes restent dessinés en code afin de limiter les assets.

Le mapping des champs reste basé sur les libellés existants du schéma, avec une normalisation renforcée pour les accents, apostrophes typographiques et variantes de libellés.

## Impact
- Frontend uniquement.
- Aucun changement API, backend ou modèle MongoDB.
- Pas de nouvelle dépendance npm.
- L'export PDF dépend désormais de deux assets publics optionnels, avec fallback textuel si leur chargement échoue.

## Suivi
Vérifier visuellement le PDF généré sur une opportunité réelle contenant tous les champs du modèle, puis ajuster les espacements si les données client dépassent les longueurs prévues.
