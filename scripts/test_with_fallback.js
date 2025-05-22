const WooXConnector = require('../lib/wooxConnector').default;
const ParadexConnector = require('../lib/paradexConnector').default;

// Test WooX connector with fallback mechanism
async function testWooXConnector() {
  console.log('Testing WooX connector with fallback mechanism...');
  
  // Use invalid credentials to test fallback
  const wooxConnector = new WooXConnector('invalid_key', 'invalid_secret');
  
  try {
    // Get current time and 30 days ago
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30);
    
    console.log(`Fetching WooX volume data from ${startTime.toISOString()} to ${endTime.toISOString()}`);
    
    const volumeData = await wooxConnector.getHistoricalVolume(startTime, endTime);
    
    console.log('WooX volume data source:', volumeData.source);
    console.log('WooX total volume:', volumeData.totalVolume);
    console.log('Number of trades:', volumeData.trades.length);
    
    if (volumeData.source === 'public' || volumeData.source === 'error') {
      console.log('Successfully fell back to public data or error fallback');
    } else {
      console.log('Unexpected source:', volumeData.source);
    }
  } catch (error) {
    console.error('Error testing WooX connector:', error);
  }
}

// Test Paradex connector with fallback mechanism
async function testParadexConnector() {
  console.log('\nTesting Paradex connector with fallback mechanism...');
  
  // Use invalid JWT to test fallback
  const paradexConnector = new ParadexConnector('invalid_jwt_token');
  
  try {
    // Get current time and 30 days ago
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30);
    
    console.log(`Fetching Paradex volume data from ${startTime.toISOString()} to ${endTime.toISOString()}`);
    
    const volumeData = await paradexConnector.getHistoricalVolume(startTime, endTime);
    
    console.log('Paradex volume data source:', volumeData.source);
    console.log('Paradex total volume:', volumeData.totalVolume);
    
    if (volumeData.source === 'public' || volumeData.source === 'error') {
      console.log('Successfully fell back to public data or error fallback');
    } else {
      console.log('Unexpected source:', volumeData.source);
    }
  } catch (error) {
    console.error('Error testing Paradex connector:', error);
  }
}

// Run tests
async function runTests() {
  await testWooXConnector();
  await testParadexConnector();
}

runTests();