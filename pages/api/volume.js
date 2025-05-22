import { supabase } from '../../lib/supabase';
import WooXConnector from '../../lib/wooxConnector';
import ParadexConnector from '../../lib/paradexConnector';

export default async function handler(req, res) {
  try {
    // Get API keys from Supabase
    const { data: wooxKeys, error: wooxError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('platform', 'woox')
      .single();
      
    const { data: jwtData, error: jwtError } = await supabase
      .from('jwt_tokens')
      .select('*')
      .eq('platform', 'paradex')
      .single();
      
    if (wooxError) {
      console.error('Error fetching WooX API keys:', wooxError);
      return res.status(500).json({ error: 'Failed to fetch WooX API keys' });
    }
    
    if (jwtError) {
      console.error('Error fetching Paradex JWT token:', jwtError);
      return res.status(500).json({ error: 'Failed to fetch Paradex JWT token' });
    }
    
    // Initialize connectors
    const wooxConnector = new WooXConnector(wooxKeys.api_key, wooxKeys.api_secret);
    const paradexConnector = new ParadexConnector(jwtData.token);
    
    // Calculate date range (last 30 days)
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30);
    
    // Fetch volume data
    const [wooxVolumeData, paradexVolumeData] = await Promise.all([
      wooxConnector.getHistoricalVolume(startTime.getTime(), endTime.getTime()),
      paradexConnector.getHistoricalVolume(startTime.toISOString(), endTime.toISOString())
    ]);
    
    // Process and store volume data
    const wooxVolume = wooxVolumeData.totalVolume;
    const paradexVolume = paradexVolumeData.totalVolume;
    
    // Get historical volume data from Supabase
    const { data: volumeHistory, error: volumeError } = await supabase
      .from('historical_volume')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
      
    if (volumeError) {
      console.error('Error fetching historical volume data:', volumeError);
      return res.status(500).json({ error: 'Failed to fetch historical volume data' });
    }
    
    // Store current volume data in Supabase
    const timestamp = new Date().toISOString();
    
    await Promise.all([
      supabase.from('historical_volume').insert({
        platform: 'woox',
        volume_usd: wooxVolume,
        timestamp
      }),
      supabase.from('historical_volume').insert({
        platform: 'paradex',
        volume_usd: paradexVolume,
        timestamp
      })
    ]);
    
    // Filter and format historical data
    const wooxHistory = volumeHistory.filter(item => item.platform === 'woox');
    const paradexHistory = volumeHistory.filter(item => item.platform === 'paradex');
    
    // Return the volume data
    return res.status(200).json({
      woox: {
        totalVolume: wooxVolume,
        history: [
          { platform: 'woox', volume_usd: wooxVolume, timestamp },
          ...wooxHistory
        ]
      },
      paradex: {
        totalVolume: paradexVolume,
        history: [
          { platform: 'paradex', volume_usd: paradexVolume, timestamp },
          ...paradexHistory
        ]
      }
    });
  } catch (error) {
    console.error('Error in volume API:', error);
    return res.status(500).json({ error: error.message });
  }
}