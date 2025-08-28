import {Button} from '@adobe/react-spectrum';
import {Tabs} from '@chakra-ui/react'
import {useSelector} from 'react-redux';
import {
    ActionType,
    addCard,
    deleteCard,
    hideLayer,
    updateCardFromServer,
    showModalSuccess,
    updateCard,
    showModalError,
} from '../../actions/Actions';
import {
    selectActiveUsers,
    selectCard,
    selectInterfaceStateId, selectLane,
    selectLanes,
    selectToken, selectUserId,
    store,
} from '../../store/Store';
import {Form} from './Form';
import {Events} from './Events';
import {TransferModal} from './TransferModal';
import {TransferRequests} from './TransferRequests';
import {Card, CardFormPreview, CardPreview} from '../../interfaces/Card';
import {useEffect, useMemo, useState} from 'react';
import {ApplicationStore} from '../../store/ApplicationStore';
import {Avatar} from '../Avatar';
import {User} from '../../interfaces/User';
import {Translations} from '../../Translations';
import {DEFAULT_LANGUAGE, LANE_COLOR} from '../../Constants';
import useMobileLayout from '../../hooks/useMobileLayout';
import {getRequestClient} from '../../helpers/RequestHelper';
import {IconLock} from "./IconLock";
import {getErrorMessage} from '../../helpers/ErrorHelper';

