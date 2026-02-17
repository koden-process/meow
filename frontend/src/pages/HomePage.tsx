import {useState} from 'react';
import {Button, Item, Picker} from '@adobe/react-spectrum';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';
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
    selectUserId,
} from '../store/Store';
import {
    ActionType,
    showCardLayer,
    showModalError,
    updateCards,
    updateFilter,
} from '../actions/Actions';
import {Layer as CardLayer} from '../components/card/Layer';
import {DragDropContext, DropResult} from 'react-beautiful-dnd';
import {Trash} from '../components/Trash';
import {Layer as LaneLayer} from '../components/lane/Layer';
import {Layer as AccountLayer} from '../components/account/Layer';
import {Currency} from '../components/Currency';
import {Board} from '../components/Board';
import {Card} from '../interfaces/Card';
import {Translations} from '../Translations';
import {useNavigate} from 'react-router-dom';
import {StatisticsBoard} from '../components/StatisticsBoard';
import {FILTER_BY_NONE, DEFAULT_LANGUAGE} from '../Constants';
import {CardHelper} from '../helpers/CardHelper';
import useMobileLayout from '../hooks/useMobileLayout';
import {getErrorMessage} from '../helpers/ErrorHelper';
import {getRequestClient} from '../helpers/RequestHelper';
import {SchemaType, SchemaAttributeType} from '../interfaces/Schema';
import {useMemo} from 'react';

