import { useState, useEffect } from 'react';
import { Button, Text } from '@adobe/react-spectrum';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrency } from '../../store/Store';
import { getRequestClient } from '../../helpers/RequestHelper';
import { OpportunityTransfer, TransferStatus } from '../../interfaces/OpportunityTransfer';
import { Card } from '../../interfaces/Card';
import { DateTime } from 'luxon';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';

export interface TransferRequestsProps {
  cardId?: string; // Optional: filter transfers for a specific card
}

export const TransferRequests = ({ cardId }: TransferRequestsProps = {}) => {
  const token = useSelector(selectToken);
  const currency = useSelector(selectCurrency) || 'EUR';
  const client = getRequestClient(token);

  const [receivedTransfers, setReceivedTransfers] = useState<OpportunityTransfer[]>([]);
  const [sentTransfers, setSentTransfers] = useState<OpportunityTransfer[]>([]);
  const [cards, setCards] = useState<{ [cardId: string]: Card }>({});
  const [cardAccessibility, setCardAccessibility] = useState<{ [cardId: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadTransfers();
  }, [cardId]);

  const loadTransfers = async () => {
    setIsLoading(true);
    try {
      const [receivedTransfers, sentTransfers] = await Promise.all([
        client.getOpportunityTransfers('received'),
        client.getOpportunityTransfers('sent'),
      ]);

      // Filter by cardId if provided
      let filteredReceived = receivedTransfers;
      let filteredSent = sentTransfers;
      
      if (cardId) {
        filteredReceived = receivedTransfers.filter((t: OpportunityTransfer) => t.cardId === cardId);
        filteredSent = sentTransfers.filter((t: OpportunityTransfer) => t.cardId === cardId);
      }

      const finalReceived = filteredReceived.filter((t: OpportunityTransfer) => t.status === TransferStatus.Pending);
      setReceivedTransfers(finalReceived);
      setSentTransfers(filteredSent);

      // Récupérer les informations des cartes pour tous les transferts
      // Pour les transferts reçus, on peut toujours accéder aux cartes
      // Pour les transferts envoyés, les cartes peuvent être inaccessibles si elles ont été transférées
      const allTransfers = [...finalReceived, ...filteredSent];
      const uniqueCardIds = [...new Set(allTransfers.map(t => t.cardId))];
      
      const cardPromises = uniqueCardIds.map(async (cardId) => {
        try {
          const card = await client.getCard(cardId);
          return { cardId, card, accessible: true };
        } catch (err) {
          // La carte n'est pas accessible (probablement transférée à une autre équipe)
          console.warn(`Card ${cardId} not accessible (likely transferred):`, err);
          return { cardId, card: null, accessible: false };
        }
      });

      const cardResults = await Promise.all(cardPromises);
      const cardMap: { [cardId: string]: Card } = {};
      const cardAccessibility: { [cardId: string]: boolean } = {};
      
      cardResults.forEach(({ cardId, card, accessible }) => {
        cardAccessibility[cardId] = accessible;
        if (card) {
          cardMap[cardId] = card;
        }
      });
      
      setCards(cardMap);
      // Stocker l'accessibilité des cartes pour l'affichage
      setCardAccessibility(cardAccessibility);
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (transferId: string) => {
    try {
      const message = responseMessage[transferId] || '';
      await client.acceptOpportunityTransfer(transferId, message);
      loadTransfers();
      setResponseMessage(prev => ({ ...prev, [transferId]: '' }));
    } catch (err) {
      console.error('Failed to accept transfer:', err);
    }
  };

  const handleDecline = async (transferId: string) => {
    try {
      const message = responseMessage[transferId] || '';
      await client.declineOpportunityTransfer(transferId, message);
      loadTransfers();
      setResponseMessage(prev => ({ ...prev, [transferId]: '' }));
    } catch (err) {
      console.error('Failed to decline transfer:', err);
    }
  };

  const formatAmount = (amount: number) => {
    const currencyStr = String(currency).toLowerCase();
    if (currencyStr === 'm2') {
      // Cas spécial pour m2 qui n'est pas une devise standard
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' m2';
    }
    
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      // Si la devise n'est pas reconnue, afficher le montant avec la devise telle quelle
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' ' + currency;
    }
  };

  const getCardInfo = (cardId: string, isFromCurrentTeam: boolean = true) => {
    const card = cards[cardId];
    if (!card) {
      // Si c'est un transfert envoyé et que la carte n'est plus accessible
      if (!isFromCurrentTeam) {
        return { 
          name: 'Opportunité transférée', 
          amount: '', 
          fullDisplay: 'Opportunité transférée (non accessible)' 
        };
      }
      // Pour les transferts reçus, la carte n'est pas encore dans notre équipe
      // Afficher un ID plus court et informatif
      const shortId = cardId.substring(cardId.length - 8);
      return { 
        name: `Opportunité #${shortId}`, 
        amount: '', 
        fullDisplay: `Opportunité #${shortId} (détails disponibles après acceptation)`
      };
    }
    
    const formattedAmount = formatAmount(card.amount);
    return {
      name: card.name,
      amount: formattedAmount,
      fullDisplay: `${card.name} (${formattedAmount})`
    };
  };

  const getStatusBadge = (status: TransferStatus) => {
    const styles = {
      [TransferStatus.Pending]: { backgroundColor: '#ffa500', color: 'white' },
      [TransferStatus.Accepted]: { backgroundColor: '#28a745', color: 'white' },
      [TransferStatus.Declined]: { backgroundColor: '#dc3545', color: 'white' },
    };

    return (
      <span
        style={{
          ...styles[status],
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return <div style={{ color: '#fff' }}>{Translations.LoadingTransfersLabel[DEFAULT_LANGUAGE]}</div>;
  }

  const hasTransfers = receivedTransfers.length > 0 || sentTransfers.length > 0;

  if (!hasTransfers) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ccc' }}>
        {Translations.NoTransferRequestsFound[DEFAULT_LANGUAGE]}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', marginBottom: '16px', borderBottom: '1px solid #555' }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'received' ? '#007bff' : 'transparent',
            color: activeTab === 'received' ? 'white' : '#ccc',
            cursor: 'pointer',
            borderBottom: activeTab === 'received' ? '2px solid #007bff' : 'none',
          }}
        >
          {Translations.ReceivedTabLabel[DEFAULT_LANGUAGE]} ({receivedTransfers.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'sent' ? '#007bff' : 'transparent',
            color: activeTab === 'sent' ? 'white' : '#ccc',
            cursor: 'pointer',
            borderBottom: activeTab === 'sent' ? '2px solid #007bff' : 'none',
          }}
        >
          {Translations.SentTabLabel[DEFAULT_LANGUAGE]} ({sentTransfers.length})
        </button>
      </div>

      {activeTab === 'received' && (
        <div>
          {receivedTransfers.map((transfer) => (
            <div
              key={transfer._id}
              style={{
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#2a2a2a',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#ccc' }}>
                    {Translations.ReceivedLabel[DEFAULT_LANGUAGE]} {DateTime.fromISO(transfer.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                  </p>
                </div>
                {getStatusBadge(transfer.status)}
              </div>

              {transfer.message && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#3a3a3a', borderRadius: '4px', border: '1px solid #555' }}>
                  <strong style={{ color: '#fff' }}>{Translations.MessageLabel[DEFAULT_LANGUAGE]}</strong> 
                  <span style={{ color: '#ccc' }}> {transfer.message}</span>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <textarea
                  placeholder={Translations.ResponseMessagePlaceholder[DEFAULT_LANGUAGE]}
                  value={responseMessage[transfer._id] || ''}
                  onChange={(e) => setResponseMessage(prev => ({ ...prev, [transfer._id]: e.target.value }))}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    resize: 'vertical',
                    backgroundColor: '#3a3a3a',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="cta"
                  onPress={() => handleAccept(transfer._id)}
                >
                  {Translations.AcceptButton[DEFAULT_LANGUAGE]}
                </Button>
                <Button
                  variant="negative"
                  onPress={() => handleDecline(transfer._id)}
                >
                  {Translations.DeclineButton[DEFAULT_LANGUAGE]}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sent' && (
        <div>
          {sentTransfers.map((transfer) => (
            <div
              key={transfer._id}
              style={{
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#2a2a2a',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#1a4d72', borderRadius: '4px', border: '1px solid #2a5d82' }}>
                    <strong style={{ color: '#87ceeb' }}>Opportunité:</strong> 
                    <span style={{ color: '#fff', marginLeft: '8px' }}>
                      {getCardInfo(transfer.cardId, cardAccessibility[transfer.cardId] !== false).fullDisplay}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#ccc' }}>
                    {Translations.SentLabel[DEFAULT_LANGUAGE]} {DateTime.fromISO(transfer.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                  </p>
                  {transfer.respondedAt && (
                    <p style={{ margin: '0', fontSize: '14px', color: '#ccc' }}>
                      {Translations.RespondedLabel[DEFAULT_LANGUAGE]} {DateTime.fromISO(transfer.respondedAt).toLocaleString(DateTime.DATETIME_MED)}
                    </p>
                  )}
                </div>
                {getStatusBadge(transfer.status)}
              </div>

              {transfer.message && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#3a3a3a', borderRadius: '4px', border: '1px solid #555' }}>
                  <strong style={{ color: '#fff' }}>{Translations.YourMessageLabel[DEFAULT_LANGUAGE]}</strong> 
                  <span style={{ color: '#ccc' }}> {transfer.message}</span>
                </div>
              )}

              {transfer.responseMessage && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#2d5a2d', borderRadius: '4px', border: '1px solid #4a7c59' }}>
                  <strong style={{ color: '#fff' }}>{Translations.ResponseLabel[DEFAULT_LANGUAGE]}</strong> 
                  <span style={{ color: '#ccc' }}> {transfer.responseMessage}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
