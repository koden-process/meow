import {Tabs} from '@chakra-ui/react'

import {Login} from './Login';
import {Register} from './Register';
import {useEffect, useState} from 'react';
import {getRequestClient} from '../helpers/RequestHelper';
import {Translations} from '../Translations';
import {DEFAULT_LANGUAGE} from '../Constants';

export interface RegisterOrLoginProps {
}

export const RegisterOrLogin = ({}: RegisterOrLoginProps) => {
    const [allowTeamRegistration, setAllowTeamRegistration] = useState(false);

    useEffect(() => {
        const client = getRequestClient();

        client
            .registerStatus()
            .then((payload) => setAllowTeamRegistration(payload.allowTeamRegistration))
            .catch((error) => console.error(error));
    }, []);

    return (
        <Tabs.Root defaultValue="login">
            <Tabs.List>
                <Tabs.Trigger value="login">
                    {Translations.LoginTab[DEFAULT_LANGUAGE]}
                </Tabs.Trigger>
                {allowTeamRegistration && (
                    <Tabs.Trigger value="register">
                        {Translations.RegisterTab[DEFAULT_LANGUAGE]}
                    </Tabs.Trigger>
                )}
            </Tabs.List>
            <Tabs.Content value="login"><Login/></Tabs.Content>
            {allowTeamRegistration && (
                <Tabs.Content value="register">
                    <Register />
                </Tabs.Content>
            )}
        </Tabs.Root>
    );
};