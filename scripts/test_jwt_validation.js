const jwt = require('jsonwebtoken');

// Function to create a test JWT token
function createTestJWT(payload, secret = 'test-secret', options = {}) {
  return jwt.sign(payload, secret, options);
}

// Test valid JWT token
const validPayload = {
  sub: 'test-user',
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  iat: Math.floor(Date.now() / 1000)
};

const validToken = createTestJWT(validPayload);
console.log('Valid JWT Token:', validToken);

// Decode and verify the token structure
try {
  const decoded = jwt.decode(validToken, { complete: true });
  console.log('Decoded JWT Token:', JSON.stringify(decoded, null, 2));
  
  if (!decoded || !decoded.header || !decoded.payload) {
    console.error('Invalid JWT token format');
  } else {
    console.log('JWT token format is valid');
    
    // Check if it has basic JWT properties
    if (!decoded.payload.exp) {
      console.warn('JWT token does not have an expiration claim');
    } else {
      console.log('JWT token has an expiration claim');
    }
  }
} catch (error) {
  console.error('JWT validation error:', error);
}

// Test invalid JWT token (missing parts)
const invalidToken = 'not.a.valid.jwt.token';
console.log('\nInvalid JWT Token:', invalidToken);

try {
  const decoded = jwt.decode(invalidToken, { complete: true });
  console.log('Decoded Invalid JWT Token:', decoded);
  
  if (!decoded || !decoded.header || !decoded.payload) {
    console.error('Invalid JWT token format');
  }
} catch (error) {
  console.error('JWT validation error:', error);
}

// Test expired JWT token
const expiredPayload = {
  sub: 'test-user',
  exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  iat: Math.floor(Date.now() / 1000) - 7200  // 2 hours ago
};

const expiredToken = createTestJWT(expiredPayload);
console.log('\nExpired JWT Token:', expiredToken);

try {
  const decoded = jwt.decode(expiredToken, { complete: true });
  console.log('Decoded Expired JWT Token:', JSON.stringify(decoded, null, 2));
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (decoded.payload.exp < now) {
    console.error('JWT token is expired');
  }
} catch (error) {
  console.error('JWT validation error:', error);
}

// Test JWT token without expiration
const noExpPayload = {
  sub: 'test-user',
  iat: Math.floor(Date.now() / 1000)
};

const noExpToken = createTestJWT(noExpPayload);
console.log('\nJWT Token without expiration:', noExpToken);

try {
  const decoded = jwt.decode(noExpToken, { complete: true });
  console.log('Decoded JWT Token without expiration:', JSON.stringify(decoded, null, 2));
  
  if (!decoded.payload.exp) {
    console.warn('JWT token does not have an expiration claim');
  }
} catch (error) {
  console.error('JWT validation error:', error);
}