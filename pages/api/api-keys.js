import { supabase, logSupabaseError } from '../../lib/supabase';

export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getApiKeys(req, res);
    case 'POST':
      return saveApiKey(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get API keys from the database
 */
async function getApiKeys(req, res) {
  try {
    // Check if the api_keys table exists
    const { error: tableCheckError } = await supabase
      .from('api_keys')
      .select('count')
      .limit(1);
      
    if (tableCheckError) {
      if (tableCheckError.code === '42P01') { // Table doesn't exist
        logSupabaseError(tableCheckError, 'checking api_keys table');
        return res.status(500).json({ 
          error: 'The api_keys table does not exist in the database. Please set up your Supabase tables as described in the README.' 
        });
      }
    }
    
    // Get API keys from Supabase
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, platform, created_at')
      .order('created_at', { ascending: false });
      
    if (error) {
      logSupabaseError(error, 'fetching API keys');
      throw error;
    }
    
    // Return the API keys (without the actual keys for security)
    return res.status(200).json({ 
      success: true,
      data: data.map(key => ({
        id: key.id,
        platform: key.platform,
        created_at: key.created_at,
        has_key: true
      }))
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return res.status(500).json({ 
      error: 'An error occurred while fetching API keys',
      details: error.message
    });
  }
}

/**
 * Save an API key to the database
 */
async function saveApiKey(req, res) {
  try {
    const { platform, api_key, api_secret } = req.body;
    
    // Validate input
    if (!platform || !api_key || !api_secret) {
      return res.status(400).json({ 
        error: 'Platform, API key, and API secret are required' 
      });
    }
    
    if (platform !== 'woox' && platform !== 'paradex') {
      return res.status(400).json({ 
        error: 'Platform must be either "woox" or "paradex"' 
      });
    }
    
    // Check if the api_keys table exists
    const { error: tableCheckError } = await supabase
      .from('api_keys')
      .select('count')
      .limit(1);
      
    if (tableCheckError) {
      if (tableCheckError.code === '42P01') { // Table doesn't exist
        logSupabaseError(tableCheckError, 'checking api_keys table');
        return res.status(500).json({ 
          error: 'The api_keys table does not exist in the database. Please set up your Supabase tables as described in the README.' 
        });
      }
    }
    
    // First check if a record with this platform already exists
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('platform', platform)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
      logSupabaseError(fetchError, 'checking for existing API key');
      throw fetchError;
    }
    
    let error;
    
    if (existingKey) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ 
          api_key,
          api_secret,
          created_at: new Date().toISOString()
        })
        .eq('id', existingKey.id);
        
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({ 
          platform,
          api_key,
          api_secret,
          created_at: new Date().toISOString()
        });
        
      error = insertError;
    }
      
    if (error) {
      logSupabaseError(error, 'saving API key');
      throw error;
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving API key:', error);
    
    // Check for specific error types
    if (error.code === '23505') {
      // Unique violation error
      return res.status(400).json({ 
        error: 'A record for this platform already exists',
        details: 'Please use the update functionality instead of creating a new record'
      });
    } else if (error.code === '42P01') {
      // Table doesn't exist
      return res.status(500).json({ 
        error: 'The api_keys table does not exist in the database',
        details: 'Please set up your Supabase tables as described in the README'
      });
    } else if (error.message && error.message.includes('unique constraint')) {
      // Another unique constraint error
      return res.status(400).json({ 
        error: 'A record for this platform already exists',
        details: 'Please use the update functionality instead of creating a new record'
      });
    }
    
    return res.status(500).json({ 
      error: 'An error occurred while saving the API key',
      details: error.message
    });
  }
}