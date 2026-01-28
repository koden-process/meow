import { Currency } from '../Currency';
import { Card } from '../../interfaces/Card';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';

interface BoardHeaderProps {
    mode: 'board' | 'statistics';
    cards: Card[];
    amount: number;
    onModeChange: (mode: 'board' | 'statistics') => void;
}

/**
 * Component to display the board header with title, statistics, and a mode switch button
 */
export const BoardHeader = ({ mode, cards, amount, onModeChange }: BoardHeaderProps) => {
    const getTitle = (cards: Card[]) => {
        const count = cards.length;
        return count <= 1
            ? `${count} ${Translations.BoardTitle[DEFAULT_LANGUAGE]}`
            : `${count} ${Translations.BoardTitlePlural[DEFAULT_LANGUAGE]}`;
    };

    return (
        <div className="title">
            <div>
                <div className="sum">
                    {mode === 'board' && (
                        <button
                            className="statistics-button"
                            onClick={() => onModeChange('statistics')}
                        ></button>
                    )}

                    {mode === 'statistics' && (
                        <button
                            className="statistics-button"
                            style={{
                                border: '1px solid var(--spectrum-global-color-gray-600)',
                            }}
                            onClick={() => onModeChange('board')}
                        ></button>
                    )}
                    <h2>
                        {getTitle(cards)} - <Currency value={amount} />
                    </h2>
                </div>
            </div>
        </div>
    );
};
