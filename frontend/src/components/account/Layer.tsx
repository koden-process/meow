import {Tabs} from '@chakra-ui/react';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {addAccount, hideLayer, showModalSuccess, updateAccount} from '../../actions/Actions';
import {Account, AccountPreview} from '../../interfaces/Account';
import {ApplicationStore} from '../../store/ApplicationStore';
import {
    selectAccount,
    selectInterfaceStateId,
    selectReferencesTo,
    selectToken,
    store,
} from '../../store/Store';
import {Translations} from '../../Translations';
import {Form} from './Form';
import useMobileLayout from '../../hooks/useMobileLayout';
import {SchemaReferenceAttribute, SchemaType} from '../../interfaces/Schema';
import {Reference} from './Reference';
import {Events} from './Events';
import {getRequestClient} from '../../helpers/RequestHelper';
import {DEFAULT_LANGUAGE} from '../../Constants';
import {Button} from "@adobe/react-spectrum";

export const Layer = () => {
    const token = useSelector(selectToken);

    const client = getRequestClient(token);

    const id = useSelector(selectInterfaceStateId);
    const account = useSelector((store: ApplicationStore) => selectAccount(store, id));
    const references = useSelector((store: ApplicationStore) =>
        selectReferencesTo(store, SchemaType.Account)
    );

    const isMobileLayout = useMobileLayout();

    const hideAccountDetail = () => {
        store.dispatch(hideLayer());
    };

    const update = async (id: Account['_id'] | undefined, preview: AccountPreview) => {
        if (id) {
            const updated = await client.updateAccount({...account!, ...preview}); // TODO refactor

            store.dispatch(updateAccount({...updated}));

            store.dispatch(showModalSuccess(Translations.AccountUpdatedConfirmation[DEFAULT_LANGUAGE]));
        } else {
            const updated = await client.createAccount(preview); // TODO refactor

            store.dispatch(addAccount({...updated}));
            store.dispatch(showModalSuccess(Translations.AccountCreatedConfirmation[DEFAULT_LANGUAGE]));
        }
    };

    useEffect(() => {
        const execute = async () => {
            const updated = await client.getAccount(id!);

            store.dispatch(updateAccount({...updated}));
        };

        if (id) {
            execute();
        }
    }, [id]);

    const getItems = (id?: string, references?: SchemaReferenceAttribute[]) => {
        const list = [
            <Tabs.Trigger key="account">
                <span className="tab-title">{Translations.AccountTab[DEFAULT_LANGUAGE]}</span>
            </Tabs.Trigger>,
        ];

        if (id) {
            list.push(
                <Tabs.Trigger key="events">
                    <span className="tab-title">{Translations.HistoryTab[DEFAULT_LANGUAGE]}</span>
                </Tabs.Trigger>
            );

            references?.map((attribute) => {
                list.push(
                    <Tabs.Trigger key={attribute.name}>
                        <span className="tab-title">{attribute.reverseName}</span>
                    </Tabs.Trigger>
                );
            });
        }

        return list;
    };

    const getPanelItems = (id?: string, references?: SchemaReferenceAttribute[]) => {
        const list = [
            <Tabs.Content key="account">
                <Form update={update} id={id}/>
            </Tabs.Content>,
        ];

        if (id) {
            list.push(
                <Tabs.Content key="events">
                    <Events id={id}/>
                </Tabs.Content>
            );

            references?.map((attribute) => {
                list.push(
                    <Tabs.Content key={attribute.name}>
                        <Reference attribute={attribute} account={account}/>
                    </Tabs.Content>
                );
            });
        }

        return list;
    };

    return (
        <div className={`layer ${isMobileLayout ? 'mobile' : 'desktop'}`}>
            <div className="header">
                <div style={{float: 'right'}}>
                    <Button variant="primary" onPress={() => hideAccountDetail()}>
                        {Translations.CloseButton[DEFAULT_LANGUAGE]}
                    </Button>
                </div>
            </div>
            <div className="body">
                <Tabs.Root defaultValue="account">
                    <Tabs.List>
                        {getItems(id, references)}
                    </Tabs.List>
                    <Tabs.ContentGroup>
                        {getPanelItems(id, references)}
                    </Tabs.ContentGroup>
                </Tabs.Root>
            </div>
        </div>
    );
};
