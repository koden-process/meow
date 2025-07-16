import { Lane } from './Lane';
import { Lane as LaneInterface } from '../interfaces/Lane';
import { Card } from '../interfaces/Card';

export interface BoardProps {
  lanes: LaneInterface[];
  cards?: Card[]; // cards filtrées à afficher
}

export const Board = ({ lanes, cards }: BoardProps) => {
  return (
    <>
      {lanes
        .filter((lane) => lane._id !== 'trash')
        .map((lane) => {
          // On ne passe à chaque Lane que les cards qui sont dans cette lane
          const cardsForLane = cards?.filter(card => card.laneId === lane._id);
          return (
            <Lane
              key={lane._id}
              lane={lane}
              numberOfLanes={lanes.filter((lane) => lane._id !== 'trash').length}
              cards={cardsForLane}
            />
          );
        })}
    </>
  );
};
