import { Button, TextField } from '@adobe/react-spectrum';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Account, AccountPreview } from '../../interfaces/Account';
import { selectAccount, selectSchemaByType } from '../../store/Store';
import { ApplicationStore } from '../../store/ApplicationStore';
import { SchemaType } from '../../interfaces/Schema';
import { SchemaCanvas } from '../schema/SchemaCanvas';
import { Attribute } from '../../interfaces/Attribute';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';

export interface FormProps {
  id: Account['_id'] | undefined;
  update: (id: Account['_id'] | undefined, account: AccountPreview) => void;
  onPreviewChange?: (preview: AccountPreview) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// TODO rename component
export const Form = ({ update, id, onPreviewChange, onValidationChange }: FormProps) => {
  const [preview, setPreview] = useState<AccountPreview>({
    name: '',
    attributes: undefined,
  });

  const schema = useSelector((store: ApplicationStore) =>
    selectSchemaByType(store, SchemaType.Account)
  );

  const handlePreviewUpdate = (key: string, value: Attribute[typeof key]) => {
    const newPreview = {
      ...preview,
      [key]: value,
    };
    setPreview(newPreview);
    onPreviewChange?.(newPreview);
  };

  let isValidForm = useMemo(() => {
    const isValid = !!preview.name;
    onValidationChange?.(isValid);
    return isValid;
  }, [preview, onValidationChange]);

  const account = useSelector((store: ApplicationStore) => selectAccount(store, id));

  useEffect(() => {
    if (account) {
      setPreview({
        ...account,
      });
    } else {
      setPreview({
        name: '',
        attributes: undefined,
      });
    }
  }, [account]);

  const validate = (values: Attribute) => {
    const newPreview = {
      ...preview,
      attributes: {
        ...values,
      },
    };
    setPreview(newPreview);
    onPreviewChange?.(newPreview);
  };

  const save = () => {
    update(id, { ...preview });
  };

  return (
    <div style={{ padding: '15px' }}>
      <div style={{ marginTop: '10px' }}>
        <TextField
          onChange={(value) => handlePreviewUpdate('name', value)}
          value={preview.name}
          aria-label={Translations.AccountNameLabel[DEFAULT_LANGUAGE]}
          width="100%"
          key="name"
          label={Translations.AccountNameLabel[DEFAULT_LANGUAGE]}
        />
      </div>

      <SchemaCanvas
        values={account?.attributes}
        schema={schema!}
        validate={validate}
        isDisabled={false}
      />
    </div>
  );
};
