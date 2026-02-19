
import {useState, useMemo} from 'react';
import {Button, Item, Picker, ComboBox} from '@adobe/react-spectrum';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    selectCards,
    selectFilters,
    selectInterfaceState,
    selectLanes,
    selectActiveUsers,
    store,
    selectToken,
    selectAccounts,
    selectSchemaByType,
} from '../store/Store';
import { showCardLayer } from '../actions/Actions';
import { Layer as CardLayer } from '../components/card/Layer';
import { DragDropContext } from 'react-beautiful-dnd';
import { Layer as LaneLayer } from '../components/lane/Layer';
import { Layer as AccountLayer } from '../components/account/Layer';
import { DEFAULT_LANGUAGE } from '../Constants';
import { SchemaType } from '../interfaces/Schema';
import { Translations } from '../Translations';

// Hooks personnalisés
import { useCardEnrichment } from '../hooks/useCardEnrichment';
import { useCardFiltering } from '../hooks/useCardFiltering';
import { useFilterState } from '../hooks/useFilterState';

// Composants
import { BoardHeader } from '../components/home/BoardHeader';
import { FilterBar } from '../components/home/FilterBar';
import { BoardViewSwitcher } from '../components/home/BoardViewSwitcher';

// Services
import { createAccountMapping, createSelectMappings } from '../services/cardService';
import { handleDragStart, handleDragEnd } from '../services/dragDropHandlers';

export const enum FilterMode {
    // OwnedByMe = 'owned-by-me',
    RequireUpdate = 'require-update',
    RecentlyUpdated = 'recently-updated',
}

export const HomePage = () => {
    const cards = useSelector(selectCards);
    const lanes = useSelector(selectLanes);
    const users = useSelector(selectActiveUsers);
    const state = useSelector(selectInterfaceState);
    const filters = useSelector(selectFilters);
    const accounts = useSelector(selectAccounts);
    const token = useSelector(selectToken);
    const schema = useSelector((store: any) => selectSchemaByType(store, SchemaType.Card));
    const navigate = useNavigate();

    // Local state
    const [mode, setMode] = useState<'board' | 'statistics'>('board');

    // Hooks personnalisés
    useCardEnrichment(token);
    const { text, setText, userId, setUserId, selectedAccountId, setSelectedAccountId, handleFilterToggle } =
        useFilterState(filters);

    // Création des mappings (mémorisés pour éviter les recréations inutiles)
    const accountMapping = useMemo(() => createAccountMapping(accounts), [accounts]);
    const selectMappings = useMemo(() => createSelectMappings(schema, accountMapping), [schema, accountMapping]);

    // Filtrage et calcul du montant
    const { filteredCardsByAccount, amount } = useCardFiltering(
        cards,
        lanes,
        filters,
        selectedAccountId,
        selectMappings
    );

    const openCard = (id?: string) => {
        store.dispatch(showCardLayer(id));
    };


    if (window.location.pathname !== '/') {
        navigate('/');
        return null;
    }


    const getUserOptions = () => {
        const list: JSX.Element[] = [];
        [{_id: FILTER_BY_NONE.key, name: FILTER_BY_NONE.name}, ...users].forEach(user => {
            list.push(<Item key={user._id}>{user.name}</Item>);
        });
        return list;
    };

    return (
        <>
            {state === 'card-detail' && <CardLayer/>}
        {state === 'lane-detail' && <LaneLayer/>}
        {state === 'account-detail' && <AccountLayer/>}
            <div style={{position: 'relative'}}>
                {/* Bouton Add, collé en haut à droite */}
                <div style={{position: 'absolute', top: 12, right: 12, zIndex: 2}}>
                    <Button variant="primary" onPress={() => openCard()}>
                        {Translations.AddButton[DEFAULT_LANGUAGE]}
                    </Button>
                </div>

                {/* Ton contenu existant: filtres + DragDropContext + Board */}

                <div className="board">
                    <div className="title">
                        <div>
                            <div className="sum">
                                {mode === 'board' && (
                                    <button
                                        className="statistics-button"
                                        onClick={() => {
                                            setMode('statistics');
                                        }}
                                    ></button>
                                )}

                                {mode === 'statistics' && (
                                    <button
                                        className="statistics-button"
                                        style={{
                                            border: '1px solid var(--spectrum-global-color-gray-600)',
                                        }}
                                        onClick={() => {
                                            setMode('board');
                                        }}
                                    ></button>
                                )}
                                <h2>
                                    {getTitle(filteredCardsByAccount)} -
                                    <Currency value={amount}/>
                                </h2>


                            </div>
                        </div>

                        <div className="filters-canvas">
                            {/* All elements on the same horizontal line with filter buttons on the right */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px'
                            }}>
                                {/* Left side: input and pickers */}
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <input className="inputSpacing"
                                           onChange={(event) => setText(event.target.value)}
                                           placeholder={Translations.SearchPlaceholder[DEFAULT_LANGUAGE]}
                                           aria-label={Translations.NameOrStage[DEFAULT_LANGUAGE]}
                                           type="text"
                                    />

                                    <ComboBox
                                        aria-label={Translations.FilterByContact[DEFAULT_LANGUAGE]}
                                        placeholder={Translations.FilterByContact[DEFAULT_LANGUAGE]}
                                        items={accountFiltered}
                                        inputValue={accountSearchText}
                                        onInputChange={setAccountSearchText}
                                        selectedKey={selectedAccountId}
                                        onSelectionChange={(key) => {
                                            const id = key ? key.toString() : '';
                                            setSelectedAccountId(id);
                                            if (id) {
                                                setAccountSearchText(accountMapping[id] || '');
                                            } else {
                                                setAccountSearchText('');
                                            }
                                        }}
                                    >
                                        {(item: any) => <Item key={item._id} textValue={item.name}>{item.name}</Item>}
                                    </ComboBox>

                                    {/* Picker pour filtrer par utilisateur */}
                                    <Picker
                                        aria-label={Translations.FilterByUser[DEFAULT_LANGUAGE]}
                                        selectedKey={userId}
                                        onSelectionChange={(key) => {
                                            if (key === null) return;
                                            setUserId(key.toString());
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
                                            onClick={() => handleFilterToggle(FilterMode.OwnedByMe)}
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
                                        onClick={() => handleFilterToggle(FilterMode.RecentlyUpdated)}
                                        style={{display: 'none'}}
                                    >
                                        {Translations.RecentlyUpdatedFilter[DEFAULT_LANGUAGE]}
                                    </button>
                                    <button
                                        className={`filter ${
                                            filters.mode.has(FilterMode.RequireUpdate)
                                                ? 'require-update-active'
                                                : 'require-update'
                                        }`}
                                        onClick={() => handleFilterToggle(FilterMode.RequireUpdate)}
                                    >
                                        {Translations.RequiresUpdateFilter[DEFAULT_LANGUAGE]}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div style={{paddingLeft: '10px'}}>

                    </div>

                    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                        {/* Corbeille commentée - suppression via bouton uniquement
                    {!isMobileLayout && (
                        <div className="trash-canvas" style={{marginRight: '100px'}}>
                            <Trash/>
                        </div>
                    )}
                    */}

                        <div className="lanes">
                            {mode === 'board' && <Board lanes={lanes}
                                                        cards={filteredCardsByAccount}/>} {/* Les lanes utilisent les cards filtrées */}
                            {mode === 'statistics' && <StatisticsBoard lanes={lanes}/>} {/* Idem */}
                        </div>
                    </DragDropContext>

                </div>
            </div>
        </>
    );
};
