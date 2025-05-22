import { supabase, logSupabaseError } from '../../lib/supabase';
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
    
    // Calculate date range (last 730 days / 2 years)
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 730);
    
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
      // Check if the historical_volume table exists
      const { error: tableCheckError } = await supabase
        .from('historical_volume')
        .select('count')
        .limit(1);
        
      if (tableCheckError) {
        if (tableCheckError.code === '42P01') { // Table doesn't exist
          logSupabaseError(tableCheckError, 'checking historical_volume table');
          console.warn('The historical_volume table does not exist in the database. Please set up your Supabase tables as described in the README.');
        } else {
          logSupabaseError(tableCheckError, 'checking historical_volume table');
        }
      } else {
        // Table exists, store the data
        const [wooxResult, paradexResult] = await Promise.all([
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
        
        if (wooxResult.error) {
          logSupabaseError(wooxResult.error, 'storing WooX volume data');
        }
        
        if (paradexResult.error) {
          logSupabaseError(paradexResult.error, 'storing Paradex volume data');
        }
      }
    } catch (storageError) {
      console.error('Failed to store volume data:', storageError);
      
      // Continue without storing - we'll still return the current data
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