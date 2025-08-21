import { createListenerMiddleware } from '@reduxjs/toolkit';
import { ActionType, ApplicationAccountDeleteAction, showModalError, showModalSuccess } from '../actions/Actions';
import { getRequestClient } from '../helpers/RequestHelper';
import { AccountStatus } from '../interfaces/Account';
import { ApplicationStore } from './ApplicationStore';
import { store } from './Store';
import { getErrorMessage } from '../helpers/ErrorHelper';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

export const accountDeleteListener = createListenerMiddleware();

accountDeleteListener.startListening({
  type: ActionType.ACCOUNT_DELETE,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as ApplicationStore;

    const client = getRequestClient(state.session.token);

    const casted = action as ApplicationAccountDeleteAction;

    try {
      // Ensure we have a valid account with all required fields
      const accountToUpdate = {
        _id: casted.payload._id,
        name: casted.payload.name,
        attributes: casted.payload.attributes,
        status: AccountStatus.Deleted,
        createdAt: casted.payload.createdAt,
        updatedAt: casted.payload.updatedAt,
      };

      await client.updateAccount(accountToUpdate);

      // Show success message
      store.dispatch(showModalSuccess(Translations.AccountDeletedConfirmation[DEFAULT_LANGUAGE]));
    } catch (error) {
      console.error(error);
      const message = await getErrorMessage(error);

      store.dispatch(showModalError(message));
    }

    listenerApi.cancelActiveListeners();
  },
});