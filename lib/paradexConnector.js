import axios from 'axios';

export default class ParadexConnector {
  constructor(jwtToken) {
    this.jwtToken = jwtToken;
    this.baseUrl = 'https://api.prod.paradex.trade/v1';
  }

  async getMarketData() {
    try {
      const response = await axios.get(`${this.baseUrl}/markets/summary?market=ALL`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Paradex market data:', error);
      throw error;
    }
  }

  async getHistoricalVolume(startTime, endTime) {
    try {
      const params = {
        start_at: startTime,
        end_at: endTime,
        page_size: 100
      };
      
      const response = await axios.get(`${this.baseUrl}/account/list-fills`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Calculate total volume from fills
      let totalVolume = 0;
      const fills = response.data.results || [];
      
      for (const fill of fills) {
        const price = parseFloat(fill.price || 0);
        const size = parseFloat(fill.size || 0);
        totalVolume += price * size;
      }
      
      return {
        totalVolume,
        fills,
        rawData: response.data
      };
    } catch (error) {
      console.error('Error fetching Paradex historical volume:', error);
      throw error;
    }
  }
}