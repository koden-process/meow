import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../src/App.css';
import { Button } from '@adobe/react-spectrum';
import { MobileUserAnchor } from './components/MobileUserAnchor';

const IconOpportunity = () => (
  <span role="img" aria-label="opportunité" style={{ marginRight: 8 }}>💼</span>
);
const IconComment = () => (
  <span role="img" aria-label="commentaire" style={{ marginRight: 8 }}>💬</span>
);

const MobileMain: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="canvas mobile-menu" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <h2 style={{ marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>Menu principal</h2>
      <Button
        variant="primary"
        UNSAFE_style={{ margin: '16px 0', minWidth: 220, fontSize: '1.1em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onPress={() => navigate('/ajouter-opportunite')}
      >
        <IconOpportunity /> Ajouter une opportunité
      </Button>
      <Button
        variant="primary"
        UNSAFE_style={{ margin: '16px 0', minWidth: 220, fontSize: '1.1em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onPress={() => navigate('/ajouter-commentaire')}
      >
        <IconComment /> Ajouter un commentaire
      </Button>
      <MobileUserAnchor />
    </div>
  );
};

export default MobileMain;
