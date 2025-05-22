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
    
    // Initialize connectors with fallback for missing credentials
    let wooxConnector;
    let paradexConnector;
    
    if (wooxError || !wooxKeys) {
      console.warn('WooX API keys not found, using fallback credentials');
      // Use the provided WooX credentials from the user
      wooxConnector = new WooXConnector('1VH4jswjYDOf2ZdE2JsxrQ==', '2IEEY77I72T2MB5RPO3DRVIN7JBQ');
    } else {
      wooxConnector = new WooXConnector(wooxKeys.api_key, wooxKeys.api_secret);
    }
    
    if (jwtError || !jwtData || !jwtData.token) {
      console.warn('Paradex JWT token not found, using fallback token');
      // Use a dummy token - the connector will fall back to public data
      paradexConnector = new ParadexConnector('dummy_token');
    } else {
      paradexConnector = new ParadexConnector(jwtData.token);
    }
    
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
    let volumeHistory = [];
    try {
      const { data, error } = await supabase
        .from('historical_volume')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
        
      if (error) {
        console.warn('Error fetching historical volume data:', error);
        // Continue with empty history
      } else if (data) {
        volumeHistory = data;
      }
    } catch (historyError) {
      console.warn('Failed to fetch historical data:', historyError.message);
      // Continue with empty history
    }
    
    // Store current volume data in Supabase
    const timestamp = new Date().toISOString();
    
    try {
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
    } catch (storageError) {
      // If table doesn't exist yet, create it
      console.warn('Failed to store volume data, table might not exist:', storageError.message);
      
      // Continue without storing - we'll still return the current data
      // In a production app, we would create the table here
    }
    
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
        ],
        source: wooxVolumeData.source || 'unknown'
      },
      paradex: {
        totalVolume: paradexVolume,
        history: [
          { platform: 'paradex', volume_usd: paradexVolume, timestamp },
          ...paradexHistory
        ],
        source: paradexVolumeData.source || 'unknown'
      }
    });
  } catch (error) {
    console.error('Error in volume API:', error);
    return res.status(500).json({ error: error.message });
  }
}