export const enum FilterMode {
    OwnedByMe = 'owned-by-me',
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
    const schema = useSelector((store: any) => selectSchemaByType(store, SchemaType.Card));
    const currentUserId = useSelector(selectUserId);

    // Création du mapping id -> nom pour les accounts
    const accountMapping = Object.fromEntries(accounts.map(acc => [acc._id, acc.name]));

    // Création du mapping global pour les attributs de type référence
    const selectMappings: { [key: string]: { [id: string]: string } } = {};
    if (schema && schema.attributes) {
        schema.attributes.forEach(attr => {
            if (
                attr.type === SchemaAttributeType.Reference &&
                (attr as any).entity === 'contact'
            ) {
                selectMappings[attr.key] = accountMapping;
            }
            // Ici tu pourras ajouter architect/moe si tu as les mappings
        });
    }

    const [mode, setMode] = useState<'board' | 'statistics'>('board');
    const [text, setText] = useState<string>('');
    const [userId, setUserId] = useState(FILTER_BY_NONE.key);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    const isMobileLayout = useMobileLayout();

    const token = useSelector(selectToken);

    const client = getRequestClient(token);

    const navigate = useNavigate();

    const handleFilterToggle = (key: FilterMode) => {
        const updated = new Set(filters.mode);
        if (updated.has(key)) {
            updated.delete(key);
        } else {
            updated.add(key);
        }

        store.dispatch(updateFilter(updated, userId, text));
    };

    useEffect(() => {
        store.dispatch(updateFilter(new Set(filters.mode), userId, text));
    }, [text, userId]);

    useEffect(() => {
        const execute = async () => {
            try {
                let cards = await client.getCards();

                // Enrichissement des cards avec attributesReadable
                let enrichedCards = cards.map(card => {
                    const attributesReadable: Record<string, any> = {};
                    if (card.attributes && schema && schema.attributes) {
                        schema.attributes.forEach(attr => {
                            if (card.attributes && attr.key in card.attributes) {
                                const value = card.attributes[attr.key];
                                if (
                                    attr.type === SchemaAttributeType.Reference &&
                                    (attr as any).entity === 'contact' &&
                                    typeof value === 'string'
                                ) {
                                    attributesReadable[attr.key] = accountMapping[value] || value;
                                } else {
                                    attributesReadable[attr.key] = value;
                                }
                            }
                        });
                    }
                    return {...card, attributesReadable};
                });

                store.dispatch(updateCards([...enrichedCards]));
            } catch (error) {
                console.error(error);

                store.dispatch(showModalError(await getErrorMessage(error)));
            }
        };

        execute();
    }, [accounts, schema]);

    const openCard = (id?: string) => {
        store.dispatch(showCardLayer(id));
    };

    const [amount, setAmount] = useState(0);

    const getTitle = (cards: Card[]) => {
        const count = cards.length;

        return count <= 1
            ? `${count} ${Translations.BoardTitle[DEFAULT_LANGUAGE]}`
            : `${count} ${Translations.BoardTitlePlural[DEFAULT_LANGUAGE]}`;
    };

    // Nouveau filtrage par account sélectionné
    const filteredCardsByAccount = useMemo(() => {
        if (!selectedAccountId) return cards;
        // On cherche les cards qui ont l'ID de l'account dans leurs attributs (clé de type référence)
        return cards.filter(card => {
            if (!card.attributes) return false;
            return Object.values(card.attributes).includes(selectedAccountId);
        });
    }, [cards, selectedAccountId]);

    useEffect(() => {
        if (!lanes || !filteredCardsByAccount) {
            setAmount(0);
            return;
        }

        const lanesWithForecast = lanes.filter((lane) => lane.inForecast === true);

        setAmount(
            CardHelper.filterAll(lanesWithForecast, filteredCardsByAccount, filters, selectMappings).reduce((acc, card) => {
                return card.amount ? acc + card.amount : acc;
            }, 0)
        );
    }, [filteredCardsByAccount, lanes, filters, accounts, schema]);

    const onDragEnd = async (result: DropResult) => {
        const trash = document.getElementById('trash');

        if (trash) {
            trash.style.opacity = '0.3';
        }

        console.log(
            `move card ${result.draggableId} from lane ${result.source.droppableId} to lane ${result.destination?.droppableId}`
        );

        if (!result.destination?.droppableId) {
            return;
        }

        if (
            result.source?.droppableId === result.destination?.droppableId &&
            result.source.index === result.destination.index
        ) {
            console.log('guard: lane and index did not change, exit');
            return;
        }

        const card = cards.find((card) => card._id === result.draggableId);

        if (card) {
            const isLaneChange = result.source.droppableId !== result.destination.droppableId;

            if (isLaneChange && currentUserId !== card.userId) {
                store.dispatch(showModalError(Translations.CardMoveNotAllowedError[DEFAULT_LANGUAGE]));
                return;
            }

            if (result.destination.droppableId === 'trash') {
                store.dispatch({
                    type: ActionType.CARD_DELETE,
                    payload: card,
                });
            } else {
                card!.laneId = result.destination.droppableId;
                store.dispatch({
                    type: ActionType.CARD_MOVE,
                    payload: {
                        card: card,
                        to: result.destination.droppableId,
                        from: result.source.droppableId,
                        index: result.destination!.index,
                    },
                });
            }
        }
    };

    const onDragStart = () => {
        const trash = document.getElementById('trash');

        if (trash) {
            trash.style.opacity = '1';
        }
    };

    if (window.location.pathname !== '/') {
        navigate('/');
        return null;
    }

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
            <div style={{ position: 'relative' }}>
              {/* Bouton Add, collé en haut à droite */}
              <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
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
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'}}>
                            {/* Left side: input and pickers */}
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input className="inputSpacing"
                                       onChange={(event) => setText(event.target.value)}
                                       placeholder={Translations.SearchPlaceholder[DEFAULT_LANGUAGE]}
                                       aria-label="Name or Stage"
                                       type="text"
                                />

                                {/* Picker pour filtrer par account/contact */}
                                <Picker
                                    aria-label="Filtrer par contact"
                                    selectedKey={selectedAccountId}
                                    onSelectionChange={(key) => setSelectedAccountId(key ? key.toString() : '')}
                                >
                                    {getAccountOptions()}
                                </Picker>

                                {/* Picker pour filtrer par utilisateur */}
                                <Picker
                                    aria-label="Filtrer par utilisateur"
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
                                        style={{ display: 'none' }}
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
