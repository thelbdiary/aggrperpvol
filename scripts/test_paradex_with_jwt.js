const axios = require('axios');

// Paradex API base URL
const BASE_URL = 'https://api.prod.paradex.trade/v1';

// JWT token for authentication (replace with your actual token)
const JWT_TOKEN = process.argv[2];

if (!JWT_TOKEN) {
  console.error('Please provide a JWT token as an argument');
  console.error('Usage: node test_paradex_with_jwt.js <jwt_token>');
  process.exit(1);
}

/**
 * Test public endpoint (no authentication required)
 */
async function testPublicEndpoint() {
  try {
    console.log('Testing Paradex public endpoint...');
    const response = await axios.get(`${BASE_URL}/markets/summary?market=ALL`);
    console.log('Public endpoint response:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    return true;
  } catch (error) {
    console.error('Error testing public endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

/**
 * Test private endpoint (authentication required)
 */
async function testPrivateEndpoint() {
  try {
    console.log('Testing Paradex private endpoint...');
    
    const headers = {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Accept': 'application/json'
    };
    
    const response = await axios.get(`${BASE_URL}/account/balances`, { headers });
    console.log('Private endpoint response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing private endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

/**
 * Test historical fills endpoint
 */
async function testHistoricalFills() {
  try {
    console.log('Testing Paradex historical fills endpoint...');
    
    // Calculate date range (last 30 days)
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30);
    
    const params = {
      start_at: startTime.toISOString(),
      end_at: endTime.toISOString(),
      page_size: 100
    };
    
    const headers = {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Accept': 'application/json'
    };
    
    const response = await axios.get(`${BASE_URL}/account/list-fills`, {
      params,
      headers
    });
    
    console.log('Historical fills response:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    // Calculate total volume
    let totalVolume = 0;
    const fills = response.data.results || [];
    
    for (const fill of fills) {
      const price = parseFloat(fill.price || 0);
      const size = parseFloat(fill.size || 0);
      totalVolume += price * size;
    }
    
    console.log(`Total volume: $${totalVolume.toLocaleString()}`);
    
    return true;
  } catch (error) {
    console.error('Error testing historical fills endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Paradex API tests...');
  
  const publicResult = await testPublicEndpoint();
  console.log(`Public endpoint test ${publicResult ? 'PASSED' : 'FAILED'}`);
  
  const privateResult = await testPrivateEndpoint();
  console.log(`Private endpoint test ${privateResult ? 'PASSED' : 'FAILED'}`);
  
  if (privateResult) {
    const fillsResult = await testHistoricalFills();
    console.log(`Historical fills test ${fillsResult ? 'PASSED' : 'FAILED'}`);
  }
  
  console.log('Paradex API tests completed.');
}

// Run the tests
runTests();