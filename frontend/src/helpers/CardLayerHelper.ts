import { showCardLayer, showModalError } from '../actions/Actions';
import { DEFAULT_LANGUAGE } from '../Constants';
import { Translations } from '../Translations';
import { store } from '../store/Store';

const getOpenCardLayer = () => {
  const { ui } = store.getState();

  if (ui.state === 'card-detail') {
    return { isOpen: true, id: ui._id };
  }

  if (ui.previousState === 'card-detail') {
    return { isOpen: true, id: ui.previousId };
  }

  return { isOpen: false, id: undefined };
};

export const openCardLayerOrWarn = (id?: string) => {
  const openCard = getOpenCardLayer();

  if (openCard.isOpen) {
    if (openCard.id === id) {
      return;
    }

    store.dispatch(showModalError(Translations.OpportunityAlreadyOpenMessage[DEFAULT_LANGUAGE]));
    return;
  }

  store.dispatch(showCardLayer(id));
};
