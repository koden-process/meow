import React, { useState } from 'react';
import { Button } from '@adobe/react-spectrum';
import { useSelector } from 'react-redux';
import { addCard, showModalSuccess } from './actions/Actions';
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
      setMessage(Translations.CardCreatedConfirmation[lang] || 'Opportunité créée.');
    } catch (e) {
      setSuccess(false);
      setMessage((Translations.ErrorMessage && Translations.ErrorMessage[lang]) || 'Erreur lors de la création.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      {success === null && <FormMobile onSubmit={handleSubmit} />}
      {success !== null && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: success ? 'green' : 'red' }}>{message}</h2>
          <Link to="/mobile" style={{ color: '#007aff', fontSize: 18, textDecoration: 'underline' }}>
            {Translations.BackToHome ? (Translations.BackToHome[lang] || 'Retour à l\'accueil') : 'Retour à l\'accueil'}
          </Link>
        </div>
      )}
    </div>
  );
};

export default AddCardMobile;
