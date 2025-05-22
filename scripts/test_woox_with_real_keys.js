const WooXConnector = require('../lib/wooxConnector').default;
const axios = require('axios');

// Test WooX connector with the provided API keys
async function testWooXConnector() {
  console.log('Testing WooX connector with provided API keys...');
  
  // Use the provided WooX credentials
  const apiKey = '1VH4jswjYDOf2ZdE2JsxrQ==';
  const apiSecret = '2IEEY77I72T2MB5RPO3DRVIN7JBQ';
  
  const wooxConnector = new WooXConnector(apiKey, apiSecret);
  
  try {
    // First test a simple public endpoint to verify connectivity
    console.log('Testing public endpoint...');
    const publicResponse = await axios.get('https://api.woo.org/v1/public/info');
    console.log('Public endpoint response status:', publicResponse.status);
    
    // Get current time and 30 days ago
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30);
    
    console.log(`Fetching WooX volume data from ${startTime.toISOString()} to ${endTime.toISOString()}`);
    
    // Test account info endpoint directly
    console.log('Testing account info endpoint directly...');
    try {
      const timestamp = Date.now();
      const params = { timestamp };
      
      // Generate signature
      const signature = wooxConnector.generateSignature(params);
      
      const headers = {
        'x-api-key': apiKey,
        'x-api-signature': signature,
      };
      
      const accountUrl = `https://api.woo.org/v3/account/info?${new URLSearchParams(params).toString()}`;
      console.log('Account URL:', accountUrl);
      
      const accountResponse = await axios.get(accountUrl, { headers });
      console.log('Account info response status:', accountResponse.status);
      console.log('Account info response data:', JSON.stringify(accountResponse.data, null, 2));
    } catch (accountError) {
      console.error('Error testing account info endpoint:', accountError.message);
      if (accountError.response) {
        console.error('Response status:', accountError.response.status);
        console.error('Response data:', accountError.response.data);
      }
    }
    
    // Now test the full volume data method
    console.log('\nTesting full volume data method...');
    const volumeData = await wooxConnector.getHistoricalVolume(startTime.getTime(), endTime.getTime());
    
    console.log('WooX volume data source:', volumeData.source);
    console.log('WooX total volume:', volumeData.totalVolume);
    console.log('Number of trades:', volumeData.trades ? volumeData.trades.length : 0);
    
    if (volumeData.source === 'authenticated') {
      console.log('Successfully retrieved authenticated data');
    } else {
      console.log('Fell back to', volumeData.source, 'data');
    }
  } catch (error) {
    console.error('Error testing WooX connector:', error);
  }
}

// Run test
testWooXConnector();