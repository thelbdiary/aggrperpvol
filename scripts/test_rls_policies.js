require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables or use defaults
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqyrwdvrukgwhiwkpabp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeXJ3ZHZydWtnd2hpd2twYWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzIzMjksImV4cCI6MjA2MzQ0ODMyOX0.XpOzpxdzqkDYEKsuf_BKoaS7B8XBSmlOcLIFOj4oanI';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to log Supabase errors with more context
const logSupabaseError = (error, operation) => {
  console.error(`Supabase error during ${operation}:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  });
};

// Test RLS policies for a table
async function testTableRLSPolicies(tableName) {
  console.log(`\n=== Testing RLS policies for ${tableName} table ===`);
  
  // Test SELECT
  console.log(`Testing SELECT on ${tableName}...`);
  const { data: selectData, error: selectError } = await supabase
    .from(tableName)
    .select('count')
    .limit(1);
    
  if (selectError) {
    console.error(`❌ SELECT failed on ${tableName}`);
    logSupabaseError(selectError, `SELECT on ${tableName}`);
    
    if (selectError.message && selectError.message.includes('row-level security')) {
      console.error(`RLS policy error: Please enable SELECT access for all users on the ${tableName} table.`);
    }
  } else {
    console.log(`✅ SELECT works on ${tableName}`);
  }
  
  // Test INSERT
  console.log(`Testing INSERT on ${tableName}...`);
  
  // Create test data based on table name
  let testData = {};
  if (tableName === 'api_keys') {
    testData = {
      platform: 'test_platform',
      api_key: 'test_api_key',
      api_secret: 'test_api_secret',
      created_at: new Date().toISOString()
    };
  } else if (tableName === 'jwt_tokens') {
    testData = {
      platform: 'test_platform',
      token: 'test_token',
      created_at: new Date().toISOString()
    };
  } else if (tableName === 'historical_volume') {
    testData = {
      platform: 'test_platform',
      volume_usd: 1000,
      timestamp: new Date().toISOString()
    };
  }
  
  const { data: insertData, error: insertError } = await supabase
    .from(tableName)
    .insert(testData)
    .select();
    
  if (insertError) {
    console.error(`❌ INSERT failed on ${tableName}`);
    logSupabaseError(insertError, `INSERT on ${tableName}`);
    
    if (insertError.message && insertError.message.includes('row-level security')) {
      console.error(`RLS policy error: Please enable INSERT access for all users on the ${tableName} table.`);
    }
  } else {
    console.log(`✅ INSERT works on ${tableName}`);
    
    // If insert worked, test UPDATE and DELETE
    if (insertData && insertData.length > 0) {
      const id = insertData[0].id;
      
      // Test UPDATE
      console.log(`Testing UPDATE on ${tableName}...`);
      
      let updateData = {};
      if (tableName === 'api_keys') {
        updateData = { api_key: 'updated_test_api_key' };
      } else if (tableName === 'jwt_tokens') {
        updateData = { token: 'updated_test_token' };
      } else if (tableName === 'historical_volume') {
        updateData = { volume_usd: 2000 };
      }
      
      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id);
        
      if (updateError) {
        console.error(`❌ UPDATE failed on ${tableName}`);
        logSupabaseError(updateError, `UPDATE on ${tableName}`);
        
        if (updateError.message && updateError.message.includes('row-level security')) {
          console.error(`RLS policy error: Please enable UPDATE access for all users on the ${tableName} table.`);
        }
      } else {
        console.log(`✅ UPDATE works on ${tableName}`);
      }
      
      // Test DELETE
      console.log(`Testing DELETE on ${tableName}...`);
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        console.error(`❌ DELETE failed on ${tableName}`);
        logSupabaseError(deleteError, `DELETE on ${tableName}`);
        
        if (deleteError.message && deleteError.message.includes('row-level security')) {
          console.error(`RLS policy error: Please enable DELETE access for all users on the ${tableName} table.`);
        }
      } else {
        console.log(`✅ DELETE works on ${tableName}`);
      }
    }
  }
}

// Main function to test all tables
async function testAllTables() {
  console.log('=== Testing Supabase RLS Policies ===');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  try {
    // Test each table
    await testTableRLSPolicies('api_keys');
    await testTableRLSPolicies('jwt_tokens');
    await testTableRLSPolicies('historical_volume');
    
    console.log('\n=== Summary ===');
    console.log('If any tests failed with RLS policy errors, please follow these steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the "Authentication" > "Policies" section');
    console.log('3. For each table (api_keys, jwt_tokens, historical_volume):');
    console.log('   - Create policies for SELECT, INSERT, UPDATE, and DELETE operations');
    console.log('   - Set the policy expression to "true" to allow all operations');
    console.log('   - See the README for detailed instructions');
    
  } catch (error) {
    console.error('Error testing RLS policies:', error);
  }
}

// Run the tests
testAllTables();