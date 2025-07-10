import { Button, TextField, DatePicker } from '@adobe/react-spectrum';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { parseDate } from '@internationalized/date';
import { selectUserId } from '../../store/Store';
import { CardFormPreview } from '../../interfaces/Card';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';

export interface FormMobileProps {
  onSubmit: (card: CardFormPreview) => void;
}

export const FormMobile = ({ onSubmit }: FormMobileProps) => {
  const userId = useSelector(selectUserId);
  const [preview, setPreview] = useState<CardFormPreview>({
    name: '',
    amount: '',
    laneId: '',
    attributes: undefined,
    userId: userId!,
  });

  const handlePreviewUpdate = (key: string, value: string | number) => {
    setPreview({
      ...preview,
      [key]: value,
    });
  };

  let isValidAmount = useMemo(
    () => /^[\d]{1,10}$/.test(preview.amount) && parseInt(preview.amount) > 0,
    [preview]
  );
  let isValidNextFollowUp = useMemo(() => preview.nextFollowUpAt, [preview]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(preview);
      }}
      style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}
    >
      <div className="card">
        <TextField
          label={Translations.NameLabel[DEFAULT_LANGUAGE]}
          value={preview.name}
          onChange={v => handlePreviewUpdate('name', v)}
          isRequired
          width="100%"
        />
        <TextField
          label={Translations.OpportunityAmount[DEFAULT_LANGUAGE]}
          value={preview.amount}
          onChange={v => handlePreviewUpdate('amount', v)}
          isRequired
          type="number"
          width="100%"
        />
        <div className="attribute">
          <DatePicker
            value={
              preview.nextFollowUpAt
                ? parseDate(preview.nextFollowUpAt.substring(0, 10))
                : undefined
            }
            onChange={value => handlePreviewUpdate('nextFollowUpAt', value ? value.toString() : '')}
            label={Translations.NextFollowUpLabel[DEFAULT_LANGUAGE]}
            validationState={isValidNextFollowUp ? 'valid' : 'invalid'}
          />
        </div>
      </div>
      <div className="card-submit" style={{ marginTop: 24 }}>
        <Button type="submit" variant="primary" isDisabled={!preview.name || !isValidAmount}>
          {Translations.AddButton[DEFAULT_LANGUAGE]}
        </Button>
      </div>
    </form>
  );
};
