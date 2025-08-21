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
}

// TODO rename component
export const Form = ({ update, id, onPreviewChange }: FormProps) => {
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
    if (onPreviewChange) {
      onPreviewChange(newPreview);
    }
  };

  let isValidForm = useMemo(() => {
    if (preview.name) {
      return true;
    }

    return false;
  }, [preview]);

  const account = useSelector((store: ApplicationStore) => selectAccount(store, id));

  useEffect(() => {
    let newPreview;
    if (account) {
      newPreview = {
        ...account,
      };
    } else {
      newPreview = {
        name: '',
        attributes: undefined,
      };
    }
    setPreview(newPreview);
    if (onPreviewChange) {
      onPreviewChange(newPreview);
    }
  }, [account, onPreviewChange]);

  const validate = (values: Attribute) => {
    const newPreview = {
      ...preview,
      attributes: {
        ...values,
      },
    };
    setPreview(newPreview);
    if (onPreviewChange) {
      onPreviewChange(newPreview);
    }
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
          aria-label={Translations.NameLabel[DEFAULT_LANGUAGE]}
          width="100%"
          key="name"
          label={Translations.NameLabel[DEFAULT_LANGUAGE]}
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
