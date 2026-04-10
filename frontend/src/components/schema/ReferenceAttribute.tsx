import { ComboBox, Item } from '@adobe/react-spectrum';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAccounts } from '../../store/Store';
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
  const [value, setValue] = useState<string>(valueDefault ?? '');
  const [searchText, setSearchText] = useState<string>('');

  const accounts = useSelector(selectAccounts);
  const dispatch = useDispatch();

  // Stable & performant string comparison
  const collator = useMemo(
    () => new Intl.Collator(undefined, { sensitivity: 'base' }),
    []
  );

  // Sorted accounts (memoized)
  const sortedAccounts = useMemo(() => {
    return [...(accounts ?? [])].sort((a, b) =>
      collator.compare(a.name, b.name)
    );
  }, [accounts, collator]);

  // Items for ComboBox (data-driven pattern)
  const items = useMemo(() => {
    const normalizedSearch = searchText.toLowerCase();

    const baseItems = sortedAccounts
      .filter(acc =>
        acc.name.toLowerCase().includes(normalizedSearch)
      )
      .map(acc => ({
        id: acc._id,
        label: acc.name,
      }));

    // Show special options only when not searching
    if (!searchText) {
      return [
        { id: '__ADD_CONTACT__', label: '+ Ajouter un contact' },
        { id: '__NONE__', label: Translations.NoneOption[DEFAULT_LANGUAGE] },
        ...baseItems,
      ];
    }

    return baseItems;
  }, [sortedAccounts, searchText]);

  // Sync external value changes
  useEffect(() => {
    setValue(valueDefault ?? '');
  }, [valueDefault]);

  const handleAddAccount = useCallback(() => {
    if (!isDisabled) {
      dispatch(showAccountLayer());
    }
  }, [isDisabled, dispatch]);

  const updateValue = useCallback(
    (nextValue: string) => {
      if (nextValue === '__ADD_CONTACT__') {
        handleAddAccount();
        return;
      }

      if (nextValue === '__NONE__') {
        setValue('');
        update(attributeKey, null);
        return;
      }

      setValue(nextValue);
      update(attributeKey, nextValue || null);
    },
    [attributeKey, update, handleAddAccount]
  );

  return (
    <div className="attribute">
      <ComboBox
        width="100%"
        aria-label={name}
        label={name}
        selectedKey={value}
        isDisabled={isDisabled}
        items={items}
        onSelectionChange={(key) =>
          updateValue(key?.toString() ?? '')
        }
        inputValue={searchText}
        onInputChange={setSearchText}
      >
        {(item) => (
          <Item key={item.id} textValue={item.label}>
            {item.label}
          </Item>
        )}
      </ComboBox>
    </div>
  );
};