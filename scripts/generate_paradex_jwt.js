const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for Paradex API authentication
 * 
 * @param {string} l2Address - The L2 address (StarkKey)
 * @param {string} l2PrivateKey - The L2 private key
 * @returns {string} - The JWT token
 */
function generateParadexJWT(l2Address, l2PrivateKey) {
  try {
    // Convert the private key to a buffer
    const privateKeyBuffer = Buffer.from(l2PrivateKey, 'hex');
    
    // Create a payload with the necessary claims
    const payload = {
      sub: l2Address,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      aud: 'https://api.prod.paradex.trade/'
    };
    
    // Sign the JWT with the private key
    const token = jwt.sign(payload, privateKeyBuffer, { algorithm: 'ES256' });
    
    return token;
  } catch (error) {
    console.error('Error generating Paradex JWT:', error);
    throw error;
  }
}

// If this script is run directly, generate a token with the provided arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate_paradex_jwt.js <l2Address> <l2PrivateKey>');
    process.exit(1);
  }
  
  const [l2Address, l2PrivateKey] = args;
  
  try {
    const token = generateParadexJWT(l2Address, l2PrivateKey);
    console.log('Generated JWT Token:');
    console.log(token);
  } catch (error) {
    console.error('Failed to generate JWT token:', error);
    process.exit(1);
  }
}

module.exports = { generateParadexJWT };