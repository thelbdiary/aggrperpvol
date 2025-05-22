import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const chartData = {
    labels: volumeData.woox.history.map(item => 
      new Date(item.timestamp).toLocaleDateString()
    ).reverse(),
    datasets: [
      {
        label: 'WooX Volume (USD)',
        data: volumeData.woox.history.map(item => item.volume_usd).reverse(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Paradex Volume (USD)',
        data: volumeData.paradex.history.map(item => item.volume_usd).reverse(),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="container">
      <h1>Aggregate Perpetual Volume Dashboard</h1>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      <div className="jwt-section">
        <h2>Paradex JWT Token</h2>
        <textarea 
          value={jwtToken}
          onChange={(e) => setJwtToken(e.target.value)}
          placeholder="Enter your Paradex JWT token here"
          rows={4}
        />
        <button onClick={saveJwtToken}>Save JWT Token</button>
      </div>
      
      <div className="volume-summary">
        <div className="volume-card">
          <h3>WooX Total Volume</h3>
          <p className="volume-value">${volumeData.woox.totalVolume.toLocaleString()}</p>
        </div>
        
        <div className="volume-card">
          <h3>Paradex Total Volume</h3>
          <p className="volume-value">${volumeData.paradex.totalVolume.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="chart-container">
        <h2>Historical Volume</h2>
        <Line data={chartData} />
      </div>
      
      <div className="actions">
        <button 
          onClick={fetchVolumeData} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Volume Data'}
        </button>
      </div>
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .jwt-section {
          margin-bottom: 30px;
        }
        
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-family: monospace;
        }
        
        button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        button:hover {
          background-color: #0051a8;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .volume-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .volume-card {
          flex: 1;
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin: 0 10px;
          text-align: center;
        }
        
        .volume-value {
          font-size: 24px;
          font-weight: bold;
          color: #0070f3;
        }
        
        .chart-container {
          margin-bottom: 30px;
        }
        
        .actions {
          text-align: center;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}