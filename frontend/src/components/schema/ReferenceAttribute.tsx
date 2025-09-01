import { Picker, Item } from '@adobe/react-spectrum';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAccounts } from '../../store/Store';
import { Account } from '../../interfaces/Account';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';
import { showAccountLayer } from '../../actions/Actions';

const getOptions = (accounts: Account[]) => {
  const list: JSX.Element[] = [];

  // Add "Add a contact" as the first option
  list.push(<Item key="__ADD_CONTACT__">+ Ajouter un contact</Item>);
  
  list.push(<Item key="">{Translations.NoneOption[DEFAULT_LANGUAGE]}</Item>);

  accounts?.sort((a, b) => a.name.localeCompare(b.name)).map((account) => {
    list.push(<Item key={account._id}>{account.name}</Item>);
  });

  return list;
};

export interface ReferenceAttributeProps {
  attributeKey: string;
  name: string;
  value: string | null;
  isDisabled: boolean;
  update: (index: string, value: string | null) => void;
}

export const ReferenceAttribute = ({
  attributeKey,
  name,
  value: valueDefault,
  isDisabled,
  update,
}: ReferenceAttributeProps) => {
  const [value, setValue] = useState(valueDefault ? valueDefault : '');
  const accounts = useSelector(selectAccounts);
  const dispatch = useDispatch();

  useEffect(() => {
    setValue(valueDefault ? valueDefault : '');
  }, [valueDefault]);

  const updateValue = (value: string) => {
    // Handle the special "Add Contact" option
    if (value === '__ADD_CONTACT__') {
      handleAddAccount();
      return; // Don't update the actual value, just trigger the add account modal
    }

    setValue(value);

    if (value === '') {
      update(attributeKey, null);
    } else {
      update(attributeKey, value);
    }
  };

  const handleAddAccount = () => {
    // Only allow adding an account when the form is not disabled
    if (!isDisabled) {
      dispatch(showAccountLayer());
    }
  };

  return (
    <div className="attribute">
      <Picker
        width="100%"
        aria-label={name}
        label={name}
        selectedKey={value}
        isDisabled={isDisabled}
        onSelectionChange={(key) => updateValue(key ? key.toString() : '')}
      >
        {getOptions(accounts)}
      </Picker>
    </div>
  );
};
