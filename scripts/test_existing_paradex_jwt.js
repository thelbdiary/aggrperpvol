const axios = require('axios');
require('dotenv').config();

// Function to test a JWT token with the Paradex API
async function testParadexJWT(token) {
  try {
    console.log('Testing JWT token with Paradex API...');
    
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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
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
  // Check if a JWT token is provided as a command-line argument
  const token = process.argv[2];
  
  if (!token) {
    console.error('Please provide a JWT token as a command-line argument');
    console.error('Usage: node test_existing_paradex_jwt.js <JWT_TOKEN>');
    process.exit(1);
  }
  
  // Test the JWT token
  await testParadexJWT(token);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});