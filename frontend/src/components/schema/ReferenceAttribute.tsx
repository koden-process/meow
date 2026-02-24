import { ComboBox, Item } from '@adobe/react-spectrum';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAccounts } from '../../store/Store';
import { Account } from '../../interfaces/Account';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';
import { showAccountLayer } from '../../actions/Actions';

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
  const [searchText, setSearchText] = useState<string>('');
  const accounts = useSelector(selectAccounts);
  const dispatch = useDispatch();

  // Memoize the sorted accounts to avoid re-sorting on every render
  const sortedAccounts = useMemo(() => {
    return [...(accounts || [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts]);

  // Memoize the filtered accounts based on search text
  const filteredAccounts = useMemo(() => {
    if (!searchText) {
      return sortedAccounts;
    }
    return sortedAccounts.filter(acc =>
      acc.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [sortedAccounts, searchText]);

  // Memoize the options generation to avoid rebuilding JSX on every render
  const options = useMemo(() => {
    const list: JSX.Element[] = [];

    // Add "Add a contact" as the first option
    list.push(<Item key="__ADD_CONTACT__">+ Ajouter un contact</Item>);
    
    list.push(<Item key="">{Translations.NoneOption[DEFAULT_LANGUAGE]}</Item>);

    // Add filtered accounts
    filteredAccounts.forEach((account) => {
      list.push(<Item key={account._id}>{account.name}</Item>);
    });

    return list;
  }, [filteredAccounts]);

  useEffect(() => {
    setValue(valueDefault ? valueDefault : '');
  }, [valueDefault]);

  // Memoize updateValue to prevent unnecessary re-renders
  const updateValue = useCallback((value: string) => {
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
  }, [attributeKey, update]);

  const handleAddAccount = useCallback(() => {
    // Only allow adding an account when the form is not disabled
    if (!isDisabled) {
      dispatch(showAccountLayer());
    }
  }, [isDisabled, dispatch]);

  return (
    <div className="attribute">
      <ComboBox
        width="100%"
        aria-label={name}
        label={name}
        selectedKey={value}
        isDisabled={isDisabled}
        onSelectionChange={(key) => updateValue(key ? key.toString() : '')}
        inputValue={searchText}
        onInputChange={setSearchText}
      >
        {options}
      </ComboBox>
    </div>
  );
};
