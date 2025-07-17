import { useState, useEffect } from 'react';
import { Button, TextField, ComboBox, Item, DialogContainer, Dialog, Heading, Content, ButtonGroup } from '@adobe/react-spectrum';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/Store';
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
  const client = getRequestClient(token);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      setMessage('');
      setSelectedTeamId('');
      setError('');
    }
  }, [isOpen]);

  const loadTeams = async () => {
    try {
      const teams = await client.getTeams();
      setTeams(teams);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load available teams');
    }
  };

  const handleTransfer = async () => {
    if (!selectedTeamId) {
      setError('Please select a team');
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
          <Heading>Transfer Opportunity</Heading>
          <Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <strong>Opportunity:</strong> {card.name}
              </div>
              
              <ComboBox
                label="Transfer to Team"
                placeholder="Select a team"
                selectedKey={selectedTeamId}
                onSelectionChange={(key) => setSelectedTeamId(key as string)}
                isRequired
              >
                {teams.map((team) => (
                  <Item key={team._id} textValue={team.name}>
                    {team.name}
                  </Item>
                ))}
              </ComboBox>

              <TextField
                label="Message (Optional)"
                placeholder="Add a message to explain why you're transferring this opportunity..."
                value={message}
                onChange={setMessage}
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
              Cancel
            </Button>
            <Button 
              variant="cta" 
              onPress={handleTransfer}
              isDisabled={isLoading || !selectedTeamId}
            >
              {isLoading ? 'Transferring...' : 'Transfer'}
            </Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogContainer>
  );
};