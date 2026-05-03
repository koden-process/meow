import { ActionType } from '../actions/Actions';
import { getRequestClient } from './RequestHelper';
import { store, selectTeamId, selectToken } from '../store/Store';
import type { RootState } from '../store/Store';

/**
 * Recharge équipe, utilisateurs, schémas, lanes et comptes depuis l’API et met à jour le store,
 * pour que toute l’application reflète les changements faits dans les paramètres sans navigation.
 */
export async function refreshSharedApplicationState(): Promise<void> {
  const state = store.getState() as RootState;
  const token = selectToken(state);
  const teamId = selectTeamId(state);
  if (!token || !teamId) {
    return;
  }

  const client = getRequestClient(token);
  const [team, users, schemas, lanes, accounts] = await Promise.all([
    client.getTeam(teamId),
    client.getUsers(),
    client.fetchSchemas(),
    client.getLanes(),
    client.getAccounts(),
  ]);

  store.dispatch({ type: ActionType.TEAM_UPDATE, payload: team });
  store.dispatch({ type: ActionType.USERS, payload: [...users] });
  store.dispatch({ type: ActionType.SCHEMAS, payload: [...schemas] });
  store.dispatch({ type: ActionType.LANES, payload: [...lanes] });
  store.dispatch({ type: ActionType.ACCOUNTS, payload: [...accounts] });

  const currentUserId = store.getState().session.user?._id;
  if (currentUserId) {
    const me = users.find((u) => u._id === currentUserId);
    if (me) {
      store.dispatch({ type: ActionType.USER_SETTINGS_UPDATE, payload: me });
    }
  }
}
