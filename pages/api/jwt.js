import { supabase, logSupabaseError } from '../../lib/supabase';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'JWT token is required' });
    }
    
    // Check if the jwt_tokens table exists
    const { error: tableCheckError } = await supabase
      .from('jwt_tokens')
      .select('count')
      .limit(1);
      
    if (tableCheckError) {
      if (tableCheckError.code === '42P01') { // Table doesn't exist
        logSupabaseError(tableCheckError, 'checking jwt_tokens table');
        return res.status(500).json({ 
          error: 'The jwt_tokens table does not exist in the database. Please set up your Supabase tables as described in the README.' 
        });
      }
    }
    
    // Store the JWT token in Supabase
    const { error } = await supabase
      .from('jwt_tokens')
      .upsert({ 
        platform: 'paradex',
        token,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'platform'
      });
      
    if (error) {
      logSupabaseError(error, 'saving JWT token');
      throw error;
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving JWT token:', error);
    return res.status(500).json({ 
      error: 'An error occurred while saving the JWT token. Please check the server logs for more details.',
      details: error.message
    });
  }
}