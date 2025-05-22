import axios from 'axios';
import crypto from 'crypto';

export default class WooXConnector {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.woo.org';
  }

  generateSignature(params) {
    const queryString = new URLSearchParams(params).toString();
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  async getMarketData() {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/public/info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WooX market data:', error);
      throw error;
    }
  }

  async getHistoricalVolume(startTime, endTime) {
    try {
      const timestamp = Date.now();
      const params = {
        timestamp,
        start_time: Math.floor(startTime / 1000),
        end_time: Math.floor(endTime / 1000),
      };
      
      const signature = this.generateSignature(params);
      
      const headers = {
        'x-api-key': this.apiKey,
        'x-api-signature': signature,
      };
      
      const url = `${this.baseUrl}/v1/client/trades?${new URLSearchParams(params).toString()}`;
      
      const response = await axios.get(url, { headers });
      
      // Calculate total volume from trades
      let totalVolume = 0;
      const trades = response.data.rows || [];
      
      for (const trade of trades) {
        const price = parseFloat(trade.executed_price || 0);
        const size = parseFloat(trade.executed_quantity || 0);
        totalVolume += price * size;
      }
      
      return {
        totalVolume,
        trades,
        rawData: response.data
      };
    } catch (error) {
      console.error('Error fetching WooX historical volume:', error);
      throw error;
    }
  }
}