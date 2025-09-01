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
import {useState} from 'react';

export const Layer = () => {
    const token = useSelector(selectToken);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [preview, setPreview] = useState<AccountPreview>({ name: '', attributes: undefined });
    const [isValidForm, setIsValidForm] = useState(false);

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

    const deleteAccount = async () => {
        if (id && account) {
            try {
                await client.deleteAccount(id);
                store.dispatch(showModalSuccess(Translations.AccountDeletedConfirmation[DEFAULT_LANGUAGE]));
                setShowDeleteModal(false);
                // Petit délai pour que l'utilisateur voie le message avant de fermer
                setTimeout(() => {
                    store.dispatch(hideLayer());
                }, 500);
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    const update = async (id: Account['_id'] | undefined, accountPreview: AccountPreview) => {
        if (id) {
            const updated = await client.updateAccount({...account!, ...accountPreview}); // TODO refactor

            store.dispatch(updateAccount({...updated}));

            store.dispatch(showModalSuccess(Translations.AccountUpdatedConfirmation[DEFAULT_LANGUAGE]));
            // Petit délai pour que l'utilisateur voie le message avant de fermer
            setTimeout(() => {
                store.dispatch(hideLayer());
            }, 500);
        } else {
            const updated = await client.createAccount(accountPreview); // TODO refactor

            store.dispatch(addAccount({...updated}));
            store.dispatch(showModalSuccess(Translations.AccountCreatedConfirmation[DEFAULT_LANGUAGE]));
            // Petit délai pour que l'utilisateur voie le message avant de fermer
            setTimeout(() => {
                store.dispatch(hideLayer());
            }, 500);
        }
    };

    const save = () => {
        update(id, preview);
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
                <Form 
                    update={update} 
                    id={id}
                    onPreviewChange={setPreview}
                    onValidationChange={setIsValidForm}
                />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
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
                                {Translations.DeleteButton[DEFAULT_LANGUAGE]}
                            </Button>
                        )}
                    </div>

                    {/* Boutons Enregistrer et Fermer à droite */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="primary" onPress={save} isDisabled={!isValidForm}>
                            {Translations.SaveButton[DEFAULT_LANGUAGE]}
                        </Button>
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

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3 style={{ marginTop: 0 }}>
                            {Translations.DeleteAccountConfirmation[DEFAULT_LANGUAGE]}
                        </h3>
                        <p>
                            Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <Button 
                                variant="secondary" 
                                onPress={() => setShowDeleteModal(false)}
                            >
                                {Translations.CancelButton[DEFAULT_LANGUAGE]}
                            </Button>
                            <Button 
                                variant="secondary" 
                                onPress={deleteAccount}
                                UNSAFE_style={{
                                    border: '1px solid #dc2626',
                                    color: '#dc2626',
                                    backgroundColor: 'transparent'
                                }}
                                UNSAFE_className="btn-delete"
                            >
                                {Translations.DeleteButton[DEFAULT_LANGUAGE]}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
