import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddCommentMobile: React.FC = () => {
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Envoyer le commentaire à l'API ou le stocker
    alert('Commentaire ajouté : ' + comment);
    navigate(-1); // Retour à la page précédente
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h2>Ajouter un commentaire</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '80%', maxWidth: 400 }}>
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
    </div>
  );
};

export default AddCommentMobile;

