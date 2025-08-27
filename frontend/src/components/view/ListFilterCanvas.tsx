import { useMemo } from 'react';
import { ListViewItem } from '../../interfaces/ListView';
import { ActionButton, Menu, MenuTrigger, Item } from '@adobe/react-spectrum';
import { setListViewColumn } from '../../actions/Actions';
import { store } from '../../store/Store';
import { ListName } from '../../store/ApplicationStore';

export interface ListFilterCanvasProps {
  columns: ListViewItem[];
  name: ListName;
}

export const ListFilterCanvas = ({ columns, name }: ListFilterCanvasProps) => {
  const visibleKeys = useMemo(() => {
    return new Set(columns.filter(c => c.isHidden === false).map(c => c.column as string));
  }, [columns]);

  return (
    <div className="filter-canvas">
      <MenuTrigger>
        <ActionButton aria-label="Choix affichage" UNSAFE_style={{ minWidth: 160 }}>
          Choix affichage
        </ActionButton>
        <Menu
          selectionMode="multiple"
          selectedKeys={visibleKeys}
          onSelectionChange={(keys) => {
            // keys = Set des colonnes à afficher
            // Normaliser en Set<string>
            const set = new Set(Array.from(keys as Set<React.Key>).map(k => k.toString()));
            const list = columns.map((i) => ({ ...i, isHidden: !set.has(i.column as string) }));
            store.dispatch(setListViewColumn(name, list));
          }}
        >
          {columns.map((item) => (
            <Item key={item.column as string}>{item.name}</Item>
          ))}
        </Menu>
      </MenuTrigger>
    </div>
  );
};
