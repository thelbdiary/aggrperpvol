const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// WooX Functions
function generateWooXSignature(apiSecret, timestamp, method, path, params = {}) {
  // Convert params to query string
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Create string to sign
  const stringToSign = timestamp + method + path + queryString;
  
  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(stringToSign)
    .digest('hex');
  
  return signature;
}

async function testWooXAPI(apiKey, apiSecret) {
  try {
    console.log('Testing WooX API with provided credentials...');
    
    // Test private endpoint
    console.log('\nTesting private endpoint...');
    
    const timestamp = Date.now().toString();
    const method = 'GET';
    const path = '/v1/client/info';
    
    const signature = generateWooXSignature(apiSecret, timestamp, method, path);
    
    const response = await axios.get('https://api.woo.org/v1/client/info', {
      headers: {
        'x-api-key': apiKey,
        'x-api-signature': signature,
        'x-api-timestamp': timestamp
      }
    });
    
    console.log('Private endpoint response status:', response.status);
    console.log('Private endpoint response data:', JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error testing WooX API:');
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Return fallback data
    console.log('\nUsing fallback mechanism for WooX...');
    return await testWooXPublicAPI();
  }
}

async function testWooXPublicAPI() {
  try {
    console.log('Testing WooX public API...');
    
    // Get exchange information
    const infoResponse = await axios.get('https://api.woo.org/v1/public/info');
    console.log('Exchange info response status:', infoResponse.status);
    
    // Get market data for BTC/USDT
    const marketResponse = await axios.get('https://api.woo.org/v1/public/market_trades/SPOT_BTC_USDT');
    console.log('Market data response status:', marketResponse.status);
    
    // Get kline data
    const klineResponse = await axios.get('https://api.woo.org/v1/public/kline?symbol=SPOT_BTC_USDT&type=1d&limit=30');
    console.log('Kline data response status:', klineResponse.status);
    
    // Calculate total volume from kline data
    const klineData = klineResponse.data.rows;
    let totalVolume = 0;
    
    if (klineData && klineData.length > 0) {
      totalVolume = klineData.reduce((sum, kline) => sum + parseFloat(kline[5]), 0);
    }
    
    console.log('Total volume from public data (last 30 days):', totalVolume);
    
    return {
      success: true,
      fallback: true,
      data: {
        totalVolume,
        message: 'Using public data as fallback'
      }
    };
  } catch (error) {
    console.error('Error testing WooX public API:', error.message);
    return {
      success: false,
      fallback: true,
      error: error.message,
      data: {
        totalVolume: 0,
        message: 'Failed to get public data'
      }
    };
  }
}

// Paradex Functions
async function testParadexJWT(token) {
  try {
    console.log('Testing Paradex API with JWT token...');
    
    // Make a request to the Paradex API with the JWT token
    const response = await axios.get('https://api.testnet.paradex.trade/v1/user/balances', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Paradex API response status:', response.status);
    console.log('Paradex API response data:', JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error testing Paradex JWT token:');
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Return fallback data
    console.log('\nUsing fallback mechanism for Paradex...');
    return await testParadexPublicAPI();
  }
}

async function testParadexPublicAPI() {
  try {
    console.log('Testing Paradex public API...');
    
    // Get orderbook data for BTC/USDC
    const orderbookResponse = await axios.get('https://api.testnet.paradex.trade/v1/orderbook/BTCUSDC');
    console.log('Orderbook response status:', orderbookResponse.status);
    
    // Get market data
    const marketResponse = await axios.get('https://api.testnet.paradex.trade/v1/markets');
    console.log('Market data response status:', marketResponse.status);
    
    // Get ticker data
    const tickerResponse = await axios.get('https://api.testnet.paradex.trade/v1/ticker');
    console.log('Ticker data response status:', tickerResponse.status);
    
    // Calculate estimated volume from ticker data
    const tickerData = tickerResponse.data;
    let totalVolume = 0;
    
    if (tickerData && tickerData.length > 0) {
      totalVolume = tickerData.reduce((sum, ticker) => {
        return sum + (parseFloat(ticker.volume_24h) || 0);
      }, 0);
    }
    
    console.log('Total estimated volume from public data (24h):', totalVolume);
    
    return {
      success: true,
      fallback: true,
      data: {
        totalVolume,
        message: 'Using public data as fallback'
      }
    };
  } catch (error) {
    console.error('Error testing Paradex public API:', error.message);
    return {
      success: false,
      fallback: true,
      error: error.message,
      data: {
        totalVolume: 0,
        message: 'Failed to get public data'
      }
    };
  }
}

// Main function to run the tests
async function main() {
  // Check if API credentials are provided as command-line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Please provide WooX API key, WooX API secret, and Paradex JWT token as command-line arguments');
    console.error('Usage: node test_combined_with_fallback.js <WOOX_API_KEY> <WOOX_API_SECRET> <PARADEX_JWT_TOKEN>');
    process.exit(1);
  }
  
  const wooxApiKey = args[0];
  const wooxApiSecret = args[1];
  const paradexJwtToken = args[2];
  
  console.log('=== Testing WooX API ===');
  const wooxResult = await testWooXAPI(wooxApiKey, wooxApiSecret);
  
  console.log('\n=== Testing Paradex API ===');
  const paradexResult = await testParadexJWT(paradexJwtToken);
  
  console.log('\n=== Summary ===');
  console.log('WooX API test:', wooxResult.success ? 'Success' : 'Failed', wooxResult.fallback ? '(using fallback)' : '');
  console.log('Paradex API test:', paradexResult.success ? 'Success' : 'Failed', paradexResult.fallback ? '(using fallback)' : '');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});