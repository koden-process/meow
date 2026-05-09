# ADR — Architecture Decision Records

Ce dossier contient les décisions d'architecture prises sur le projet Meow.

---

## Pourquoi des ADR sur ce projet ?

Meow a connu plusieurs virages techniques significatifs depuis son lancement : abandon de TypeORM, introduction d'une architecture événementielle, migration de CRA vers Vite, couplage fort avec MongoDB. Ces décisions ne sont pas lisibles dans le code — seul leur résultat est visible. Les ADR documentent le *pourquoi*, pas le *quoi*.

Tout agent (humain ou IA) qui arrive sur le projet doit lire les ADR avant de toucher aux couches concernées.

---

## ADR vs Journal — quelle différence ?

| | ADR | Journal |
|---|---|---|
| **Objet** | Décision d'architecture | Modification apportée au projet |
| **Quand écrire** | Au moment d'une décision structurante | Après chaque changement non trivial |
| **Durée de vie** | Permanente — jamais supprimée | Permanente — trace historique |
| **Exemple** | "On supprime TypeORM parce que…" | "Migration MongoDB du 2026-05-09 : impact sur les indexes" |

---

## Format des fichiers

Les fichiers ADR sont nommés `NNNN-slug-court.md` avec numérotation séquentielle à quatre chiffres :

```
0001-suppression-typeorm-driver-mongodb-natif.md
0002-architecture-evenementielle-node-eventemitter.md
```

---

## Statuts possibles

- **Proposed** — en discussion, pas encore validée
- **Accepted** — décision actée, appliquée dans le code
- **Deprecated** — décision dépassée mais conservée pour l'historique
- **Superseded by ADR-NNNN** — remplacée par une décision ultérieure

Une ADR n'est jamais supprimée. Si une décision est abandonnée, on la marque `Deprecated` ou `Superseded` et on crée une nouvelle ADR.

---

## Template

```markdown
# ADR-NNNN — Titre court et explicite

- Statut : Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
- Date : YYYY-MM-DD
- Décideurs : <nom ou rôle>
- Tags : <mots-clés optionnels>

## Contexte
Pourquoi cette décision est nécessaire.

## Décision
Ce qui est décidé. Formulé à l'impératif.

## Conséquences
Effets attendus, positifs comme négatifs.

## Alternatives considérées
Au moins une alternative avec les raisons du rejet.

## Liens
- ADR liées
- Entrées journal pertinentes
- Documents ou tickets de référence
```

---

## Index

| # | Titre | Statut | Date |
|---|---|---|---|
| [0001](0001-suppression-typeorm-driver-mongodb-natif.md) | Suppression de TypeORM au profit du driver MongoDB natif | Accepted | 2023-09-20 |
| [0002](0002-architecture-evenementielle-node-eventemitter.md) | Architecture événementielle via Node EventEmitter | Accepted | 2023-07-18 |
