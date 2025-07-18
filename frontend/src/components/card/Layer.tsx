import {Button} from '@adobe/react-spectrum';
import {Tabs} from '@chakra-ui/react'
import {useSelector} from 'react-redux';
import {
    ActionType,
    addCard,
    hideLayer,
    updateCardFromServer,
    showModalSuccess,
    updateCard,
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

    const lane = useSelector((store: ApplicationStore) => selectLane(store, card?.laneId));
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

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
                <div>
                    {card?.userId && (
                        <Avatar
                            id={card?.userId}
                            width={36}
                            onClick={() => {
                                setIsUserLayerVisible(!isUserLayerVisible);
                            }}
                        />
                    )}
                </div>

                <div>
                    {isDisabled && (
                        <div className={`lock ${getBannerColorClassName(lane?.color)}`}>
                            <div>{Translations.OpportunityClosedMessage[DEFAULT_LANGUAGE]}</div>
                            <div className="button" onClick={() => setIsDisabled(!isDisabled)}>
                                <IconLock/>
                            </div>
                        </div>
                    )}

                    <div className="card-submit">
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
            {isUserLayerVisible && (
                <div className="user-list">
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
                                    <TransferRequests />
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
            )}
        </div>
    );
};
