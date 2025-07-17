import { useState, useEffect } from 'react';
import { Button, Text } from '@adobe/react-spectrum';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/Store';
import { getRequestClient } from '../../helpers/RequestHelper';
import { OpportunityTransfer, TransferStatus } from '../../interfaces/OpportunityTransfer';
import { DateTime } from 'luxon';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';

export const TransferRequests = () => {
  const token = useSelector(selectToken);
  const client = getRequestClient(token);
  
  const [receivedTransfers, setReceivedTransfers] = useState<OpportunityTransfer[]>([]);
  const [sentTransfers, setSentTransfers] = useState<OpportunityTransfer[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setIsLoading(true);
    try {
      const [receivedTransfers, sentTransfers] = await Promise.all([
        client.getOpportunityTransfers('received'),
        client.getOpportunityTransfers('sent'),
      ]);
      
      setReceivedTransfers(receivedTransfers.filter((t: OpportunityTransfer) => t.status === TransferStatus.Pending));
      setSentTransfers(sentTransfers);
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
    return <div>Loading transfers...</div>;
  }

  const hasTransfers = receivedTransfers.length > 0 || sentTransfers.length > 0;

  if (!hasTransfers) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No transfer requests found.
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', marginBottom: '16px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'received' ? '#007bff' : 'transparent',
            color: activeTab === 'received' ? 'white' : '#007bff',
            cursor: 'pointer',
            borderBottom: activeTab === 'received' ? '2px solid #007bff' : 'none',
          }}
        >
          Received ({receivedTransfers.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'sent' ? '#007bff' : 'transparent',
            color: activeTab === 'sent' ? 'white' : '#007bff',
            cursor: 'pointer',
            borderBottom: activeTab === 'sent' ? '2px solid #007bff' : 'none',
          }}
        >
          Sent ({sentTransfers.length})
        </button>
      </div>

      {activeTab === 'received' && (
        <div>
          {receivedTransfers.map((transfer) => (
            <div
              key={transfer._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0' }}>Opportunity Transfer Request</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                    Received: {DateTime.fromISO(transfer.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                  </p>
                </div>
                {getStatusBadge(transfer.status)}
              </div>
              
              {transfer.message && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                  <strong>Message:</strong> {transfer.message}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <textarea
                  placeholder="Add a response message..."
                  value={responseMessage[transfer._id] || ''}
                  onChange={(e) => setResponseMessage(prev => ({ ...prev, [transfer._id]: e.target.value }))}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="cta"
                  onPress={() => handleAccept(transfer._id)}
                >
                  Accept
                </Button>
                <Button
                  variant="negative"
                  onPress={() => handleDecline(transfer._id)}
                >
                  Decline
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
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0' }}>Transfer Request</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                    Sent: {DateTime.fromISO(transfer.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                  </p>
                  {transfer.respondedAt && (
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Responded: {DateTime.fromISO(transfer.respondedAt).toLocaleString(DateTime.DATETIME_MED)}
                    </p>
                  )}
                </div>
                {getStatusBadge(transfer.status)}
              </div>
              
              {transfer.message && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                  <strong>Your message:</strong> {transfer.message}
                </div>
              )}

              {transfer.responseMessage && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                  <strong>Response:</strong> {transfer.responseMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};