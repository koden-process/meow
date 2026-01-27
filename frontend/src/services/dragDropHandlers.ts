import { DropResult } from 'react-beautiful-dnd';
import { Card } from '../interfaces/Card';
import { store } from '../store/Store';
import { ActionType } from '../actions/Actions';

/**
 * Gère le début du drag (affichage de la corbeille)
 */
export const handleDragStart = () => {
    const trash = document.getElementById('trash');
    if (trash) {
        trash.style.opacity = '1';
    }
};

/**
 * Gère la fin du drag (déplacement de la card ou suppression)
 */
export const handleDragEnd = (result: DropResult, cards: Card[]) => {
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
        if (result.destination.droppableId === 'trash') {
            store.dispatch({
                type: ActionType.CARD_DELETE,
                payload: card,
            });
        } else {
            card!.laneId = result.destination.droppableId;
            // TODO create action
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
