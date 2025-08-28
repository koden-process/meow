// Script de debug pour tester l'API des transferts
// Utiliser dans la console du navigateur

console.log('=== DEBUG TRANSFERS API ===');

// Fonction pour tester l'API
async function debugTransfers() {
  try {
    // Récupérer le token depuis le store Redux (devtools)
    const state = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.getState && window.__REDUX_DEVTOOLS_EXTENSION__.getState();
    const token = state?.session?.token;
    
    if (!token) {
      console.error('Token not found. Make sure you are logged in.');
      return;
    }
    
    console.log('Token found:', token.substring(0, 20) + '...');
    
    // Base URL
    const baseURL = window.location.origin;
    console.log('Base URL:', baseURL);
    
    // Test GET /api/opportunity-transfers
    console.log('\n--- Testing GET /api/opportunity-transfers ---');
    const allResponse = await fetch(`${baseURL}/api/opportunity-transfers`, {
      headers: {
        'Accept': 'application/json',
        'Token': token
      }
    });
    
    if (!allResponse.ok) {
      console.error('Failed to fetch all transfers:', allResponse.status, allResponse.statusText);
      const errorText = await allResponse.text();
      console.error('Error response:', errorText);
    } else {
      const allTransfers = await allResponse.json();
      console.log('All transfers:', allTransfers);
    }
    
    // Test GET /api/opportunity-transfers?type=received
    console.log('\n--- Testing GET /api/opportunity-transfers?type=received ---');
    const receivedResponse = await fetch(`${baseURL}/api/opportunity-transfers?type=received`, {
      headers: {
        'Accept': 'application/json',
        'Token': token
      }
    });
    
    if (!receivedResponse.ok) {
      console.error('Failed to fetch received transfers:', receivedResponse.status, receivedResponse.statusText);
    } else {
      const receivedTransfers = await receivedResponse.json();
      console.log('Received transfers:', receivedTransfers);
    }
    
    // Test GET /api/opportunity-transfers?type=sent
    console.log('\n--- Testing GET /api/opportunity-transfers?type=sent ---');
    const sentResponse = await fetch(`${baseURL}/api/opportunity-transfers?type=sent`, {
      headers: {
        'Accept': 'application/json',
        'Token': token
      }
    });
    
    if (!sentResponse.ok) {
      console.error('Failed to fetch sent transfers:', sentResponse.status, sentResponse.statusText);
    } else {
      const sentTransfers = await sentResponse.json();
      console.log('Sent transfers:', sentTransfers);
    }
    
  } catch (error) {
    console.error('Error during debug:', error);
  }
}

// Lancer le debug
debugTransfers();

console.log('=== DEBUG SCRIPT EXECUTED ===');
console.log('Check the logs above for API responses.');
console.log('You can also call debugTransfers() manually.');
