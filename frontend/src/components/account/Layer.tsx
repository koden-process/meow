import {Tabs} from '@chakra-ui/react';
import {useEffect, useMemo, useState} from 'react';
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

    const [isDisabled] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    const [preview, setPreview] = useState<AccountPreview>({ name: '', attributes: undefined });

    const isValidForm = useMemo(() => {
        return !!preview?.name;
    }, [preview]);

    const save = () => {
        update(id, preview);
    };

    const hideAccountDetail = () => {
        store.dispatch(hideLayer());
    };

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

    const handleDeleteAccount = async () => {
        if (!account) {
            hideAccountDetail();
            return;
        }
        if (id) {
            console.log(`delete account ${id}`);
        }

        if (account) {
            console.log('account to delete: ', account);
        }
        // Only set status to 'deleted' if account has a top-level status
        const currentStatus = (account as any).status;
        console.log('account status: ', currentStatus);
        if (currentStatus !== undefined) {
            try {
                const updated = await client.updateAccount({ ...(account as any), status: 'deleted' } as any);
                console.log('account updated: ', updated);
                store.dispatch(updateAccount({ ...updated }));
                store.dispatch(showModalSuccess(Translations.AccountUpdatedConfirmation[DEFAULT_LANGUAGE]));
                store.dispatch(hideLayer());
            } catch (e) {
                console.error('Error updating account status:', e);
            }
        }
        hideAccountDetail();
    };

    return (
        <div className={`layer ${isMobileLayout ? 'mobile' : 'desktop'}`}>
            <div className="header">
                {/*<div style={{float: 'right'}}>*/}
                {/*    <Button variant="primary" onPress={() => hideAccountDetail()}>*/}
                {/*        {Translations.CloseButton[DEFAULT_LANGUAGE]}*/}
                {/*    </Button>*/}
                {/*</div>*/}

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                    {/* Bouton Supprimer tout à gauche */}
                    <div>
                        {id && (
                            <Button
                                variant="secondary"
                                onPress={() => setShowDeleteModal(true)}
                                UNSAFE_style={{
                                    border: '1px solid #dc2626',
                                    color: '#dc2626',
                                    backgroundColor: 'transparent'
                                }}
                                UNSAFE_className="btn-delete"
                            >
                                Supprimer
                            </Button>
                        )}
                    </div>

                    {/* Boutons Enregistrer et Fermer à droite */}
                    <div style={{display: 'flex', gap: '8px'}}>
                        {!isDisabled ? (
                            <Button variant="primary" onPress={save} isDisabled={!isValidForm || isDisabled}>
                                {Translations.SaveButton[DEFAULT_LANGUAGE]}
                            </Button>
                        ) : null}

                        <Button variant="primary" onPress={() => hideAccountDetail()}>
                            {Translations.CloseButton[DEFAULT_LANGUAGE]}
                        </Button>
                    </div>
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

            {/* Modale de confirmation de suppression */}
            {showDeleteModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <h3 className="delete-modal-title">
                            Confirmer la suppression
                        </h3>

                        <p className="delete-modal-text">
                            Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.
                        </p>

                        <div className="delete-modal-buttons">
                            <Button
                                variant="secondary"
                                onPress={() => setShowDeleteModal(false)}
                            >
                                Annuler
                            </Button>

                            <Button
                                variant="secondary"
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    handleDeleteAccount();
                                }}
                                UNSAFE_style={{
                                    border: '1px solid #dc2626',
                                    color: '#dc2626',
                                    backgroundColor: 'transparent'
                                }}
                                UNSAFE_className="btn-delete"
                            >
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
