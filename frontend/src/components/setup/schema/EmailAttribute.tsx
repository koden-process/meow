import { TextField } from '@adobe/react-spectrum';
import { useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { SchemaAttribute } from '../../../interfaces/Schema';

export interface EmailAttributeProps {
  attributeKey: string;
  name: string;
  index: number;
  remove: (index: number) => void;
  update: (key: string, item: Partial<SchemaAttribute>) => void;
}

export const EmailAttribute = ({
  attributeKey,
  name: nameDefault,
  index,
  remove,
  update,
}: EmailAttributeProps) => {
  const [name, setName] = useState(nameDefault);

  useEffect(() => {
    update(attributeKey, { name });
  }, [name]);

  return (
    <Draggable draggableId={`drag_${attributeKey}`} index={index}>
      {(provided, snaphot) => {
        return (
          <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
            <div className={`item ${snaphot.isDragging ? 'is-dragging' : ''}`}>
              <div className="button">
                <div className="drag"></div>
              </div>

              <div className="name">
                <TextField value={name} onChange={setName} onBlur={() => setName(name.trim())} />
              </div>
              <div
                className="placeholder-text"
                style={{ lineHeight: '28px', padding: '0 0 0 5px' }}
              >
                @
              </div>
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
