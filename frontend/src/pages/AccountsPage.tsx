import {Button} from '@adobe/react-spectrum';
import {useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {setListViewColumn, setListViewSortBy, showAccountLayer} from '../actions/Actions';
import {Layer as AccountLayer} from '../components/account/Layer';
import {
    selectAccounts,
    selectInterfaceState,
    selectSchemaByType,
    selectView,
    selectViewColumns,
    selectToken,
    selectSessionUser,
    selectFavoriteAccountIds,
    store,
} from '../store/Store';
import {ActionType} from '../actions/Actions';
import {getRequestClient} from '../helpers/RequestHelper';
import {ListViewHelper} from '../helpers/ListViewHelper';
import {ApplicationStore} from '../store/ApplicationStore';
import {Schema, SchemaType} from '../interfaces/Schema';
import {toRelativeDate} from '../helpers/DateHelper';
import {ListViewItem, DataRow} from '../interfaces/ListView';
import {TableHeader} from '../components/view/table/TableHeader';
import {TableCanvas} from '../components/view/table/TableCanvas';
import {ListFilterCanvas} from '../components/view/ListFilterCanvas';
import {ListSearchCanvas} from '../components/view/ListSearchCanvas';
import useMobileLayout from '../hooks/useMobileLayout';
import {Account} from '../interfaces/Account';
import {Item} from '../components/view/list/Item';
import {Row} from '../components/view/table/Row';
import {Layer as CardLayer} from '../components/card/Layer';
import {Translations} from '../Translations';
import {DEFAULT_LANGUAGE} from '../Constants';

const createListViewItemsFromSchema = (schema: Schema | undefined): ListViewItem[] => {
    const list = [
        {
            name: '',
            column: 'favorite',
            isHidden: false,
        },
        {
            name: Translations.AccountNameLabel[DEFAULT_LANGUAGE],
            column: 'name',
            isHidden: false,
        },
    ];

    schema?.attributes.map((attribute) => {
        list.push({
            name: attribute.name,
            column: attribute.key,
            isHidden: false,
        });
    });

    list.push({
        name: Translations.CreatedAtLabel[DEFAULT_LANGUAGE],
        column: 'createdAt',
        isHidden: false,
    });

    return list;
};

export const AccountsPage = () => {
    const state = useSelector(selectInterfaceState);
    const accounts = useSelector(selectAccounts);
    const view = useSelector((store: ApplicationStore) => selectView(store, 'accounts'));
    const columns = useSelector((store: ApplicationStore) => selectViewColumns(store, 'accounts'));
    const isMobileLayout = useMobileLayout();
    const token = useSelector(selectToken);
    const sessionUser = useSelector(selectSessionUser);
    const favoriteAccountIds = useSelector(selectFavoriteAccountIds);

    const client = getRequestClient(token);

    const schema = useSelector((store: ApplicationStore) =>
        selectSchemaByType(store, SchemaType.Account)
    );

    useEffect(() => {
        if (schema && columns.length === 0) {
            store.dispatch(setListViewColumn('accounts', createListViewItemsFromSchema(schema)));
        }
    }, [schema]);

    const openAccount = (id?: string) => {
        store.dispatch(showAccountLayer(id));
    };

    const handleToggleFavorite = async (e: React.MouseEvent, accountId: string) => {
        e.stopPropagation();
        if (!sessionUser) return;
        try {
            const updated = await client.toggleFavoriteAccount(sessionUser._id, accountId);
            store.dispatch({ type: ActionType.USER_SETTINGS_UPDATE, payload: updated });
        } catch (error) {
            console.error('Erreur lors du toggle favori:', error);
        }
    };

    const toDataRows = (list: Account[]) => {
        return list.map((account) => {
            const row: DataRow = {
                id: account._id,
                name: account.name,
                createdAt: account.createdAt,
            };

            schema?.attributes.map(({key}) => {
                row[key] = account.attributes?.[key];
            });
            return row;
        });
    };

    const rows = useMemo(() => {
        // Filter out accounts with status 'deleted'
        const visibleAccounts = accounts.filter((a) => a.status !== 'deleted');
        const list = toDataRows(visibleAccounts);

        return ListViewHelper.filterAndOrder(list, columns, view);
    }, [schema, view, accounts, columns]);

    const getCell = (row: DataRow, item: ListViewItem) => {
        switch (item.column) {
            case 'favorite':
                return (
                    <td key="favorite" style={{width: 36, textAlign: 'center'}}>
                        <button
                            className={`favorite-btn${favoriteAccountIds.includes(row.id!.toString()) ? ' is-favorite' : ''}`}
                            onClick={(e) => handleToggleFavorite(e, row.id!.toString())}
                            title={favoriteAccountIds.includes(row.id!.toString()) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                            {favoriteAccountIds.includes(row.id!.toString()) ? '★' : '☆'}
                        </button>
                    </td>
                );
            case 'name':
                return (
                    <td>
            <span onClick={() => openAccount(row.id?.toString())} className="direct-link">
              {row.name}
            </span>
                    </td>
                );
            case 'createdAt':
                return <td>{toRelativeDate(row.createdAt)}</td>;
            default:
                return <td>{item.column !== null && row[item.column]?.toString()}</td>;
        }
    };

    const getListItem = (row: DataRow, item: ListViewItem) => {
        switch (item.column) {
            case 'favorite':
                return (
                    <div key="favorite" style={{display: 'inline-block'}}>
                        <button
                            className={`favorite-btn${favoriteAccountIds.includes(row.id!.toString()) ? ' is-favorite' : ''}`}
                            onClick={(e) => handleToggleFavorite(e, row.id!.toString())}
                            title={favoriteAccountIds.includes(row.id!.toString()) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                            {favoriteAccountIds.includes(row.id!.toString()) ? '★' : '☆'}
                        </button>
                    </div>
                );
            case 'name':
                return (
                    <div key={item.column}>
            <span onClick={() => openAccount(row.id?.toString())} className="direct-link title">
              {row.name}
            </span>
                    </div>
                );
            case 'createdAt':
                return (
                    <div key={item.column}>
                        <b>{Translations.CreatedLabel[DEFAULT_LANGUAGE]}</b> {toRelativeDate(row.createdAt)}
                    </div>
                );
            default:
                return item.column !== null && row[item.column] ? (
                    <div key={item.column}>
                        <b>{item.name}:</b> {row[item.column]}
                    </div>
                ) : null;
        }
    };

    return (
        <>
            {state === 'account-detail' && <AccountLayer/>}
            {state === 'card-detail' && <CardLayer/>}

            <div className="canvas">
                <div className="list-view-header" style={{display: 'flex', alignItems: 'center'}}>
                    <h2><b>{Translations.DirectoryTitle[DEFAULT_LANGUAGE]}</b> - {rows.length} Contact{rows.length > 1 ? 's' : ''}</h2>
                    <div style={{marginLeft: 'auto'}}>
                        <Button variant="primary" onPress={() => openAccount()}>
                            {Translations.AddButton[DEFAULT_LANGUAGE]}
                        </Button>
                    </div>
                </div>
                <div className="toolbar" style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
                    <ListSearchCanvas name="accounts"/>
                    <ListFilterCanvas name="accounts" columns={columns}/>
                </div>

                {isMobileLayout ? (
                    <div className="mobile-view">
                        {rows.map((row, index) => (
                            <Item key={index}>
                                {columns
                                    .filter(({isHidden}) => isHidden === false)
                                    .map((item) => getListItem(row, item))}
                            </Item>
                        ))}
                    </div>
                ) : (
                    <div className="content-box" style={{overflow: 'auto'}}>
                        <TableCanvas>
                            <TableHeader name="accounts" sort={setListViewSortBy} view={view} columns={columns}/>
                            {rows.map((row, index) => (
                                <Row key={index}>
                                    {columns
                                        .filter(({isHidden}) => isHidden === false)
                                        .map((item) => getCell(row, item))}
                                </Row>
                            ))}
                        </TableCanvas>
                    </div>
                )}
            </div>
        </>
    );
};