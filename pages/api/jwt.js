import { supabase, logSupabaseError } from '../../lib/supabase';
import jwt from 'jsonwebtoken';

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
    
    // Basic validation of the JWT token format
    try {
      // Just decode the token to check its structure, don't verify signature
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded || !decoded.header || !decoded.payload) {
        return res.status(400).json({ 
          error: 'Invalid JWT token format',
          details: 'The token does not appear to be a valid JWT'
        });
      }
      
      // Check if it has basic JWT properties
      if (!decoded.payload.exp) {
        console.warn('JWT token does not have an expiration claim');
        // Continue anyway, just a warning
      }
      
      console.log('JWT token validated successfully');
    } catch (jwtError) {
      console.error('JWT validation error:', jwtError);
      return res.status(400).json({ 
        error: 'Invalid JWT token',
        details: jwtError.message
      });
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
    
    // First check if a record with platform='paradex' already exists
    const { data: existingToken, error: fetchError } = await supabase
      .from('jwt_tokens')
      .select('id')
      .eq('platform', 'paradex')
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
      logSupabaseError(fetchError, 'checking for existing JWT token');
      throw fetchError;
    }
    
    let error;
    
    if (existingToken) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('jwt_tokens')
        .update({ 
          token,
          created_at: new Date().toISOString()
        })
        .eq('id', existingToken.id);
        
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('jwt_tokens')
        .insert({ 
          platform: 'paradex',
          token,
          created_at: new Date().toISOString()
        });
        
      error = insertError;
    }
      
    if (error) {
      logSupabaseError(error, 'saving JWT token');
      throw error;
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving JWT token:', error);
    
    // Check for specific error types
    if (error.code === '23505') {
      // Unique violation error
      return res.status(400).json({ 
        error: 'A JWT token for Paradex already exists',
        details: 'Please use the update functionality instead of creating a new record'
      });
    } else if (error.code === '42P01') {
      // Table doesn't exist
      return res.status(500).json({ 
        error: 'The jwt_tokens table does not exist in the database',
        details: 'Please set up your Supabase tables as described in the README'
      });
    } else if (error.message && error.message.includes('unique constraint')) {
      // Another unique constraint error
      return res.status(400).json({ 
        error: 'A JWT token for Paradex already exists',
        details: 'Please use the update functionality instead of creating a new record'
      });
    } else if (error.message && error.message.includes('JWT')) {
      // JWT validation error
      return res.status(400).json({ 
        error: 'Invalid JWT token format',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: 'An error occurred while saving the JWT token',
      details: error.message
    });
  }
}