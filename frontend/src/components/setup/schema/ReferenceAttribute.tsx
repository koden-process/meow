import { Item, Picker, TextField } from '@adobe/react-spectrum';
import { useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { SchemaReferenceAttribute, SchemaType } from '../../../interfaces/Schema';

export interface ReferenceAttributeProps {
  attributeKey: string;
  name: string;
  index: number;
  entity: SchemaType | null;
  remove: (index: number) => void;
  update: (key: string, item: Partial<SchemaReferenceAttribute>) => void;
}

export const ReferenceAttribute = ({
  attributeKey,
  name: nameDefault,
  entity: entityDefault,
  index,
  remove,
  update,
}: ReferenceAttributeProps) => {
  const [name, setName] = useState(nameDefault);
  const [entity, setEntity] = useState(entityDefault);
  const relationship = 'many-to-one';

  useEffect(() => {
    update(attributeKey, { name, entity, relationship });
  }, [name, entity]);

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
              <div className="reference">
                <Picker
                  width="100%"
                  selectedKey={entity}
                  onSelectionChange={(key) => setEntity(key.toString() as SchemaType)}
                >
                  {Object.entries(SchemaType)
                    .filter((item) => item[1] === 'account')
                    .map(([value, key]) => {
                      return <Item key={key}>{value}</Item>;
                    })}
                </Picker>
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
