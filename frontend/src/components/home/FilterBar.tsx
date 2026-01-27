import { Item, Picker } from '@adobe/react-spectrum';
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
    userId: string;
    onUserChange: (userId: string) => void;
    filters: { mode: Set<FilterMode> };
    onFilterToggle: (key: FilterMode) => void;
    accounts: Account[];
    users: User[];
}

/**
 * Composant pour la barre de filtres (recherche, sélecteurs, boutons)
 */
export const FilterBar = ({
    text,
    onTextChange,
    selectedAccountId,
    onAccountChange,
    userId,
    onUserChange,
    filters,
    onFilterToggle,
    accounts,
    users,
}: FilterBarProps) => {
    const getAccountOptions = () => {
        const list: JSX.Element[] = [];
        list.push(<Item key="">Filtrer par contact</Item>);
        accounts.forEach(acc => {
            list.push(<Item key={acc._id}>{acc.name}</Item>);
        });
        return list;
    };

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
                {/* Left side: input and pickers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        className="inputSpacing"
                        onChange={(event) => onTextChange(event.target.value)}
                        placeholder={Translations.SearchPlaceholder[DEFAULT_LANGUAGE]}
                        aria-label="Name or Stage"
                        type="text"
                        value={text}
                    />

                    {/* Picker pour filtrer par account/contact */}
                    <Picker
                        aria-label="Filtrer par contact"
                        selectedKey={selectedAccountId}
                        onSelectionChange={(key) => onAccountChange(key ? key.toString() : '')}
                    >
                        {getAccountOptions()}
                    </Picker>

                    {/* Picker pour filtrer par utilisateur */}
                    <Picker
                        aria-label="Filtrer par utilisateur"
                        selectedKey={userId}
                        onSelectionChange={(key) => {
                            if (key === null) return;
                            onUserChange(key.toString());
                        }}
                    >
                        {getUserOptions()}
                    </Picker>
                </div>

                {/* Right side: filter buttons */}
                <div>
                    {false && (
                        <button
                            className={`filter ${
                                filters.mode.has(FilterMode.OwnedByMe) ? 'owned-by-me-active' : 'owned-by-me'
                            }`}
                            onClick={() => onFilterToggle(FilterMode.OwnedByMe)}
                        >
                            {Translations.OnlyMyOpportunitiesFilter[DEFAULT_LANGUAGE]}
                        </button>
                    )}
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
