import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileMain: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <button
        style={{ margin: '10px', padding: '12px 24px', fontSize: '16px' }}
        onClick={() => navigate('/ajouter-opportunite')}
      >
        Ajouter une opportunité
      </button>
      <button
        style={{ margin: '10px', padding: '12px 24px', fontSize: '16px' }}
        onClick={() => navigate('/ajouter-commentaire')}
      >
        Ajouter un commentaire
      </button>
    </div>
  );
};

export default MobileMain;
