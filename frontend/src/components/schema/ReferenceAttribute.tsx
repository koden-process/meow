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

  list.push(<Item key="">{Translations.NoneOption[DEFAULT_LANGUAGE]}</Item>);

  accounts?.map((account) => {
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
      <div style={{ position: 'relative' }}>
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
        {/* This button should respect the disabled state of the form */}
        <div 
          style={{ 
            position: 'absolute', 
            right: '0', 
            bottom: '-20px', 
            fontSize: '14px', 
            color: isDisabled ? '#a0a0a0' : '#1473e6', 
            cursor: isDisabled ? 'default' : 'pointer',
            // The button should be visually disabled when the form is disabled
            opacity: isDisabled ? 0.7 : 1
          }}
          onClick={handleAddAccount}
        >
          + {Translations.AddButton[DEFAULT_LANGUAGE]}
        </div>
      </div>
    </div>
  );
};
