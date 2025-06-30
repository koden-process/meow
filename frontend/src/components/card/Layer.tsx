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
    selectInterfaceStateId,
    selectLanes,
    selectToken,
    store,
} from '../../store/Store';
import {Form} from './Form';
import {Events} from './Events';
import {Card, CardPreview} from '../../interfaces/Card';
import {useEffect, useState} from 'react';
import {ApplicationStore} from '../../store/ApplicationStore';
import {Avatar} from '../Avatar';
import {User} from '../../interfaces/User';
import {Translations} from '../../Translations';
import {DEFAULT_LANGUAGE} from '../../Constants';
import useMobileLayout from '../../hooks/useMobileLayout';
import {getRequestClient} from '../../helpers/RequestHelper';

export const Layer = () => {
    const token = useSelector(selectToken);

    const client = getRequestClient(token);

    const id = useSelector(selectInterfaceStateId);
    const card = useSelector((store: ApplicationStore) => selectCard(store, id));
    const [isUserLayerVisible, setIsUserLayerVisible] = useState(false);
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
                    <Button variant="primary" onPress={() => hideCardDetail()}>
                        {Translations.CloseButton[DEFAULT_LANGUAGE]}
                    </Button>
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
                            <Tabs.Trigger key="opportunity">
                                <span className="tab-title">{Translations.OpportunityTab[DEFAULT_LANGUAGE]}</span>
                            </Tabs.Trigger>
                            <Tabs.Trigger key="events">
                                <span className="tab-title">{Translations.HistoryTab[DEFAULT_LANGUAGE]}</span>
                            </Tabs.Trigger>
                        </Tabs.List>
                    )) || (
                        <Tabs.List>
                            <Tabs.Trigger key="opportunity">
                                <span className="tab-title">{Translations.OpportunityTab[DEFAULT_LANGUAGE]}</span>
                            </Tabs.Trigger>
                        </Tabs.List>
                    )}
                    <Tabs.Content key="opportunity">
                        <Form update={update} id={id}/>
                    </Tabs.Content>
                    <Tabs.Content key="events">
                        <Events entity="card" id={id}/>
                    </Tabs.Content>
                </Tabs.Root>
            </div>
        </div>
    );
};
