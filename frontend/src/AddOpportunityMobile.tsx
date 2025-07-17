import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { addCard } from './actions/Actions';
import { selectToken, selectLanes, store } from './store/Store';
import { getRequestClient } from './helpers/RequestHelper';
import { Translations } from './Translations';
import { DEFAULT_LANGUAGE } from './Constants';
import { FormMobile } from './components/card/FormMobile';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

const AddCardMobile: React.FC = () => {
  const token = useSelector(selectToken);
  const lanes = useSelector(selectLanes);
  const client = getRequestClient(token);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const lang = DEFAULT_LANGUAGE;
  const navigate = useNavigate();

  // @ts-ignore
  const handleSubmit = async (card) => {
    setIsLoading(true);
    try {
      if (!card.laneId && lanes && lanes.length > 0) {
        card.laneId = lanes[0]._id;
      }
      const payload = { ...card, amount: parseInt(card.amount, 10) };
      const updated = await client.createCard(payload);
      store.dispatch(addCard({ ...updated }));
      setSuccess(true);
      setMessage(Translations.CardCreatedConfirmation[lang]);
      setTimeout(() => navigate('/mobile'), 1800);
    } catch (e) {
      setSuccess(false);
      setMessage((Translations.ErrorMessage && Translations.ErrorMessage[lang]));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="canvas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 16 }}>
      <div style={{ marginTop: '60px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>Nouvelle opportunité</h2>
        {isLoading && <div style={{ margin: 16 }}><span className="loader"></span></div>}
        {success === null && (
          <>
            <FormMobile onSubmit={handleSubmit} />

          </>
        )}
        {success !== null && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{success ? '✅' : '❌'}</div>
            <h2 style={{ color: success ? 'green' : 'red', marginBottom: 16 }}>{message}</h2>
            {!success && (
              <button className="button button-secondary" style={{ minWidth: 180 }} onClick={() => navigate('/mobile')}>
                Retour à l'accueil
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCardMobile;
