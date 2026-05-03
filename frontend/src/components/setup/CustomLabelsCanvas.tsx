import { Button, TextField } from '@adobe/react-spectrum';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { showModalError, showModalSuccess } from '../../actions/Actions';
import { selectToken, selectTeam, selectTeamId, store } from '../../store/Store';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';
import { getRequestClient } from '../../helpers/RequestHelper';
import { refreshSharedApplicationState } from '../../helpers/RefreshApplicationState';

export const CustomLabelsCanvas = () => {
    const token = useSelector(selectToken);
    const team = useSelector(selectTeam);
    const teamId = useSelector(selectTeamId);

    const client = getRequestClient(token);

    const [opportunityAmount, setOpportunityAmount] = useState<string>(
        team?.customLabels?.opportunityAmount || ''
    );

    useEffect(() => {
        setOpportunityAmount(team?.customLabels?.opportunityAmount || '');
    }, [team?.customLabels?.opportunityAmount]);

    const save = async () => {
        if (!teamId || !team) {
            return;
        }

        const trimmedAmount = opportunityAmount.trim();

        const updatedTeam: { currency: any; customLabels?: any } = {
            currency: team.currency,
            customLabels: {
                opportunityAmount: trimmedAmount || null,
            },
        };

        console.log('Saving team with data:', updatedTeam);

        try {
            await client.updateTeam(teamId, updatedTeam);

            await refreshSharedApplicationState();

            store.dispatch(showModalSuccess(Translations.SetupChangedConfirmation[DEFAULT_LANGUAGE]));
        } catch (error) {
            console.error('Error saving team:', error);
            store.dispatch(showModalError(error?.toString()));
        }
    };

    return (
        <div className="content-box">
            <h2>{Translations.CustomLabelsTitle[DEFAULT_LANGUAGE]}</h2>
            <span style={{ fontSize: '0.8em', display: 'block', marginBottom: '10px' }}>
                {Translations.CustomLabelsDescription[DEFAULT_LANGUAGE]}
            </span>

            <TextField
                label={Translations.OpportunityAmountCustomLabel[DEFAULT_LANGUAGE]}
                value={opportunityAmount}
                onChange={setOpportunityAmount}
                placeholder={Translations.OpportunityAmount[DEFAULT_LANGUAGE]}
                maxLength={50}
            />

            <Button
                marginTop="size-200"
                variant="cta"
                onPress={save}
                isDisabled={!token}
            >
                {Translations.SaveButton[DEFAULT_LANGUAGE]}
            </Button>
        </div>
    );
};




