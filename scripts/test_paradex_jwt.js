const { generateParadexJWT } = require('./generate_paradex_jwt');
const axios = require('axios');

// Test Paradex JWT generation and API access
async function testParadexJWT() {
  console.log('Testing Paradex JWT generation and API access...');
  
  // Check if L2 address and private key are provided as arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node test_paradex_jwt.js <l2_address> <l2_private_key>');
    process.exit(1);
  }
  
  const l2Address = args[0];
  const l2PrivateKey = args[1];
  
  try {
    // Generate JWT token
    console.log('Generating JWT token...');
    const jwtToken = generateParadexJWT(l2Address, l2PrivateKey);
    console.log('JWT token generated successfully');
    
    // Test a public endpoint first
    console.log('\nTesting public endpoint...');
    const publicResponse = await axios.get('https://api.testnet.paradex.trade/v1/orderbook/BTCUSDC', {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('Public endpoint response status:', publicResponse.status);
    
    // Test account info endpoint with JWT token
    console.log('\nTesting account info endpoint with JWT token...');
    try {
      const accountResponse = await axios.get('https://api.testnet.paradex.trade/v1/account/info', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Account info response status:', accountResponse.status);
      console.log('Account info response data:', JSON.stringify(accountResponse.data, null, 2));
      
      // If we get here, the JWT token is working
      console.log('\nJWT token is working correctly!');
      return true;
    } catch (accountError) {
      console.error('Error accessing account info:', accountError.message);
      if (accountError.response) {
        console.error('Response status:', accountError.response.status);
        console.error('Response data:', accountError.response.data);
      }
      return false;
    }
  } catch (error) {
    console.error('Error in Paradex JWT test:', error);
    return false;
  }
}

// Run the test
testParadexJWT();