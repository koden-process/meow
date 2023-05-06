import { Button, Tabs, TabList, Item, TabPanels } from '@adobe/react-spectrum';
import { useSelector } from 'react-redux';
import { ActionType, hideLayer, showModalSuccess } from '../../actions/Actions';
import {
  selectActiveUsers,
  selectCard,
  selectInterfaceStateId,
  selectLanes,
  store,
} from '../../store/Store';
import { Form } from './Form';
import { Events } from './Events';
import { Card, CardPreview } from '../../interfaces/Card';
import { RequestHelperContext } from '../../context/RequestHelperContextProvider';
import { useContext, useState } from 'react';
import { ApplicationStore } from '../../store/ApplicationStore';
import { Avatar } from '../Avatar';
import { User } from '../../interfaces/User';
import { Translations } from '../../Translations';

export const Layer = () => {
  const { client } = useContext(RequestHelperContext);
  const id = useSelector(selectInterfaceStateId);
  const card = useSelector((store: ApplicationStore) => selectCard(store, id));
  const [isUserLayerVisible, setIsUserLayerVisible] = useState(false);
  const users = useSelector(selectActiveUsers);
  const lanes = useSelector(selectLanes);

  const hideCardDetail = () => {
    store.dispatch(hideLayer());
  };

  const assign = async (id: User['id']) => {
    console.log(`assign card to user ${id}`);

    store.dispatch({
      type: ActionType.CARD_UPDATE,
      payload: { ...card!, userId: id },
    });

    setIsUserLayerVisible(false);
  };

  const update = async (id: Card['id'] | undefined, preview: CardPreview) => {
    if (id) {
      store.dispatch({
        type: ActionType.CARD_UPDATE,
        payload: { ...card!, ...preview },
      });

      // TODO combine both dispatch to one
      store.dispatch(showModalSuccess(Translations.CardUpdatedConfirmation.en));
    } else {
      if (!preview.laneId) {
        preview.laneId = lanes[0].id;
      }

      const updated = await client!.createCard(preview); // TODO refactor

      // TODO combine both dispatch to one
      store.dispatch({
        type: ActionType.CARD_ADD,
        payload: { ...updated },
      });

      store.dispatch(showModalSuccess(Translations.CardCreatedConfirmation.en));
    }
  };

  return (
    <div className="layer">
      <div className="header">
        {card?.userId && (
          <div
            style={{ float: 'left' }}
            onClick={() => {
              setIsUserLayerVisible(!isUserLayerVisible);
            }}
          >
            <Avatar id={card?.userId} width={36} />
          </div>
        )}

        <div style={{ float: 'right', marginTop: '4px' }}>
          <Button variant="primary" onPress={() => hideCardDetail()}>
            Close
          </Button>
        </div>
      </div>
      {isUserLayerVisible && (
        <div className="user-list">
          <table>
            <tbody>
              {users.map((user: User) => {
                return (
                  <tr key={user.id}>
                    <td>
                      <Avatar width={36} id={user.id} />
                    </td>
                    <td>
                      <b>{user.name}</b>
                    </td>
                    <td>
                      <Button variant="primary" onPress={() => assign(user.id)}>
                        assign
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="body">
        <Tabs height="100%">
          {(id && (
            <TabList>
              <Item key="deal">
                <span className="tab-title">Opportunity</span>
              </Item>
              <Item key="events">
                <span className="tab-title">History</span>
              </Item>
            </TabList>
          )) || (
            <TabList>
              <Item key="deal">Deal</Item>
            </TabList>
          )}

          <TabPanels UNSAFE_style={{ padding: 0, border: 0 }}>
            <Item key="deal">
              <Form update={update} id={id} />
            </Item>
            <Item key="events">
              <Events entity="card" id={id} />
            </Item>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};
