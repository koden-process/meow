# 2026-05-29 — Refonte du PDF de la fiche opportunité

## Contexte
Le PDF exporté depuis la fiche opportunité restituait jusqu'ici un rendu générique en deux blocs (`Synthèse` puis `Informations de la fiche`). L'objectif était de le rapprocher d'un modèle métier existant, plus lisible, avec une hiérarchie visuelle forte et des sections fonctionnelles.

## Changement
`frontend/src/helpers/OpportunitySheetExportHelper.ts` a été refondu pour produire un PDF structuré avec :
- un en-tête mettant en avant le nom de l'opportunité ;
- la quotité affichée comme valeur principale ;
- un bloc de métadonnées compact (`Utilisateur`, `Étape`, `Créé le`, `Dernière MAJ`, `Prochain suivi`) ;
- trois sections déduites automatiquement des libellés existants du schéma : `INFORMATIONS GÉNÉRALES`, `INFORMATIONS CHANTIER` et `PARTIES PRENANTES`.

La déduction des sections repose sur les libellés de champs déjà présents dans la fiche opportunité et dans le PDF de référence, sans ajout de configuration spécifique côté métier.

## Décisions implicites
Le champ `Utilisateur` du PDF reprend l'identifiant du responsable (`user._id`), qui correspond dans la majorité des cas à l'adresse email attendue dans le document de référence.

La valeur mise en avant sous le titre réutilise la quotité déjà portée par le champ montant de l'opportunité, afin de rester compatible avec l'existant.

## Impact
- Frontend uniquement.
- Aucun changement API ou modèle MongoDB.
- Aucun changement de dépendance.
- L'export PDF devient plus orienté métier tout en conservant un comportement déductible à partir du schéma actuel.

## Suivi
Vérifier visuellement le rendu sur plusieurs opportunités ayant des combinaisons de champs différentes afin d'ajuster, si besoin, la répartition automatique entre sections.
