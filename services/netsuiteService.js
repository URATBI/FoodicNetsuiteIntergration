const axios = require('axios');
const { getAuthHeader } = require('../utils/oauth1a');



const axiosRetry = require('axios-retry').default; 


const NETSUITE_ACCOUNT_ID = process.env.NETSUITE_ACCOUNT_ID;

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
});

const createSalesOrder = async (orderPayload) => {
  const url = `https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/salesOrder`;

  try {
    console.log("📤 Creating Sales Order in NetSuite...");
    console.log('📦 Payload:', JSON.stringify(orderPayload, null, 2));

    if (!orderPayload.entity?.id || !orderPayload.item?.length) {
      throw new Error("❌ Invalid Sales Order Payload: missing customer or items");
    }

    const headers = getAuthHeader('POST', url);
    headers['Content-Type'] = 'application/json';

    const response = await axios.post(url, orderPayload, {
      headers,
      timeout: 10000
    });

    console.log('✅ Sales Order Created:', response.data);
    return response.data;

  } catch (err) {
    console.error('❌ NetSuite API error:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { createSalesOrder };
