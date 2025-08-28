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
      
      // Créer le message personnalisé avec le nom de l'activité
      const activityName = casted.payload.name || 'Activité';
      const successMessage = Translations.ActivityDeletedConfirmation[DEFAULT_LANGUAGE].replace('{name}', activityName);
      
      // Afficher le message de confirmation
      store.dispatch(showModalSuccess(successMessage));
    } catch (error) {
      console.error(error);
      const message = await getErrorMessage(error);

      store.dispatch(showModalError(message));
    }

    listenerApi.cancelActiveListeners();
  },
});
