const axios = require('axios');
const { getAuthHeader } = require('./utils/oauth1a');

const FOODICS_PRODUCTS_API = 'https://api.foodics.com/v5/products';
const NETSUITE_ITEMS_API = 'https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/inventoryItem';

const fetchFoodicsProducts = async () => {
  const res = await axios.get(FOODICS_PRODUCTS_API, {
    headers: {
      Authorization: `Bearer YOUR_FOODICS_ACCESS_TOKEN_HERE`
    }
  });
  return res.data.data;
};

const createNetSuiteItem = async (product) => {
  const payload = {
    itemId: product.name.substring(0, 60),
    displayName: product.name,
    description: product.description || product.name,
    isInactive: false,
    isTaxable: true,
    incomeAccount: { id: '2208', recordType: 'account' },
    expenseAccount: { id: '2209', recordType: 'account' },
    subsidiary: [ { id: '30', recordType: 'subsidiary' } ],
    rate: product.price || 0,
    custitem_foodics_id: product.id
  };

  try {
    const res = await axios.post(NETSUITE_ITEMS_API, payload, {
      headers: {
        ...getAuthHeader('POST', NETSUITE_ITEMS_API),
        'Content-Type': 'application/json'
      }
    });
    const netsuiteId = res.data.id;
    console.log(`"${product.id}": "${netsuiteId}",`);
    return res.data;
  } catch (err) {
    console.error(`❌ Failed to create item: ${product.name}`, err.response?.data || err.message);
  }
};

const syncFoodicsProductsToNetSuite = async () => {
  try {
    const products = await fetchFoodicsProducts();
    console.log('✅ Mapping of Foodics Product ID -> NetSuite Item ID');
    for (const product of products) {
      await createNetSuiteItem(product);
    }
  } catch (err) {
    console.error('❌ Product sync error:', err.message);
  }
};

syncFoodicsProductsToNetSuite();
