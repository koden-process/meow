import { useState, useEffect } from 'react';
import { Button, TextArea, ComboBox, Item, DialogContainer, Dialog, Heading, Content, ButtonGroup } from '@adobe/react-spectrum';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrency } from '../../store/Store';
import { getRequestClient } from '../../helpers/RequestHelper';
import { Team } from '../../interfaces/Team';
import { Card } from '../../interfaces/Card';
import { TransferRequest } from '../../interfaces/OpportunityTransfer';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';

export interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  onTransferSuccess: () => void;
}

export const TransferModal = ({ isOpen, onClose, card, onTransferSuccess }: TransferModalProps) => {
  const token = useSelector(selectToken);
  const currency = useSelector(selectCurrency) || 'EUR';
  const client = getRequestClient(token);

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const formatAmount = (amount: number) => {
    if (currency === 'MT2') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'unit',
        unit: 'meter',
        unitDisplay: 'narrow',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + '²';
    }
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      // Pré-remplir le message avec les informations de l'opportunité
      const formattedAmount = formatAmount(card.amount);
      const defaultMessage = `Opportunité: ${card.name}\nQuotité: ${formattedAmount}\n\n`;
      setMessage(defaultMessage);
      setSelectedTeamId('');
      setError('');
    }
  }, [isOpen, card.name, card.amount, currency]);

  const loadTeams = async () => {
    try {
      const teams = await client.getTeams();
      setTeams(teams);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError(Translations.LoadTeamsError[DEFAULT_LANGUAGE]);
    }
  };

  const handleTransfer = async () => {
    if (!selectedTeamId) {
      setError(Translations.SelectTeamError[DEFAULT_LANGUAGE]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const transferRequest: TransferRequest = {
        cardId: card._id,
        toTeamId: selectedTeamId,
        message: message.trim() || undefined,
      };

      await client.createOpportunityTransfer(transferRequest);
      onTransferSuccess();
      onClose();
    } catch (err: any) {
      console.error('Transfer failed:', err);
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContainer onDismiss={onClose}>
      {isOpen && (
        <Dialog>
          <Heading>{Translations.TransferOpportunityTitle[DEFAULT_LANGUAGE]}</Heading>
          <Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <strong>{Translations.OpportunityLabel[DEFAULT_LANGUAGE]}</strong> {card.name}
              </div>

              <ComboBox
                aria-label={Translations.TransferToTeamLabel[DEFAULT_LANGUAGE]}
                items={teams}
                selectedKey={selectedTeamId}
                onSelectionChange={(key) => setSelectedTeamId(key as string)}
                isRequired
              >
                {(team: any) => (
                  <Item key={team._id} textValue={team.name}>
                    {team.name}
                  </Item>
                )}
              </ComboBox>

              <TextArea
                label={Translations.MessageOptionalLabel[DEFAULT_LANGUAGE]}
                value={message}
                onChange={setMessage}
                height="120px"
              />

              {error && (
                <div style={{ color: 'red', fontSize: '14px' }}>
                  {error}
                </div>
              )}
            </div>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={onClose}>
              {Translations.CancelButton[DEFAULT_LANGUAGE]}
            </Button>
            <Button 
              variant="cta" 
              onPress={handleTransfer}
              isDisabled={isLoading || !selectedTeamId}
            >
              {isLoading ? Translations.TransferringLabel[DEFAULT_LANGUAGE] : Translations.TransferButton[DEFAULT_LANGUAGE]}
            </Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogContainer>
  );
};
