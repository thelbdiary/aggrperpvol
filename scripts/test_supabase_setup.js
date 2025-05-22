const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test Supabase setup and table creation
async function testSupabaseSetup() {
  console.log('Testing Supabase setup and table creation...');
  
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase environment variables not set.');
    console.log('Please create a .env.local file with the following variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
    return;
  }
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('api_keys').select('count');
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('Table "api_keys" does not exist. Creating required tables...');
        await createTables(supabase);
      } else {
        throw error;
      }
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Tables exist and are accessible.');
    }
    
    // Test inserting sample data
    await testInsertData(supabase);
    
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
    
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      console.log('Tables may not exist. Attempting to create them...');
      await createTables(supabase);
    }
  }
}

// Create required tables
async function createTables(supabase) {
  try {
    console.log('Creating api_keys table...');
    await supabase.rpc('create_api_keys_table', {});
    
    console.log('Creating jwt_tokens table...');
    await supabase.rpc('create_jwt_tokens_table', {});
    
    console.log('Creating historical_volume table...');
    await supabase.rpc('create_historical_volume_table', {});
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    console.log('You may need to create the tables manually in the Supabase dashboard.');
    console.log('See the README.md for SQL commands to create the tables.');
  }
}

// Test inserting sample data
async function testInsertData(supabase) {
  try {
    console.log('\nTesting data insertion...');
    
    // Check if we already have sample data
    const { data: existingKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('platform', 'test')
      .limit(1);
      
    if (keysError) throw keysError;
    
    if (existingKeys && existingKeys.length > 0) {
      console.log('Sample data already exists. Skipping insertion.');
    } else {
      // Insert sample API key
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          platform: 'test',
          api_key: 'test_api_key',
          api_secret: 'test_api_secret'
        });
        
      if (insertError) throw insertError;
      
      console.log('Sample API key inserted successfully!');
      
      // Insert sample JWT token
      const { error: jwtError } = await supabase
        .from('jwt_tokens')
        .insert({
          platform: 'test',
          token: 'test_jwt_token'
        });
        
      if (jwtError) throw jwtError;
      
      console.log('Sample JWT token inserted successfully!');
      
      // Insert sample historical volume
      const { error: volumeError } = await supabase
        .from('historical_volume')
        .insert({
          platform: 'test',
          volume_usd: 1000.0,
          timestamp: new Date().toISOString()
        });
        
      if (volumeError) throw volumeError;
      
      console.log('Sample historical volume inserted successfully!');
    }
    
    // Verify data
    console.log('\nVerifying data in tables...');
    
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('*')
      .limit(5);
      
    if (apiKeysError) throw apiKeysError;
    
    console.log(`Found ${apiKeys.length} API keys in the database.`);
    
    const { data: jwtTokens, error: jwtTokensError } = await supabase
      .from('jwt_tokens')
      .select('*')
      .limit(5);
      
    if (jwtTokensError) throw jwtTokensError;
    
    console.log(`Found ${jwtTokens.length} JWT tokens in the database.`);
    
    const { data: volumeData, error: volumeError } = await supabase
      .from('historical_volume')
      .select('*')
      .limit(5);
      
    if (volumeError) throw volumeError;
    
    console.log(`Found ${volumeData.length} historical volume records in the database.`);
    
    console.log('\nSupabase setup test completed successfully!');
    console.log('Your Supabase database is properly configured and ready to use.');
    
  } catch (error) {
    console.error('Error testing data insertion:', error.message);
  }
}

// Run the test
testSupabaseSetup();