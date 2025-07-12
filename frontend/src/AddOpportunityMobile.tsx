import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { addCard } from './actions/Actions';
import { selectToken, selectLanes, store } from './store/Store';
import { getRequestClient } from './helpers/RequestHelper';
import { Translations } from './Translations';
import { DEFAULT_LANGUAGE } from './Constants';
import { FormMobile } from './components/card/FormMobile';
import { Link } from 'react-router-dom';

const AddCardMobile: React.FC = () => {
  const token = useSelector(selectToken);
  const lanes = useSelector(selectLanes);
  const client = getRequestClient(token);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');
  const lang = DEFAULT_LANGUAGE;

  // @ts-ignore
  const handleSubmit = async (card) => {
    try {
      if (!card.laneId && lanes && lanes.length > 0) {
        card.laneId = lanes[0]._id;
      }
      const payload = { ...card, amount: parseInt(card.amount, 10) };
      const updated = await client.createCard(payload);
      store.dispatch(addCard({ ...updated }));
      setSuccess(true);
      setMessage(Translations.CardCreatedConfirmation[lang]);
    } catch (e) {
      setSuccess(false);
      setMessage((Translations.ErrorMessage && Translations.ErrorMessage[lang]));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      {/* Mobile menu to go to home */}
      <div style={{ width: '100%', padding: '10px 0', background: '#f5f5f5', position: 'absolute', top: 0, left: 0, textAlign: 'left' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', fontSize: '18px', marginLeft: '16px' }}>
          Accueil
        </Link>
      </div>
      <div style={{ marginTop: '60px', width: '100%' }}>
        {success === null && <FormMobile onSubmit={handleSubmit} />}
        {success !== null && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: success ? 'green' : 'red' }}>{message}</h2>
            <Link to="/mobile" style={{ color: '#007aff', fontSize: 18, textDecoration: 'underline' }}>
              {Translations.BackToHome ? (Translations.BackToHome[lang]) : 'Retour à l\'accueil'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCardMobile;
