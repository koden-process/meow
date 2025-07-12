import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCards, selectLanes, selectToken } from './store/Store';
import { Lane, LaneType } from './interfaces/Lane';
import { store } from './store/Store';
import { getRequestClient } from './helpers/RequestHelper';
import { updateCards } from './actions/Actions';
import { Translations } from './Translations';
import { DEFAULT_LANGUAGE } from './Constants';

const AddCommentMobile: React.FC = () => {
  const [comment, setComment] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();
  const cards = useSelector(selectCards);
  const lanes = useSelector(selectLanes);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();
  const client = getRequestClient(token);
  const lang = DEFAULT_LANGUAGE;

  // Helper pour trouver les lanes fermées (closed-won ou closed-lost)
  const closedLaneIds = lanes
    .filter((lane: Lane) => {
      if (!lane.tags) return false;
      return lane.tags.type === LaneType.ClosedWon || lane.tags.type === LaneType.ClosedLost;
    })
    .map((lane) => lane._id);

  // Cards actives = pas dans une lane fermée
  const activeCards = cards
    .filter((card) => !closedLaneIds.includes(card.laneId))
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (!cards || cards.length === 0) {
      const client = getRequestClient(token);
      client.getCards().then((fetchedCards) => {
        store.dispatch(updateCards(fetchedCards));
      });
    }
  }, [cards, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) {
      alert('Veuillez sélectionner une opportunité active.');
      return;
    }
    try {
      await client.createCardEvent(selectedCardId, comment);
      setComment('');
      const fetchedCards = await client.getCards();
      dispatch(updateCards(fetchedCards));
      setSuccess(true);
      setMessage(Translations.CommentAddedSuccessMessage[lang]);
    } catch (e) {
      setSuccess(false);
      setMessage(Translations.CommentAddedErrorMessage[lang]);
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
        {success === null && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '80%', maxWidth: 400 }}>
            {/* Sélecteur de Card active obligatoire */}
            <select
              id="active-card-select"
              required
              value={selectedCardId}
              onChange={e => setSelectedCardId(e.target.value)}
              style={{ marginBottom: 16, minHeight: 36 }}
            >
              <option value="" disabled>
                -- Choisir une opportunité --
              </option>
              {activeCards.map(card => (
                <option key={card._id} value={card._id}>
                  {card.name}
                </option>
              ))}
            </select>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Votre commentaire..."
              rows={5}
              style={{ marginBottom: '16px', padding: '8px', fontSize: '16px' }}
              required
            />
            <button type="submit" style={{ padding: '12px 24px', fontSize: '16px' }}>
              Ajouter
            </button>
            <button type="button" onClick={() => navigate(-1)} style={{ marginTop: '8px', padding: '12px 24px', fontSize: '16px' }}>
              Annuler
            </button>
          </form>
        )}
        {success !== null && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: success ? 'green' : 'red' }}>{message}</h2>
            <Link to="/mobile" style={{ color: '#007aff', fontSize: 18, textDecoration: 'underline' }}>
              Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCommentMobile;
