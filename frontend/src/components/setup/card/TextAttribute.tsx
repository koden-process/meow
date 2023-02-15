import { TextField } from '@adobe/react-spectrum';
import { useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { AttributeListItem } from './SchemaCanvas';

export interface TextAttributeProps {
  id: number;
  name: string;
  index: number;
  remove: (index: number) => void;
  update: (index: number, item: Partial<AttributeListItem>) => void;
}

export const TextAttribute = ({
  id,
  name: nameDefault,
  index,
  remove,
  update,
}: TextAttributeProps) => {
  const [name, setName] = useState(nameDefault);

  useEffect(() => {
    update(index, { name });
  }, [name]);

  return (
    <Draggable draggableId={`drag_${id}`} index={index}>
      {(provided, snaphot) => {
        return (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <div className="item">
              <div className="button">
                <div className="drag"></div>
              </div>

              <div className="name">
                <TextField value={name} onChange={setName} />
              </div>
              <div className="placeholder-text"></div>
              <div onClick={() => remove(index)} className="button">
                <div className="remove"></div>
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
};
