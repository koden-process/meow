import { Translations } from '../../../Translations';
import { DEFAULT_LANGUAGE } from '../../../Constants';
import { DeletedEvent } from '../../../interfaces/CardEvent';

export interface DeletedProps {
  event: DeletedEvent;
}

export const Deleted = ({ event }: DeletedProps) => {
  return <>{Translations.OpportunityDeleted[DEFAULT_LANGUAGE]}</>;
};