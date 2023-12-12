import { Tabs, TabList, Item, TabPanels } from '@adobe/react-spectrum';
import { Login } from './Login';
import { Register } from './Register';
import { useEffect, useState } from 'react';
import { getRequestClient } from '../helpers/RequestHelper';

export interface RegisterOrLoginProps {}

export const RegisterOrLogin = ({}: RegisterOrLoginProps) => {
  const [allowTeamRegistration, setAllowTeamRegistration] = useState(false);

  useEffect(() => {
    const client = getRequestClient();

    client
      .registerStatus()
      .then((payload) => setAllowTeamRegistration(payload.allowTeamRegistration))
      .catch((error) => console.error(error));
  }, []);

  const tabItems = [<Item key="login">Login</Item>];
  const tabPanels = [
    <Item key="login">
      <Login />
    </Item>,
  ];

  if (allowTeamRegistration) {
    tabItems.push(<Item key="register">Register</Item>);
    tabPanels.push(
      <Item key="register">
        <Register />
      </Item>
    );
  }

  return (
    <form>
      <Tabs>
        <TabList>{tabItems}</TabList>
        <TabPanels>{tabPanels}</TabPanels>
      </Tabs>
    </form>
  );
};
