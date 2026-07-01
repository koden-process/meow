# 2026-06-28 — Template PDF d'opportunité configurable

## Contexte

La première proposition de personnalisation du PDF d'opportunité mélangeait dans
Meow des assets, libellés et règles de présentation propres à un déploiement.
La personnalisation doit rester possible sans introduire de connaissance client
dans le code générique.

## Changement

- Ajout de `frontend/src/helpers/OpportunityExportContext.ts`, qui construit le
  contrat générique et versionné `OpportunityExportContextV1`.
- Ajout de `frontend/src/helpers/OpportunityPdfTemplate.ts`, qui charge un
  template HTML Mustache, rend uniquement des interpolations échappées, assainit
  le HTML avec DOMPurify et le convertit en A4 avec jsPDF.
- Ajout de `VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL` dans la configuration
  frontend au build et au runtime Docker.
- Conservation du générateur PDF générique comme repli en cas d'absence de
  configuration ou d'erreur de chargement/rendu.
- Ajout de Vitest et de tests ciblant le contrat, la sécurité du template et le
  choix entre PDF personnalisé et générique.
- Suppression du test d'exemple Create React App obsolète, qui recherchait encore
  le texte `learn react` et n'avait jamais été raccordé à un script de test.
- Exécution des tests frontend dans la CI et passage de son runtime à Node 20,
  version compatible avec Vite 7 et Vitest.

## Décisions implicites

Le template et ses assets sont hébergés hors de Meow sur des origines autorisant
CORS. Les champs personnalisés sont accessibles par leur clé dans
`attributesByKey`; aucune clé de déploiement n'est codée dans l'application.

Le contexte JSON est un contrat interne au moteur d'export. Aucun bouton
d'export JSON n'est ajouté.

## Impact

- Aucun changement backend ou MongoDB.
- Les déploiements sans nouvelle variable conservent exactement le PDF
  générique existant.
- Les templates, images et polices externes doivent être accessibles au
  navigateur avec une politique CORS adaptée.
- Les interpolations Mustache non échappées sont refusées.
