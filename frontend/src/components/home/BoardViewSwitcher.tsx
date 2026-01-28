import { Board } from '../Board';
import { StatisticsBoard } from '../StatisticsBoard';
import { Lane } from '../../interfaces/Lane';
import { Card } from '../../interfaces/Card';

interface BoardViewSwitcherProps {
    mode: 'board' | 'statistics';
    lanes: Lane[];
    cards: Card[];
}

/**
 * Component to switch between the Board view and the Statistics view
 */
export const BoardViewSwitcher = ({ mode, lanes, cards }: BoardViewSwitcherProps) => {
    return (
        <div className="lanes">
            {mode === 'board' && <Board lanes={lanes} cards={cards} />}
            {mode === 'statistics' && <StatisticsBoard lanes={lanes} />}
        </div>
    );
};
