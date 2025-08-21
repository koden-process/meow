import {Tabs} from '@chakra-ui/react';
import {useEffect, useState, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {addAccount, hideLayer, showModalSuccess, updateAccount, deleteAccount} from '../../actions/Actions';
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
import {DeleteAccountModal} from '../modal/DeleteAccountModal';

export const Layer = () => {
    const token = useSelector(selectToken);

    const client = getRequestClient(token);

    const id = useSelector(selectInterfaceStateId);
    const account = useSelector((store: ApplicationStore) => selectAccount(store, id));
    const references = useSelector((store: ApplicationStore) =>
        selectReferencesTo(store, SchemaType.Account)
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [preview, setPreview] = useState<AccountPreview>({
        name: '',
        attributes: undefined,
    });

    const isMobileLayout = useMobileLayout();

    const hideAccountDetail = () => {
        store.dispatch(hideLayer());
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (account) {
            store.dispatch(deleteAccount(account));
            setIsDeleteModalOpen(false);
            hideAccountDetail();
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const save = () => {
        update(id, preview);
    };

    let isValidForm = useMemo(() => {
        if (preview.name) {
            return true;
        }
        return false;
    }, [preview]);

    const update = async (id: Account['_id'] | undefined, preview: AccountPreview) => {
        if (id) {
            const updated = await client.updateAccount({...account!, ...preview}); // TODO refactor

            store.dispatch(updateAccount({...updated}));

            store.dispatch(showModalSuccess(Translations.AccountUpdatedConfirmation[DEFAULT_LANGUAGE]));
            // Return to the previous sidebar (card sidebar)
            store.dispatch(hideLayer());
        } else {
            const updated = await client.createAccount(preview); // TODO refactor

            store.dispatch(addAccount({...updated}));
            store.dispatch(showModalSuccess(Translations.AccountCreatedConfirmation[DEFAULT_LANGUAGE]));
            // Return to the previous sidebar (card sidebar)
            store.dispatch(hideLayer());
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
            <Tabs.Trigger value="account">
                <span className="tab-title">{Translations.AccountTab[DEFAULT_LANGUAGE]}</span>
            </Tabs.Trigger>,
        ];

        if (id) {
            list.push(
                <Tabs.Trigger value="events">
                    <span className="tab-title">{Translations.HistoryTab[DEFAULT_LANGUAGE]}</span>
                </Tabs.Trigger>
            );

            references?.map((attribute) => {
                list.push(
                    <Tabs.Trigger value={attribute.name}>
                        <span className="tab-title">{attribute.reverseName}</span>
                    </Tabs.Trigger>
                );
            });
        }

        return list;
    };

    const getPanelItems = (id?: string, references?: SchemaReferenceAttribute[]) => {
        const list = [
            <Tabs.Content value="account">
                <Form update={update} id={id} onPreviewChange={setPreview}/>
            </Tabs.Content>,
        ];

        if (id) {
            list.push(
                <Tabs.Content value="events">
                    <Events id={id}/>
                </Tabs.Content>
            );

            references?.map((attribute) => {
                list.push(
                    <Tabs.Content value={attribute.name}>
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
                <div style={{float: 'right'}} className="card-submit">
                    {id ? (
                        <Button 
                            variant="negative" 
                            onPress={handleDeleteClick}
                            UNSAFE_className="delete-button"
                        >
                            {Translations.DeleteButton[DEFAULT_LANGUAGE]}
                        </Button>
                    ) : null}

                    <Button variant="primary" onPress={() => hideAccountDetail()}>
                        {Translations.CloseButton[DEFAULT_LANGUAGE]}
                    </Button>

                    <Button variant="primary" onPress={save} isDisabled={!isValidForm}>
                        {Translations.SaveButton[DEFAULT_LANGUAGE]}
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
            
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                accountName={account?.name}
            />
        </div>
    );
};
