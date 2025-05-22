const axios = require('axios');

/**
 * Test script to verify a Vercel deployment is working correctly
 * 
 * Usage:
 * node test_vercel_deployment.js <vercel_url>
 * 
 * Example:
 * node test_vercel_deployment.js https://aggrperpvol.vercel.app
 */

async function testVercelDeployment() {
  // Get Vercel URL from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Please provide your Vercel deployment URL');
    console.error('Usage: node test_vercel_deployment.js <vercel_url>');
    process.exit(1);
  }
  
  const vercelUrl = args[0];
  console.log(`Testing Vercel deployment at: ${vercelUrl}`);
  
  try {
    // Test 1: Check if the main page loads
    console.log('\n1. Testing main page...');
    const mainPageResponse = await axios.get(vercelUrl);
    console.log(`Main page status: ${mainPageResponse.status}`);
    console.log('Main page loaded successfully!');
    
    // Test 2: Check if the volume API endpoint works
    console.log('\n2. Testing volume API endpoint...');
    try {
      const volumeResponse = await axios.get(`${vercelUrl}/api/volume`);
      console.log(`Volume API status: ${volumeResponse.status}`);
      console.log('Volume API response:', JSON.stringify(volumeResponse.data, null, 2));
      
      if (volumeResponse.data && (volumeResponse.data.woox || volumeResponse.data.paradex)) {
        console.log('Volume API is returning data correctly!');
      } else {
        console.log('Volume API is working but may not be returning expected data structure.');
        console.log('This could be normal if you haven\'t set up API keys yet.');
      }
    } catch (volumeError) {
      console.error('Error accessing volume API:', volumeError.message);
      if (volumeError.response) {
        console.error('Response status:', volumeError.response.status);
        console.error('Response data:', volumeError.response.data);
      }
    }
    
    // Test 3: Check Supabase connection via a simple API call
    console.log('\n3. Testing Supabase connection...');
    try {
      const supabaseTestResponse = await axios.get(`${vercelUrl}/api/test-supabase`);
      console.log(`Supabase test status: ${supabaseTestResponse.status}`);
      console.log('Supabase test response:', JSON.stringify(supabaseTestResponse.data, null, 2));
      
      if (supabaseTestResponse.data && supabaseTestResponse.data.connected) {
        console.log('Supabase connection is working correctly!');
      } else {
        console.log('Supabase connection test failed. Check your environment variables.');
      }
    } catch (supabaseError) {
      console.error('Error testing Supabase connection:', supabaseError.message);
      if (supabaseError.response) {
        console.error('Response status:', supabaseError.response.status);
        console.error('Response data:', supabaseError.response.data);
      }
      console.log('This could be normal if you haven\'t created the test-supabase API endpoint.');
    }
    
    console.log('\nVercel deployment test completed!');
    console.log('If all tests passed, your application is deployed correctly.');
    console.log('If some tests failed, check the error messages and your Vercel logs for more information.');
    
  } catch (error) {
    console.error('Error testing Vercel deployment:', error.message);
    process.exit(1);
  }
}

// Run the test
testVercelDeployment();