import { useMemo } from 'react';
import { Button, Item, Picker, ComboBox } from '@adobe/react-spectrum';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE, FILTER_BY_NONE } from '../../Constants';
import { FilterMode } from '../../pages/HomePage';
import { User } from '../../interfaces/User';
import { Account } from '../../interfaces/Account';

interface FilterBarProps {
    text: string;
    onTextChange: (text: string) => void;
    selectedAccountId: string;
    onAccountChange: (accountId: string) => void;
    accountSearchText: string;
    onAccountSearchTextChange: (text: string) => void;
    hasFavorites: boolean;
    accountsForFilter: Account[];
    accountMapping: { [id: string]: string };
    userId: string;
    onUserChange: (userId: string) => void;
    filters: { mode: Set<FilterMode> };
    onFilterToggle: (key: FilterMode) => void;
    users: User[];
    onReset: () => void;
}

/**
 * Component for the filter bar (search, selectors, buttons)
 */
export const FilterBar = ({
    text,
    onTextChange,
    selectedAccountId,
    onAccountChange,
    accountSearchText,
    onAccountSearchTextChange,
    hasFavorites,
    accountsForFilter,
    accountMapping,
    userId,
    onUserChange,
    filters,
    onFilterToggle,
    users,
    onReset,
}: FilterBarProps) => {
    const accountFiltered = useMemo(() => {
        if (!accountSearchText) return accountsForFilter;
        return accountsForFilter.filter(acc =>
            acc.name.toLowerCase().includes(accountSearchText.toLowerCase())
        );
    }, [accountsForFilter, accountSearchText]);

    const getUserOptions = () => {
        const list: JSX.Element[] = [];
        [{ _id: FILTER_BY_NONE.key, name: FILTER_BY_NONE.name }, ...users].forEach(user => {
            list.push(<Item key={user._id}>{user.name}</Item>);
        });
        return list;
    };

    return (
        <div className="filters-canvas">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                {/* Left side: clear action + input and pickers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        className="inputSpacing"
                        value={text}
                        onChange={(event) => onTextChange(event.target.value)}
                        placeholder={Translations.SearchPlaceholder[DEFAULT_LANGUAGE]}
                        aria-label={Translations.NameOrStage[DEFAULT_LANGUAGE]}
                        type="text"
                    />
                    <ComboBox
                        aria-label={hasFavorites ? '★ Contacts favoris' : Translations.FilterByContact[DEFAULT_LANGUAGE]}
                        items={accountFiltered}
                        inputValue={accountSearchText}
                        onInputChange={onAccountSearchTextChange}
                        selectedKey={selectedAccountId}
                        onSelectionChange={(key) => {
                            const id = key ? key.toString() : '';
                            onAccountChange(id);
                            onAccountSearchTextChange(id ? accountMapping[id] || '' : '');
                        }}
                    >
                        {(item: Account) => <Item key={item._id} textValue={item.name}>{item.name}</Item>}
                    </ComboBox>
                    <Picker
                        aria-label={Translations.FilterByUser[DEFAULT_LANGUAGE]}
                        selectedKey={userId}
                        onSelectionChange={(key) => {
                            if (key === null) return;
                            onUserChange(key.toString());
                        }}
                    >
                        {getUserOptions()}
                    </Picker>
                    {(selectedAccountId || text || accountSearchText) && (
                        <Button variant="secondary" onPress={onReset}>
                            Réinitialiser
                        </Button>
                    )}
                </div>

                {/* Right side: filter buttons */}
                <div>
                    <button
                        className={`filter ${
                            filters.mode.has(FilterMode.RecentlyUpdated)
                                ? 'recently-updated-active'
                                : 'recently-updated'
                        }`}
                        onClick={() => onFilterToggle(FilterMode.RecentlyUpdated)}
                        style={{ display: 'none' }}
                    >
                        {Translations.RecentlyUpdatedFilter[DEFAULT_LANGUAGE]}
                    </button>
                    <button
                        className={`filter ${
                            filters.mode.has(FilterMode.RequireUpdate) ? 'require-update-active' : 'require-update'
                        }`}
                        onClick={() => onFilterToggle(FilterMode.RequireUpdate)}
                    >
                        {Translations.RequiresUpdateFilter[DEFAULT_LANGUAGE]}
                    </button>
                </div>
            </div>
        </div>
    );
};
