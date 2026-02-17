import { ApplicationStore } from '../store/ApplicationStore';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

export class LabelHelper {
  static getOpportunityAmountLabel(store: ApplicationStore): string {
    const customLabel = store.session.team?.customLabels?.opportunityAmount;
    return customLabel || Translations.OpportunityAmount[DEFAULT_LANGUAGE];
  }
}

