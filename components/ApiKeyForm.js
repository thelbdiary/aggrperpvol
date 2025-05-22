import React, { useState } from 'react';
import axios from 'axios';

const ApiKeyForm = ({ onApiKeySaved }) => {
  const [formData, setFormData] = useState({
    platform: 'woox',
    api_key: '',
    api_secret: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.api_key.trim() || !formData.api_secret.trim()) {
      setError('API key and API secret are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/api-keys', formData);
      
      if (response.data.success) {
        setSuccess(`${formData.platform.toUpperCase()} API key saved successfully`);
        setFormData(prev => ({
          ...prev,
          api_key: '',
          api_secret: ''
        }));
        if (onApiKeySaved) {
          onApiKeySaved();
        }
      } else {
        setError('Failed to save API key');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while saving the API key');
      console.error('API key save error:', error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="api-key-section">
      <h2>Exchange API Keys</h2>
      <p>
        Enter your exchange API keys to access your trading volume data.
        Currently supporting WooX exchange.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="platform">Exchange</label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="woox">WooX</option>
            {/* <option value="paradex">Paradex</option> */}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="api_key">API Key</label>
          <input
            type="text"
            id="api_key"
            name="api_key"
            placeholder="Enter your API key"
            value={formData.api_key}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="api_secret">API Secret</label>
          <input
            type="password"
            id="api_secret"
            name="api_secret"
            placeholder="Enter your API secret"
            value={formData.api_secret}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save API Key'}
        </button>
      </form>
    </div>
  );
};

export default ApiKeyForm;