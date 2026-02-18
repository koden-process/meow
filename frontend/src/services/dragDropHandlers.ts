import { DropResult } from 'react-beautiful-dnd';
import { Card } from '../interfaces/Card';
import { store } from '../store/Store';
import { ActionType } from '../actions/Actions';

/**
 * Controls the start of the drag (display of the trash can)
 */
export const handleDragStart = () => {
    // Trash feature disabled for now
    // const trash = document.getElementById('trash');
    // if (trash) {
    //     trash.style.opacity = '1';
    // }
};

/**
 * Handles the end of the drag (moving or deleting the card)
 */
export const handleDragEnd = (result: DropResult, cards: Card[]) => {
    // Trash feature disabled for now
    // const trash = document.getElementById('trash');
    // if (trash) {
    //     trash.style.opacity = '0.3';
    // }

    if (!result.destination?.droppableId) {
        return;
    }

    if (
        result.source?.droppableId === result.destination?.droppableId &&
        result.source.index === result.destination.index
    ) {
        return;
    }

    const card = cards.find((card) => card._id === result.draggableId);

    if (card) {
        // Trash feature disabled for now
        // if (result.destination.droppableId === 'trash') {
        //     store.dispatch({
        //         type: ActionType.CARD_DELETE,
        //         payload: card,
        //     });
        // } else {
            card.laneId = result.destination.droppableId;
            store.dispatch({
                type: ActionType.CARD_MOVE,
                payload: {
                    card: card,
                    to: result.destination.droppableId,
                    from: result.source.droppableId,
                    index: result.destination.index,
                },
            });
        // }
    }
};
