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
import './App.css';
import { Button } from '@adobe/react-spectrum';

const AddCommentMobile: React.FC = () => {
  const [comment, setComment] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      await client.createCardEvent(selectedCardId, comment);
      setComment('');
      const fetchedCards = await client.getCards();
      dispatch(updateCards(fetchedCards));
      setSuccess(true);
      setMessage(Translations.CommentAddedSuccessMessage[lang]);
      setTimeout(() => navigate('/mobile'), 1800);
    } catch (e) {
      setSuccess(false);
      setMessage(Translations.CommentAddedErrorMessage[lang]);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyle: React.CSSProperties = { borderRadius: 24, background: '#fff', color: '#007aff', border: '1px solid #007aff', boxShadow: '0 2px 8px #eee' };

  return (
    <div className="canvas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ marginTop: '60px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>Ajouter un commentaire</h2>
        {isLoading && <div style={{ margin: 16 }}><span className="loader"></span></div>}
        {success === null && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '80%', maxWidth: 400 }}>
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
            <div className="card-submit" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button type="submit" variant="primary" isDisabled={!comment.trim()} UNSAFE_style={{ minWidth: 180 }}>
                Enregistrer
              </Button>
              <Button type="button" variant="secondary" UNSAFE_style={{ marginTop: 12, minWidth: 180 }} onPress={() => navigate('/mobile')}>
                Annuler
              </Button>
            </div>
            <div className="char-counter" style={{ textAlign: 'right', fontSize: 12, color: '#888', marginTop: 4 }}>{comment.length}/500</div>
          </form>
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

export default AddCommentMobile;
