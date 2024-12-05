import axios from 'axios';

const API_KEY = process.env.REACT_APP_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export const fetchStockMetrics = async (symbol) => {
  try {
    const response = await axios.get(`${BASE_URL}/stock/metric`, {
      params: {
        symbol: symbol,
        metric: 'all',
        token: API_KEY,
      },
    });
    const metrics = response.data.metric;
    console.log(metrics);
    console.log(metrics.marketCapitalization);

    if (!metrics) {
      console.error('Metrics data missing:', response.data);
      return {};
    }

    return {
      marketCap: metrics.marketCapitalization || 'N/A',
      peRatio: metrics.peTTM || 'N/A',
      eps: metrics.epsTTM || 'N/A',
      dividendYield: metrics.currentDividendYieldTTM || 'N/A',
    };
  } catch (error) {
    console.error('Error fetching stock metrics:', error);
    return null;
  }
};

export const fetchStockHistory = async (symbol) => {
  const oneYearAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
  const today = Math.floor(Date.now() / 1000);

  try {
    const response = await axios.get(`${BASE_URL}/stock/candle`, {
      params: {
        symbol: symbol,
        resolution: 'D',
        from: oneYearAgo,
        to: today,
        token: API_KEY,
      },
    });

    if (response.data.s !== 'ok') {
      console.error('Historical data error:', response.data);
      return null;
    }

    return {
      dates: response.data.t.map((timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString()
      ),
      prices: response.data.c,
    };
  } catch (error) {
    console.error('Error fetching stock history:', error);
    // Return dummy data in case of an error (e.g., 403 Forbidden)
    return {
      dates: [
        '2023-12-01', '2023-12-02', '2023-12-03', '2023-12-04', '2023-12-05',
        '2023-12-06', '2023-12-07', '2023-12-08', '2023-12-09', '2023-12-10'
      ],
      prices: [150, 155, 160, 162, 158, 159, 157, 160, 164, 168], // Dummy prices
    };
  }
};



export const fetchRelatedNews = async (symbol) => {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 1); // Set from date to 7 days ago

  // Format dates in YYYY-MM-DD format
  const from = fromDate.toISOString().split('T')[0];
  const to = today.toISOString().split('T')[0];

  try {
    const response = await axios.get(`${BASE_URL}/company-news`, {
      params: {
        symbol: symbol,
        from: from,
        to: to,
        token: API_KEY,
      },
    });

    console.log(response);

    if (!response.data || !response.data.length) {
      throw new Error('No news available');
    }

    return response.data.slice(0,5);
  } catch (error) {
    console.error('Error fetching related news:', error);
    return []
  }
};