// Script de debug pour vérifier l'état des transferts
console.log('=== DEBUG TRANSFER STATUS ===');

// Debug spécifique pour la card Toto 5
const debugSpecificCard = async () => {
  try {
    // Utilise ton token JWT
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTYzODE5NDIuMDAxLCJleHAiOjE3NTY5ODY3NDIsInVzZXJJZCI6IjY4YjAxZjdmMTBjNjBiYzUyYjZlZWIzNyIsInRlYW1JZCI6IjY4YjAxZjdmMTBjNjBiYzUyYjZlZWIyZSJ9.P1NjdflGvUkYNQ6im19kuWNpx46qCsBVRUdfuNqCywM';
    
    const cardId = '68b03c9b10c60bc52b6eeb86';
    const expectedLaneId = '68b01f7f10c60bc52b6eeb30';
    const actualLaneId = '68b0202510c60bc52b6eeb58';
    
    console.log('=== DEBUGGING CARD TOTO 5 ===');
    console.log('Card ID:', cardId);
    console.log('Expected Lane ID:', expectedLaneId);
    console.log('Actual Lane ID:', actualLaneId);
    
    // 1. Get card details
    console.log('\n1. Getting card details...');
    const cardResponse = await fetch(`http://localhost:9000/api/cards/${cardId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (cardResponse.ok) {
      const card = await cardResponse.json();
      console.log('Card:', {
        _id: card._id,
        name: card.name,
        teamId: card.teamId,
        userId: card.userId,
        laneId: card.laneId
      });
      
      // 2. Get all lanes for this team
      console.log('\n2. Getting lanes for team', card.teamId);
      const lanesResponse = await fetch(`http://localhost:9000/api/lanes?teamId=${card.teamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (lanesResponse.ok) {
        const lanes = await lanesResponse.json();
        console.log('Available lanes:');
        lanes
          .sort((a, b) => a.index - b.index)
          .forEach(lane => {
            console.log(`  - ${lane.name} (ID: ${lane._id}, Index: ${lane.index}) ${lane._id === expectedLaneId ? '← EXPECTED' : ''} ${lane._id === actualLaneId ? '← ACTUAL' : ''}`);
          });
          
        const firstLane = lanes.sort((a, b) => a.index - b.index)[0];
        console.log('\nFirst lane (lowest index):', {
          _id: firstLane._id,
          name: firstLane.name,
          index: firstLane.index
        });
      }
    }
    
    // 3. Check recent transfers for this card
    console.log('\n3. Getting recent transfers...');
    const transfersResponse = await fetch('http://localhost:9000/api/opportunity-transfers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (transfersResponse.ok) {
      const transfers = await transfersResponse.json();
      const cardTransfers = transfers.filter(t => t.cardId === cardId);
      console.log('Transfers for this card:', cardTransfers);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Test d'une simple requête fetch vers l'API
const testTransferStatus = async () => {
  try {
    // Remplace par ton token JWT et l'URL de ton API
    const token = 'YOUR_JWT_TOKEN_HERE';
    
    console.log('1. Checking recent transfers...');
    const transfersResponse = await fetch('http://localhost:9000/api/opportunity-transfers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (transfersResponse.ok) {
      const transfers = await transfersResponse.json();
      console.log('Recent transfers:', transfers);
      
      // Chercher les transferts acceptés récemment
      const recentAccepted = transfers.filter(t => 
        t.status === 'accepted' && 
        new Date(t.respondedAt) > new Date(Date.now() - 60000 * 10) // 10 minutes ago
      );
      
      console.log('Recently accepted transfers:', recentAccepted);
      
      if (recentAccepted.length > 0) {
        const cardId = recentAccepted[0].cardId;
        console.log(`2. Checking card ${cardId}...`);
        
        const cardResponse = await fetch(`http://localhost:9000/api/cards/${cardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (cardResponse.ok) {
          const card = await cardResponse.json();
          console.log('Card details:', {
            _id: card._id,
            name: card.name,
            teamId: card.teamId,
            userId: card.userId,
            laneId: card.laneId,
            updatedAt: card.updatedAt
          });
        } else {
          console.log('Card not accessible:', cardResponse.status, cardResponse.statusText);
        }
      }
    } else {
      console.log('Failed to fetch transfers:', transfersResponse.status, transfersResponse.statusText);
    }
    
    console.log('3. Checking all cards...');
    const cardsResponse = await fetch('http://localhost:9000/api/cards', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (cardsResponse.ok) {
      const cards = await cardsResponse.json();
      console.log(`Found ${cards.length} cards in current team`);
    } else {
      console.log('Failed to fetch cards:', cardsResponse.status, cardsResponse.statusText);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

console.log('Pour utiliser ce script:');
console.log('1. Remplace YOUR_JWT_TOKEN_HERE par ton token JWT');
console.log('2. Lance: node debug-transfer.js');
console.log('3. Ou lance directement debugSpecificCard() dans la console du navigateur pour debug spécifique');
console.log('4. Ou lance directement testTransferStatus() dans la console du navigateur pour debug général');
