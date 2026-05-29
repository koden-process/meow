# Services backend

Les services contiennent la logique métier qui dépasse une simple opération CRUD.

## Services existants

| Service | Chemin | Responsabilité |
|---|---|---|
| `ForecastService` | `backend/src/services/ForecastService.ts` | Agrège les montants et volumes d'opportunités par type de lane, période et utilisateur. |
| `ActivityService` | `backend/src/services/ActivityService.ts` | Construit le flux d'activité à partir des événements métier. |
| `AccountMergeService` | `backend/src/services/AccountMergeService.ts` | Fusionne deux comptes, remplace les références, déplace les événements et met à jour les favoris. |
| `TeamConfigService` | `backend/src/services/TeamConfigService.ts` | Exporte, applique, liste et supprime des configurations d'équipe. |

## Règles de conception

- Un controller ne doit pas porter une logique métier complexe.
- Les accès MongoDB restent centralisés via `DatabaseHelper` ou `EntityHelper`.
- Les erreurs exposées au HTTP doivent utiliser les classes de `backend/src/errors/`.
- Les effets de bord réutilisables doivent passer par l'architecture événementielle lorsque c'est pertinent.

## Risques actuels

- Certains services historiques lancent encore des `Error` génériques. Les nouvelles contributions doivent utiliser les erreurs typées.
- `TeamConfigService.applyConfig` recrée des lanes avec un nouveau `boardId`; toute évolution de cette fonctionnalité doit vérifier la cohérence du board.
- `AccountMergeService` touche plusieurs collections et doit être testé avec des scénarios de références croisées.

