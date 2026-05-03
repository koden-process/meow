import { Button } from '@adobe/react-spectrum';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { showModalError, showModalSuccess } from '../../../actions/Actions';
import { RESERVED_ATTRIBUTES } from '../../../Constants';
import {
  Schema,
  SchemaAttributeType,
  SchemaReferenceAttribute,
  SchemaSelectAttribute,
  SchemaType,
} from '../../../interfaces/Schema';
import { ApplicationStore } from '../../../store/ApplicationStore';
import { selectSchemaByType, selectToken, store } from '../../../store/Store';
import { Translations } from '../../../Translations';
import { DEFAULT_LANGUAGE } from '../../../Constants';
import { SchemaCanvas } from '../schema/SchemaCanvas';
import { hasDuplicateEntries } from '../../../helpers/Helper';
import { SchemaHelper } from '../../../helpers/SchemaHelper';
import { getRequestClient } from '../../../helpers/RequestHelper';
import { refreshSharedApplicationState } from '../../../helpers/RefreshApplicationState';

const protocol = window.location.protocol;
const domain = window.location.hostname;

export interface AccountSchemaProps {
  isDeveloperMode: boolean;
}

export const AccountSchema = ({ isDeveloperMode }: AccountSchemaProps) => {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  const schema = useSelector((store: ApplicationStore) =>
    selectSchemaByType(store, SchemaType.Account)
  );

  const [updatedSchema, setUpdatedSchema] = useState<Schema>({
    type: SchemaType.Account,
    attributes: [],
  });

  const token = useSelector(selectToken);

  const client = getRequestClient(token);

  const validate = useCallback((schema: Schema | undefined) => {
    if (!schema) {
      return;
    }

    const list = schema.attributes;

    if (list.some((item) => !item.name)) {
      setError(Translations.AttributeNameEmptyError[DEFAULT_LANGUAGE]);
      setIsValid(false);

      return;
    }

    const filtered: SchemaSelectAttribute[] = list
      .filter((item) => SchemaHelper.isSelectAttribute(item))
      .map((item) => item as SchemaSelectAttribute);

    if (
      filtered.some(
        (i) => !i.options || i.options.length === 0 || i.options.some((option) => !option)
      )
    ) {
      setError(Translations.DropdownEmptyError[DEFAULT_LANGUAGE]);
      setIsValid(false);

      return;
    }

    if (filtered.some((i) => i.options && hasDuplicateEntries(i.options))) {
      setError(Translations.DropdownUniqueError[DEFAULT_LANGUAGE]);
      setIsValid(false);

      return;
    }

    if (list.some((item) => RESERVED_ATTRIBUTES.includes(item.name.toLocaleLowerCase()))) {
      setError(Translations.ReservedNameError[DEFAULT_LANGUAGE]);
      setIsValid(false);

      return;
    }

    if (
      list.some(
        (item) =>
          item.type === SchemaAttributeType.Reference &&
          (item as SchemaReferenceAttribute).name === 'account'
      )
    ) {
      setError(Translations.SelfReferenceError[DEFAULT_LANGUAGE]);
      setIsValid(false);

      return;
    }

    let startsOrEndsWithSpaces = /(^\s+)|(\s+$)/;

    if (list.some((item) => startsOrEndsWithSpaces.test(item.name))) {
      setError(Translations.SpacesInNameError[DEFAULT_LANGUAGE]);
      setIsValid(false);

      return;
    }

    setError('');
    setIsValid(true);

    setUpdatedSchema({ ...schema });
  }, []);

  useEffect(() => {
    if (schema) {
      const next = { ...schema, attributes: [...schema.attributes] };
      setUpdatedSchema(next);
      validate(next);
    }
  }, [schema, validate]);

  const save = async () => {
    try {
      await client.updateSchema(updatedSchema);

      await refreshSharedApplicationState();

      store.dispatch(showModalSuccess(Translations.SetupChangedConfirmation[DEFAULT_LANGUAGE]));
    } catch (error) {
      console.error(error);

      store.dispatch(showModalError(error?.toString()));
    }
  };

  return (
    <div className="content-box">
      <div className="schema-editor-header">
        <div className="title">
          <h2>{Translations.DirectoryTitle[DEFAULT_LANGUAGE]}</h2>
        </div>
        {isDeveloperMode ? (
          <div className="endpoint">
            <b>POST/GET:</b> {protocol}//
            {domain}/api/accounts
          </div>
        ) : null}
      </div>

      <SchemaCanvas schema={updatedSchema} validate={validate} />
      <div style={{ marginTop: '10px' }}>
        <div style={{ marginBottom: '5px' }}>{error}</div>
        <Button onPress={save} variant="primary" isDisabled={!isValid}>
          {Translations.SaveButton[DEFAULT_LANGUAGE]}
        </Button>
      </div>
    </div>
  );
};
