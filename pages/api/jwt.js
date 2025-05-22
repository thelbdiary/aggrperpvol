import { supabase } from '../../lib/supabase';

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
    
    // Store the JWT token in Supabase
    const { error } = await supabase
      .from('jwt_tokens')
      .upsert({ 
        platform: 'paradex',
        token,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      throw error;
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving JWT token:', error);
    return res.status(500).json({ error: error.message });
  }
}