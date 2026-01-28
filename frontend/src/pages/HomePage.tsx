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
