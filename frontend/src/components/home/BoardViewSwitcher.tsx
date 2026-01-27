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
 * Composant pour switcher entre la vue Board et la vue Statistics
 */
export const BoardViewSwitcher = ({ mode, lanes, cards }: BoardViewSwitcherProps) => {
    return (
        <div className="lanes">
            {mode === 'board' && <Board lanes={lanes} cards={cards} />}
            {mode === 'statistics' && <StatisticsBoard lanes={lanes} />}
        </div>
    );
};
