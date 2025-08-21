import { createListenerMiddleware } from '@reduxjs/toolkit';
import { ActionType, ApplicationCardDeleteAction, showModalError, showModalSuccess } from '../actions/Actions';
import { getRequestClient } from '../helpers/RequestHelper';
import { CardStatus } from '../interfaces/Card';
import { ApplicationStore } from './ApplicationStore';
import { store } from './Store';
import { getErrorMessage } from '../helpers/ErrorHelper';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

export const cardDeleteListener = createListenerMiddleware();

cardDeleteListener.startListening({
  type: ActionType.CARD_DELETE,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as ApplicationStore;

    const client = getRequestClient(state.session.token);

    const casted = action as ApplicationCardDeleteAction;

    try {
      await client.updateCard({
        ...casted.payload,
        status: CardStatus.Deleted,
      }); // TODO update with one API call

      await client.updateBoard(state.session.user!._id, state.board);

      // Show success message
      store.dispatch(showModalSuccess(Translations.CardDeletedConfirmation[DEFAULT_LANGUAGE]));
    } catch (error) {
      console.error(error);
      const message = await getErrorMessage(error);

      store.dispatch(showModalError(message));
    }

    listenerApi.cancelActiveListeners();
  },
});
