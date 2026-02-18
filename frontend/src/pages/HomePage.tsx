import { useState, useMemo } from 'react';
import { Button } from '@adobe/react-spectrum';
import { useSelector } from 'react-redux';
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
    const currentUserId = useSelector(selectUserId);

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
            {state === 'card-detail' && <CardLayer />}
            {state === 'lane-detail' && <LaneLayer />}
            {state === 'account-detail' && <AccountLayer />}

            <div style={{ position: 'relative' }}>
                {/* Bouton Add, collé en haut à droite */}
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                    <Button variant="primary" onPress={() => openCard()}>
                        {Translations.AddButton[DEFAULT_LANGUAGE]}
                    </Button>
                </div>

                <div className="board">
                    <BoardHeader
                        mode={mode}
                        cards={filteredCardsByAccount}
                        amount={amount}
                        onModeChange={setMode}
                    />

                    <FilterBar
                        text={text}
                        onTextChange={setText}
                        selectedAccountId={selectedAccountId}
                        onAccountChange={setSelectedAccountId}
                        userId={userId}
                        onUserChange={setUserId}
                        filters={filters}
                        onFilterToggle={handleFilterToggle}
                        accounts={accounts}
                        users={users}
                    />

                    <DragDropContext
                        onDragStart={handleDragStart}
                        onDragEnd={(result) => handleDragEnd(result, cards)}
                    >
                        <BoardViewSwitcher mode={mode} lanes={lanes} cards={filteredCardsByAccount} />
                    </DragDropContext>
                </div>
            </div>
        </>
    );
};
