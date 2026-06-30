# 2026-06-30 — Restauration MongoDB locale isolée

## Contexte

Les sauvegardes de données réelles doivent pouvoir être testées localement sans
écraser les bases de développement existantes, restaurer les utilisateurs
administrateurs MongoDB ou exposer les données sur le réseau.

## Changement

- Ajout d'un script générique de restauration des archives
  `mongodump --archive --gzip`.
- Utilisation d'un conteneur et d'un volume Docker dédiés, exposés uniquement sur
  `127.0.0.1:27018`.
- Restauration paramétrable d'une base source vers `meow_local_restore`, sans les
  collections `admin` ni la collection technique `restore`.
- Validation des collections principales et des références entre opportunités,
  équipes, utilisateurs, comptes, étapes et schémas.
- Ajout d'un helper interactif qui remplace uniquement le hash du mot de passe
  d'un utilisateur actif dans la copie locale.
- Ajout des formats de sauvegarde MongoDB aux exclusions Git.

## Décisions implicites

L'image MongoDB par défaut est `mongo:7.0.34` afin de correspondre à la version
de la sauvegarde ayant motivé l'outillage. Elle reste configurable par variable
d'environnement pour de futures archives.

Le script refuse tout remplacement implicite. L'option `--replace` ne supprime
que le conteneur `meow-local-restore` et le volume
`meow-local-restore-data`.

Les références structurelles orphelines vers une équipe font échouer la
restauration. Les références d'opportunités vers des utilisateurs ou étapes
absents sont signalées mais conservées : les réparer automatiquement modifierait
la copie source et masquerait une dette de qualité des données.

## Impact

- Aucun changement de schéma ou d'API Meow.
- Aucun secret ni fichier de sauvegarde versionné.
- Les MongoDB existants et les ports `27017` et `5971` ne sont pas modifiés.
- Les tests d'intégration backend ne doivent pas être lancés sur une copie de
  données client, car ils créent des données persistantes.
