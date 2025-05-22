const axios = require('axios');
const crypto = require('crypto');

// WooX API credentials
const API_KEY = '1VH4jswjYDOf2ZdE2JsxrQ==';
const API_SECRET = '2IEEY77I72T2MB5RPO3DRVIN7JBQ';

// Base URL for WooX API
const BASE_URL = 'https://api.woo.org';

/**
 * Generate signature for WooX API requests
 * @param {Object} params - Request parameters
 * @returns {string} - Signature
 */
function generateSignature(params) {
  const queryString = new URLSearchParams(params).toString();
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');
}

/**
 * Test public endpoint (no authentication required)
 */
async function testPublicEndpoint() {
  try {
    console.log('Testing WooX public endpoint...');
    const response = await axios.get(`${BASE_URL}/v1/public/info`);
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
    console.log('Testing WooX private endpoint...');
    
    const timestamp = Date.now();
    const params = { timestamp };
    
    const signature = generateSignature(params);
    
    const headers = {
      'x-api-key': API_KEY,
      'x-api-signature': signature,
    };
    
    const url = `${BASE_URL}/v1/client/info?${new URLSearchParams(params).toString()}`;
    
    const response = await axios.get(url, { headers });
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
 * Test historical trades endpoint
 */
async function testHistoricalTrades() {
  try {
    console.log('Testing WooX historical trades endpoint...');
    
    // Calculate date range (last 30 days)
    const endTime = Date.now();
    const startTime = endTime - (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    
    const timestamp = Date.now();
    const params = {
      timestamp,
      start_time: Math.floor(startTime / 1000),
      end_time: Math.floor(endTime / 1000),
    };
    
    const signature = generateSignature(params);
    
    const headers = {
      'x-api-key': API_KEY,
      'x-api-signature': signature,
    };
    
    const url = `${BASE_URL}/v1/client/trades?${new URLSearchParams(params).toString()}`;
    
    const response = await axios.get(url, { headers });
    console.log('Historical trades response:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    // Calculate total volume
    let totalVolume = 0;
    const trades = response.data.rows || [];
    
    for (const trade of trades) {
      const price = parseFloat(trade.executed_price || 0);
      const size = parseFloat(trade.executed_quantity || 0);
      totalVolume += price * size;
    }
    
    console.log(`Total volume: $${totalVolume.toLocaleString()}`);
    
    return true;
  } catch (error) {
    console.error('Error testing historical trades endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting WooX API tests...');
  
  const publicResult = await testPublicEndpoint();
  console.log(`Public endpoint test ${publicResult ? 'PASSED' : 'FAILED'}`);
  
  const privateResult = await testPrivateEndpoint();
  console.log(`Private endpoint test ${privateResult ? 'PASSED' : 'FAILED'}`);
  
  if (privateResult) {
    const tradesResult = await testHistoricalTrades();
    console.log(`Historical trades test ${tradesResult ? 'PASSED' : 'FAILED'}`);
  }
  
  console.log('WooX API tests completed.');
}

// Run the tests
runTests();