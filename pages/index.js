import Head from 'next/head';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import VolumeChart from '../components/VolumeChart';
import JwtForm from '../components/JwtForm';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volumeData, setVolumeData] = useState({
    woox: { totalVolume: 0, history: [] },
    paradex: { totalVolume: 0, history: [] }
  });
  const [jwtToken, setJwtToken] = useState('');
  const [apiKeys, setApiKeys] = useState({
    woox: { key: '', secret: '' },
    paradex: { l2Address: '', l2PrivateKey: '' }
  });

  useEffect(() => {
    // Load API keys from Supabase
    async function loadApiKeys() {
      try {
        setLoading(true);
        
        const { data: wooxKeys, error: wooxError } = await supabase
          .from('api_keys')
          .select('*')
          .eq('platform', 'woox')
          .single();
          
        const { data: paradexKeys, error: paradexError } = await supabase
          .from('api_keys')
          .select('*')
          .eq('platform', 'paradex')
          .single();
          
        if (wooxError) console.error('Error loading WooX keys:', wooxError);
        if (paradexError) console.error('Error loading Paradex keys:', paradexError);
        
        if (wooxKeys) {
          setApiKeys(prev => ({
            ...prev,
            woox: { key: wooxKeys.api_key, secret: wooxKeys.api_secret }
          }));
        }
        
        if (paradexKeys) {
          setApiKeys(prev => ({
            ...prev,
            paradex: { 
              l2Address: paradexKeys.l2_address, 
              l2PrivateKey: paradexKeys.l2_private_key 
            }
          }));
        }
        
        // Load JWT token from Supabase
        const { data: jwtData, error: jwtError } = await supabase
          .from('jwt_tokens')
          .select('*')
          .eq('platform', 'paradex')
          .single();
          
        if (jwtError) console.error('Error loading JWT token:', jwtError);
        
        if (jwtData) {
          setJwtToken(jwtData.token);
        }
        
        // Load volume data from Supabase
        const { data: volumeHistory, error: volumeError } = await supabase
          .from('historical_volume')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
          
        if (volumeError) console.error('Error loading volume history:', volumeError);
        
        if (volumeHistory) {
          const wooxHistory = volumeHistory.filter(item => item.platform === 'woox');
          const paradexHistory = volumeHistory.filter(item => item.platform === 'paradex');
          
          setVolumeData({
            woox: { 
              totalVolume: wooxHistory.reduce((sum, item) => sum + item.volume_usd, 0),
              history: wooxHistory 
            },
            paradex: { 
              totalVolume: paradexHistory.reduce((sum, item) => sum + item.volume_usd, 0),
              history: paradexHistory 
            }
          });
        }
      } catch (err) {
        console.error('Error in loadApiKeys:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadApiKeys();
  }, []);

  const fetchVolumeData = async () => {
    try {
      setLoading(true);
      
      // Fetch volume data from API endpoints
      const response = await fetch('/api/volume');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setVolumeData(data);
    } catch (err) {
      console.error('Error fetching volume data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveJwtToken = async () => {
    try {
      const { error } = await supabase
        .from('jwt_tokens')
        .upsert({ 
          platform: 'paradex',
          token: jwtToken,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      alert('JWT token saved successfully!');
    } catch (err) {
      console.error('Error saving JWT token:', err);
      setError(err.message);
    }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container">
      <Head>
        <title>Aggregate Perpetual Volume</title>
        <meta name="description" content="Track trading volume from WooX and Paradex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Aggregate Perpetual Volume Dashboard</h1>
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
        
        <JwtForm onJwtSaved={fetchVolumeData} />
        
        {loading ? (
          <p>Loading volume data...</p>
        ) : (
          <div>
            <div className="volume-summary">
              <div className="volume-card">
                <h3>WooX Total Volume</h3>
                <p className="volume-value">{formatCurrency(volumeData.woox.totalVolume)}</p>
                {volumeData.woox.source && (
                  <div className="volume-source">
                    {volumeData.woox.source === 'authenticated' 
                      ? 'From authenticated API' 
                      : volumeData.woox.source === 'public' 
                        ? 'Estimated from public data'
                        : 'Fallback data'}
                  </div>
                )}
              </div>
              
              <div className="volume-card">
                <h3>Paradex Total Volume</h3>
                <p className="volume-value">{formatCurrency(volumeData.paradex.totalVolume)}</p>
                {volumeData.paradex.source && (
                  <div className="volume-source">
                    {volumeData.paradex.source === 'authenticated' 
                      ? 'From authenticated API' 
                      : volumeData.paradex.source === 'public' 
                        ? 'Estimated from public data'
                        : 'Fallback data'}
                  </div>
                )}
              </div>
            </div>
            
            <VolumeChart 
              wooxData={volumeData.woox} 
              paradexData={volumeData.paradex} 
            />
            
            <div className="actions">
              <button 
                onClick={fetchVolumeData} 
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Volume Data'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}