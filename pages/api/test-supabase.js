import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to test Supabase connection
 * 
 * @param {object} req - Next.js API request object
 * @param {object} res - Next.js API response object
 */
export default async function handler(req, res) {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      connected: false, 
      error: 'Supabase environment variables not set' 
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test connection by making a simple query
    const { data, error } = await supabase
      .from('api_keys')
      .select('count')
      .limit(1);
    
    if (error) {
      // If there's an error with the specific table, try a more generic test
      const { data: healthData, error: healthError } = await supabase.rpc('get_service_status');
      
      if (healthError) {
        return res.status(500).json({ 
          connected: false, 
          error: healthError.message,
          details: 'Failed to connect to Supabase'
        });
      }
      
      return res.status(200).json({ 
        connected: true, 
        message: 'Connected to Supabase but api_keys table may not exist',
        health: healthData
      });
    }
    
    // Connection successful
    return res.status(200).json({ 
      connected: true, 
      message: 'Successfully connected to Supabase',
      tables: {
        api_keys: 'accessible'
      }
    });
    
  } catch (error) {
    return res.status(500).json({ 
      connected: false, 
      error: error.message,
      details: 'Exception occurred while testing Supabase connection'
    });
  }
}