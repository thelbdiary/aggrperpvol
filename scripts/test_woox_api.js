const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Function to generate WooX signature
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

// Function to test WooX API with API key and secret
async function testWooXAPI(apiKey, apiSecret) {
  try {
    console.log('Testing WooX API with provided credentials...');
    
    // Test public endpoint first
    console.log('\nTesting public endpoint...');
    const publicResponse = await axios.get('https://api.woo.org/v1/public/info');
    console.log('Public endpoint response status:', publicResponse.status);
    
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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    return {
      success: false,
      error: error.response ? error.response.data : error.message
    };
  }
}

// Main function to run the test
async function main() {
  // Check if API key and secret are provided as command-line arguments
  const apiKey = process.argv[2];
  const apiSecret = process.argv[3];
  
  if (!apiKey || !apiSecret) {
    console.error('Please provide API key and secret as command-line arguments');
    console.error('Usage: node test_woox_api.js <API_KEY> <API_SECRET>');
    process.exit(1);
  }
  
  // Test the API credentials
  await testWooXAPI(apiKey, apiSecret);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});