export const Layer = () => {
    const token = useSelector(selectToken);

    const client = getRequestClient(token);

    const id = useSelector(selectInterfaceStateId);
    const card = useSelector((store: ApplicationStore) => selectCard(store, id));
    const [isUserLayerVisible, setIsUserLayerVisible] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const users = useSelector(selectActiveUsers);
    const lanes = useSelector(selectLanes);
    const isMobileLayout = useMobileLayout();

    const hideCardDetail = () => {
        store.dispatch(hideLayer());
    };

    const assign = async (id: User['_id']) => {
        console.log(`assign card to user ${id}`);

        store.dispatch({
            type: ActionType.CARD_UPDATE,
            payload: {...card!, userId: id},
        });

        setIsUserLayerVisible(false);
    };

    const update = async (id: Card['_id'] | undefined, preview: CardPreview) => {
        if (id) {
            store.dispatch(updateCard({...card!, ...preview}));

            // TODO combine both dispatch to one
            store.dispatch(showModalSuccess(Translations.CardUpdatedConfirmation[DEFAULT_LANGUAGE]));
        } else {
            if (!preview.laneId) {
                preview.laneId = lanes[0]._id;
            }

            const updated = await client.createCard(preview); // TODO refactor

            // TODO combine both dispatch to one
            store.dispatch(addCard({...updated}));

            store.dispatch(showModalSuccess(Translations.CardCreatedConfirmation[DEFAULT_LANGUAGE]));
        }
    };

    const handleTransferSuccess = () => {
        store.dispatch(showModalSuccess('Transfer request sent successfully!'));
        // Optionally refresh the card data or close the layer
    };

    const getBannerColorClassName = (color: string | undefined) => {
        if (color === LANE_COLOR.NEGATIVE) {
            return 'negative';
        }

        if (color === LANE_COLOR.POSITIVE) {
            return 'positive';
        }

        return '';
    };

    const userId = useSelector(selectUserId);
    const [preview, setPreview] = useState<CardFormPreview>({
        name: '',
        amount: '',
        laneId: '',
        attributes: undefined,
        userId: userId!,
    });

    const save = () => {
        update(id, {...preview, amount: parseInt(preview.amount, 10)});
    };

    const handleDeleteCard = async () => {
        // Supprimer immédiatement de l'affichage (comme addCard pour la création)
        store.dispatch(deleteCard(card!));
        
        // Fermer la vue détaillée
        hideCardDetail();
    };

    const lane = useSelector((store: ApplicationStore) => selectLane(store, card?.laneId));
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    useEffect(() => {
        setIsDisabled(lane && lane.tags?.type !== 'normal' ? true : false);
    }, [lane]);

    let isValidAmount = useMemo(
        () => /^[\d]{1,10}$/.test(preview.amount) && parseInt(preview.amount) > 0,
        [preview]
    );

    let isValidNextFollowUp = useMemo(() => !!preview.nextFollowUpAt, [preview]);


    let isValidForm = useMemo(() => {
        if (preview.name && isValidAmount && isValidNextFollowUp) {
            return true;
        }

        return false;
    }, [preview]);

    useEffect(() => {
        const execute = async () => {
            const updated = await client.getCard(id!);

            store.dispatch(updateCardFromServer(updated));
        };

        if (id) {
            execute();
        }
    }, [id]);

    return (
        <div className={`layer ${isMobileLayout ? 'mobile' : 'desktop'}`}>
            <div className="header">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {/* Avatar en haut à droite */}
                    {card?.userId && (
                        <Avatar
                            id={card?.userId}
                            width={36}
                            onClick={() => {
                                setIsUserLayerVisible(!isUserLayerVisible);
                            }}
                        />
                    )}
                    
                    {/* Message de verrouillage juste en dessous de l'avatar */}
                    {isDisabled && (
                        <div className={`lock ${getBannerColorClassName(lane?.color)}`} style={{ 
                            marginTop: '8px',
                            textAlign: 'center',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>
                            <div>{Translations.OpportunityClosedMessage[DEFAULT_LANGUAGE]}</div>
                            <div className="button" onClick={() => setIsDisabled(!isDisabled)} style={{ 
                                cursor: 'pointer',
                                marginTop: '4px'
                            }}>
                                <IconLock/>
                            </div>
                        </div>
                    )}
                    
                    {/* Liste des utilisateurs au-dessus des boutons */}
                    {isUserLayerVisible && (
                        <div className="user-list" style={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #ccc', 
                            borderRadius: '4px', 
                            padding: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            minWidth: '200px'
                        }}>
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <tbody>
                                {users.map((user: User) => {
                                    return (
                                        <tr key={user._id} style={{width: '100%'}}>
                                            <td>
                                                <Avatar width={36} id={user._id}/>
                                            </td>
                                            <td>
                                                <b>{user.name}</b>
                                            </td>
                                            <td>
                                                <Button variant="primary" onPress={() => assign(user._id)}>
                                                    {Translations.AssignButton[DEFAULT_LANGUAGE]}
                                                </Button>
                                            </td>
                                            <td></td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {/* Boutons sur la ligne d'en dessous */}
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
                                    Supprimer
                                </Button>
                            )}
                        </div>

                        {/* Boutons Enregistrer et Fermer à droite */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {!isDisabled ? (
                                <Button variant="primary" onPress={save} isDisabled={!isValidForm || isDisabled}>
                                    {Translations.SaveButton[DEFAULT_LANGUAGE]}
                                </Button>
                            ) : null}

                            <Button variant="primary" onPress={() => hideCardDetail()}>
                                {Translations.CloseButton[DEFAULT_LANGUAGE]}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="body">
                <Tabs.Root defaultValue="opportunity" height="100%">
                    {(id && (
                        <Tabs.List>
                            <Tabs.Trigger value="opportunity">
                                <span className="tab-title">{Translations.OpportunityTab[DEFAULT_LANGUAGE]}</span>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="events">
                                <span className="tab-title">{Translations.HistoryTab[DEFAULT_LANGUAGE]}</span>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="transfer">
                                <span className="tab-title">{Translations.TransferTab[DEFAULT_LANGUAGE]}</span>
                            </Tabs.Trigger>
                        </Tabs.List>
                    )) || (
                        <Tabs.List>
                            <Tabs.Trigger value="opportunity">
                                <span className="tab-title">{Translations.OpportunityTab[DEFAULT_LANGUAGE]}</span>
                            </Tabs.Trigger>
                        </Tabs.List>
                    )}
                    <Tabs.Content value="opportunity">
                        <Form update={update} id={id} onPreviewChange={setPreview}/>
                    </Tabs.Content>
                    <Tabs.Content value="events">
                        <Events entity="card" id={id}/>
                    </Tabs.Content>
                    <Tabs.Content value="transfer">
                        <div style={{ padding: '16px' }}>
                            {card && (
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Button 
                                            variant="primary" 
                                            onPress={() => setIsTransferModalOpen(true)}
                                        >
                                            {Translations.TransferOpportunityButton[DEFAULT_LANGUAGE]}
                                        </Button>
                                    </div>
                                    <TransferRequests cardId={id} />
                                </>
                            )}
                        </div>
                    </Tabs.Content>
                </Tabs.Root>
            </div>

            {/* Transfer Modal */}
            {card && (
                <TransferModal
                    isOpen={isTransferModalOpen}
                    onClose={() => setIsTransferModalOpen(false)}
                    card={card}
                    onTransferSuccess={handleTransferSuccess}
                />
            {/* Modale de confirmation de suppression */}
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
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>
                            Confirmer la suppression
                        </h3>
                        <p style={{ margin: '0 0 24px 0', color: '#666' }}>
                            Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action est irréversible.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                                    handleDeleteCard();
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
