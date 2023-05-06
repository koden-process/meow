import { Button, TextField } from '@adobe/react-spectrum';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { setListView, showAccountLayer } from '../actions/Actions';
import { Layer as AccountLayer } from '../components/account/Layer';
import {
  selectAccounts,
  selectInterfaceState,
  selectSchemaByType,
  selectView,
  store,
} from '../store/Store';
import { ListViewHelper } from '../helpers/ListViewHelper';
import { ApplicationStore } from '../store/ApplicationStore';
import { SchemaType } from '../interfaces/Schema';
import { ListHeader } from '../components/list/ListHeader';
import { toRelativeDate } from '../helpers/DateHelper';

export const AccountsPage = () => {
  const state = useSelector(selectInterfaceState);
  const accounts = useSelector(selectAccounts);
  const [search, setSearch] = useState('');
  const view = useSelector((store: ApplicationStore) =>
    selectView(store, 'accounts')
  );

  const [attributes, setAttributes] = useState<Array<string>>([]);

  const schema = useSelector((store: ApplicationStore) =>
    selectSchemaByType(store, SchemaType.Account)
  );

  const columns = attributes
    ? ['Name', ...attributes, 'CreatedAt']
    : ['Name', 'CreatedAt'];

  interface Row {
    id: string;
    Name: string;
    CreatedAt: string | null;
    [key: string]: string | number | null | undefined;
  }

  const openAccount = (id?: string) => {
    store.dispatch(showAccountLayer(id));
  };

  useEffect(() => {
    store.dispatch(
      setListView('accounts', {
        ...view,
        text: search,
      })
    );
  }, [search]);

  useEffect(() => {
    if (schema) {
      setAttributes(schema.schema.map((attribute) => attribute.name));
    }
  }, [schema]);

  const rows = useMemo(() => {
    let list = [];

    if (view.text) {
      const regex = new RegExp(view.text, 'i');

      list = accounts.filter((item) => regex.test(item.name));
    } else {
      list = [...accounts];
    }

    const column = view.column ?? columns[0]!;

    return list
      .map((account) => {
        const row: Row = {
          id: account.id,
          Name: account.name,
          CreatedAt: account.createdAt,
        };

        schema?.schema.map(({ name, key }) => {
          row[name] = account.attributes?.[key];
        });

        return row;
      })
      .sort((a, b) =>
        ListViewHelper.orderBy(view.direction, a[column], b[column])
      );
  }, [schema, view, accounts]);

  function getTableData(
    key: string,
    value: string | number | null | undefined
  ) {
    if (attributes.includes(key)) {
      return <td>{value}</td>;
    }
  }

  return (
    <>
      {state === 'account-detail' && <AccountLayer />}
      <div className="canvas">
        <div className="account-search-header">
          <div>
            <Button variant="primary" onPress={() => openAccount()}>
              Add
            </Button>
          </div>

          <div>
            <TextField
              onChange={setSearch}
              value={search}
              aria-label="Name"
              width="100%"
              key="search"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="content-box tile">
          <h2>{rows.length} Accounts</h2>

          <table className="list" style={{ width: '100%' }}>
            <tbody>
              <ListHeader
                name="accounts"
                sort={setListView}
                view={view}
                columns={columns}
              />

              {rows.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <span
                        onClick={() => openAccount(row.id?.toString())}
                        className="direct-link"
                      >
                        {row.Name}
                      </span>
                    </td>

                    {Object.entries(row).map(([key, value]) => {
                      return getTableData(key, value);
                    })}

                    <td>{toRelativeDate(row.CreatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
