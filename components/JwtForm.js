import React, { useState } from 'react';
import axios from 'axios';

const JwtForm = ({ onJwtSaved }) => {
  const [jwtToken, setJwtToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jwtToken.trim()) {
      setError('Please enter a JWT token');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/jwt', { token: jwtToken });
      
      if (response.data.success) {
        setSuccess('JWT token saved successfully');
        setJwtToken('');
        if (onJwtSaved) {
          onJwtSaved();
        }
      } else {
        setError('Failed to save JWT token');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while saving the JWT token');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="jwt-section">
      <h2>Paradex JWT Token</h2>
      <p>
        Enter your Paradex JWT token to access your trading volume data.
        You can generate a token using the script in the repository.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <textarea
          rows="5"
          placeholder="Paste your JWT token here"
          value={jwtToken}
          onChange={(e) => setJwtToken(e.target.value)}
          disabled={isSubmitting}
        />
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save JWT Token'}
        </button>
      </form>
    </div>
  );
};

export default JwtForm;