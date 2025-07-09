const { fetchOrders } = require('../services/foodicsService');
const { createSalesOrder } = require('../services/netsuiteService');
const { mapOrderToNetSuite } = require('../utils/mapper');
const { getAuthHeader } = require('../utils/oauth1a');
const axios = require('axios');

const syncData = async (req, res) => {
  try {
    const orders = await fetchOrders();
    console.log(orders);
    if (!orders.length) {
      return res.status(200).json({ status: 'success', message: 'No orders to sync' });
    }

    let synced = 0;

    for (const order of orders) {
      try {
        const mappedOrder = mapOrderToNetSuite(order);
        await createSalesOrder(mappedOrder);
        synced++;
        console.log(`✅ Synced order: ${order.reference || order.id}`);
      } catch (err) {
        console.error(`❌ Failed to sync order ${order.reference || order.id}:`, err.message);
      }
    }

    res.json({ status: 'success', synced_orders: synced, total: orders.length });

  } catch (err) {
    console.error('❌ Sync error:', err.message);
    res.status(500).json({ status: 'fail', error: err.message });
  }
};

const syncNetSuiteProducts = async (req, res) => {
  try {
    const accountId = process.env.NETSUITE_ACCOUNT_ID;
    if (!accountId) throw new Error('Missing NETSUITE_ACCOUNT_ID in env');

    const url = `https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/inventoryItem`;
    const headers = getAuthHeader('GET', url);

    const response = await axios.get(url, { headers });

    res.status(200).json(response.data);

  } catch (err) {
    console.error('❌ NetSuite sync error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to sync with NetSuite',
      details: err.response?.data || err.message,
    });
  }
};

const FOODICS_API = 'https://api.foodics.com/v5/customers';
const NETSUITE_API = 'https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/customer';

const fetchFoodicsCustomers = async () => {
  const res = await axios.get(FOODICS_API, {
    headers: {
      Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MGQ1YTcxOC1lMzBkLTQ5ODYtODY0Ni0wNjdlZDBkMzdkMGUiLCJqdGkiOiI5ODJkMWNmNjkxZTFjZDZjMDQwMjM2NWI0ODMzNTVjOTM4YTg1MzhkYjk5N2I2OWJiOGVmYWI4NjA2ODY4MmE1MGQyODk0YzcwMzNiMmMzYiIsImlhdCI6MTc1MTM3OTM5My41MDY2NjEsIm5iZiI6MTc1MTM3OTM5My41MDY2NjEsImV4cCI6MTkwOTE0NTc5My40Nzg1MDksInN1YiI6IjllODIzMzI1LWI1YjYtNDQ3Mi1iZDQwLTNmNWY4ODIyNjMyZiIsInNjb3BlcyI6WyJnZW5lcmFsLnJlYWQiLCJpbnZlbnRvcnkudHJhbnNhY3Rpb25zLnJlYWQiLCJjdXN0b21lcnMubGlzdCIsIm1lbnUuaW5ncmVkaWVudHMucmVhZCIsImludmVudG9yeS5zZXR0aW5ncy5yZWFkIiwib3JkZXJzLmxpc3QiXSwiYnVzaW5lc3MiOiI5ZTgyMzMyNS1jNzAzLTQzNDctYTg4My01NjE1MThkYzRlYjciLCJyZWZlcmVuY2UiOiIzMzQ5ODIifQ.s0Go6UrbTpWf_N4FCMk-KoGSeqIDpip6BttD3PofA8fWjvHX6t8Z5y1nuBkHhfLcB0Bmgqwz-JsSy7yNJ4HIyURy0cGQA3yUmZO74ui1DGNTgLdkPoEQOGRXJxz65adVjiNTPM0jibwhbK0b6GvFgBrwS41tWZNIUNKPKcXn3DBzc1j-QKd6Xnf7u0MnzwpkUddlwajSJ6VrjatULXFGVZlnIBTlajYTsD-OH-d-IbMK8O7UcQlRGbGbhOf9fLb7VFoUeuPjU_uZHbeIcJhuSFZU5P8AJSU4NQziCXbOK5DniM-fyf9xk5_Ki2wDfeHd8EK9DqGh41-5ymByJHxLhBd6ZikPGJdG6PJimmYZY8wSddCn1jZO3e4zDyS_-vNdafqYt-FZQOWD3R7xsFx1jvFWMn_IgRjXyPSOROZQQXcVPnexO4fNL7quFQXhOFCw-fPdn85m0EnZtprUbB2x4qKVTn7Q0_hM0Ogm_PUoc5WwOMYqxGHxEwoDqtdD9-C4tTixWxWa_5UlKIiv8qhcF8ld3kI4MBA_xBf1ay3nPz2ZZSwyfDk10qLnriVGALIHBv6URLPbAC_Bs5NAt39x230NRFGphsiOuoM6jF9Fq3tQM--buxUVIusXI13s2T2OL_O-TqC6iA6inRgNz4SaWnJVb9LSLXaxdD4Qv1H93O8`
    }
  });
  return res.data.data;
};

const findNetSuiteCustomer = async (name, phone) => {
  const query = encodeURIComponent(`(firstName IS "${name}" OR phone IS "${phone}")`);
  const url = `${NETSUITE_API}?q=${query}`;
  const res = await axios.get(url, { headers: getAuthHeader('GET', url) });
  return res.data.count > 0;
};



const createNetSuiteCustomer = async (customer) => {
  const url = NETSUITE_API;
  const phone = customer.phone || "00000000";

  const payload = {
    isPerson: true,
    firstName: customer.name || "Unknown",
    lastName: "-",
    email: customer.email || "noemail@demo.com",
    phone: phone,
    mobilePhone: phone,
    subsidiary: {
      id: "30",
      recordType: "subsidiary"
    },
    receivablesAccount: {
      id: "122", 
      recordType: "account"
    }
  };

  console.log('📦 Payload to NetSuite:', JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(url, payload, {
      headers: {
        ...getAuthHeader('POST', url),
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (err) {
    console.error('❌ NetSuite API Error:', err.response?.data || err.message);
    throw err;
  }
};



const syncCustomers = async () => {
  const customers = await fetchFoodicsCustomers();
  for (const cust of customers) {
    const phone = cust.phone || "00000000";
    const exists = await findNetSuiteCustomer(cust.name);

    if (!exists) {
      console.log('Creating new customer:', cust.name);
      await createNetSuiteCustomer(cust);
    } else {
      console.log('Already exists:', cust.name,'and phone number',cust.phone);
    }
  }
};
//-------------------------------------------------
// ✅ Your list of Foodics customers with name & phone
const foodicsCustomers = [
  { name: 'Ahmad', phone: '99887766' },
  { name: 'Mohamed ebrahim', phone: '65936366' },
  { name: 'Mahmoud', phone: '50715926' },
  { name: 'Rs', phone: '93333191' },
  { name: 'Mohammad vasim', phone: '94966890' },
  { name: 'Abdullah', phone: '55993500' },
  { name: 'Abwahab', phone: '66113390' },
  { name: 'Mb', phone: '66733335' },
  { name: 'Am at', phone: '99005579' },
  { name: 'Danna', phone: '65998879' },
  { name: 'Batool', phone: '55550509' },
  { name: 'Nnn', phone: '96000050' },
  { name: 'Jaya Al Majed', phone: '90927749' },
  { name: 'Bibs', phone: '97600169' },
  { name: 'Galiya', phone: '62223782' },
  { name: 'Salem', phone: '66829140' },
  { name: 'Mona', phone: '99601088' },
  { name: 'Bibs', phone: '99013733' },
  { name: 'Raman', phone: '99719481' },
  { name: 'Dhuda', phone: '99908606' },
  { name: 'Haneen', phone: '98818857' },
  { name: 'Jana aloraifan', phone: '55605700' },
  { name: 'Fahad', phone: '99621868' },
  { name: 'Jay', phone: '92272990' },
  { name: 'Celine', phone: '97511013' },
  { name: 'Khadeejah', phone: '99829959' },
  { name: 'Shout Alali', phone: '60069099' },
  { name: 'Waist', phone: '99242341' },
  { name: 'Customer', phone: '65866964' },
  { name: 'Doha', phone: '50071377' },
  { name: 'Athari', phone: '65610655' },
  { name: 'Ahmad', phone: '50744407' },
  { name: 'Ahm', phone: '60420327' },
  { name: 'Shaimaa', phone: '99228884' },
  { name: 'Abdulaziz Al Ali', phone: '97308733' },
  { name: 'Mariah', phone: '99775124' },
  { name: 'Rama', phone: '61114748' },
  { name: 'Lulu', phone: '95566789' },
  { name: 'Fatima', phone: '66223299' },
  { name: 'Fadhel', phone: '50339666' },
  { name: 'Abdullah Alwtaid', phone: '90914779' },
  { name: 'Shaimaa Alkhashram', phone: '99429042' },
  { name: 'Tareq', phone: '96676969' },
  { name: 'Faisal', phone: '97499799' },
  { name: 'Dalal', phone: '55330386' },
  { name: 'Ahmed khajah', phone: '99765805' },
  { name: 'Abdul salam', phone: '94441323' },
  { name: 'Abdulwahab Ali', phone: '97857512' },
  { name: 'Meshari', phone: '94977720' },
];

const deactivateCustomer = async (name, phone) => {
  const query = encodeURIComponent(`companyName IS "${name}" AND phone IS "${phone}"`);
  const url = `${NETSUITE_API}?q=${query}`;

  try {
    const res = await axios.get(url, { headers: getAuthHeader('GET', url) });

    if (!res.data.count) {
      console.log(`❌ Not found: ${name} / ${phone}`);
      return;
    }

    for (const item of res.data.items) {
      const customerId = item.id;
      const patchUrl = `https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/customer/${customerId}`;

      await axios.patch(patchUrl, { isInactive: false }, {
        headers: {
          ...getAuthHeader('PATCH', patchUrl),
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Deactivated: ${name} / ${phone} (ID: ${customerId})`);
    }
  } catch (err) {
    console.error(`❌ Failed for ${name} / ${phone}:`, err.response?.data || err.message);
  }
};

const run = async () => {
  for (const customer of foodicsCustomers) {
    await deactivateCustomer(customer.name, customer.phone);
  }
};


//-----------------------------------------
const updateNetSuiteCustomers = async () => {
  for (const customer of foodicsCustomers) {
    try {
      const query = encodeURIComponent(`companyName IS "${customer.name}" AND phone IS "${customer.phone}"`);
      const url = `https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/customer?q=${query}`;
      const res = await axios.get(url, { headers: getAuthHeader('GET', url) });

      if (res.data.count > 0) {
        const customerId = res.data.items[0].id;
        const patchUrl = `https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/customer/${customerId}`;

        const firstName = customer.name;
        const lastName = '_';

        await axios.patch(patchUrl, {
          isPerson: true,
          firstName,
          lastName,
          subsidiary: { id: "30", recordType: "subsidiary" },
          receivablesAccount: { id: "122", recordType: "account" }
        }, {
          headers: {
            ...getAuthHeader('PATCH', patchUrl),
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Updated: ${customer.name} (${customer.phone})`);
      } else {
        console.log(`❌ Not found: ${customer.name} (${customer.phone})`);
      }
    } catch (err) {
      console.error(`❌ Error for ${customer.name} (${customer.phone}):`, err.response?.data || err.message);
    }
  }
};
//--------------------------------------------------------------------------------------------------


const FOODICS_PRODUCTS_API = 'https://api.foodics.com/v5/products';
const NETSUITE_ITEMS_API = 'https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/inventoryItem';

const fetchFoodicsProducts = async () => {
  const res = await axios.get(FOODICS_PRODUCTS_API, {
    headers: {
      Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MGQ1YTcxOC1lMzBkLTQ5ODYtODY0Ni0wNjdlZDBkMzdkMGUiLCJqdGkiOiI5ODJkMWNmNjkxZTFjZDZjMDQwMjM2NWI0ODMzNTVjOTM4YTg1MzhkYjk5N2I2OWJiOGVmYWI4NjA2ODY4MmE1MGQyODk0YzcwMzNiMmMzYiIsImlhdCI6MTc1MTM3OTM5My41MDY2NjEsIm5iZiI6MTc1MTM3OTM5My41MDY2NjEsImV4cCI6MTkwOTE0NTc5My40Nzg1MDksInN1YiI6IjllODIzMzI1LWI1YjYtNDQ3Mi1iZDQwLTNmNWY4ODIyNjMyZiIsInNjb3BlcyI6WyJnZW5lcmFsLnJlYWQiLCJpbnZlbnRvcnkudHJhbnNhY3Rpb25zLnJlYWQiLCJjdXN0b21lcnMubGlzdCIsIm1lbnUuaW5ncmVkaWVudHMucmVhZCIsImludmVudG9yeS5zZXR0aW5ncy5yZWFkIiwib3JkZXJzLmxpc3QiXSwiYnVzaW5lc3MiOiI5ZTgyMzMyNS1jNzAzLTQzNDctYTg4My01NjE1MThkYzRlYjciLCJyZWZlcmVuY2UiOiIzMzQ5ODIifQ.s0Go6UrbTpWf_N4FCMk-KoGSeqIDpip6BttD3PofA8fWjvHX6t8Z5y1nuBkHhfLcB0Bmgqwz-JsSy7yNJ4HIyURy0cGQA3yUmZO74ui1DGNTgLdkPoEQOGRXJxz65adVjiNTPM0jibwhbK0b6GvFgBrwS41tWZNIUNKPKcXn3DBzc1j-QKd6Xnf7u0MnzwpkUddlwajSJ6VrjatULXFGVZlnIBTlajYTsD-OH-d-IbMK8O7UcQlRGbGbhOf9fLb7VFoUeuPjU_uZHbeIcJhuSFZU5P8AJSU4NQziCXbOK5DniM-fyf9xk5_Ki2wDfeHd8EK9DqGh41-5ymByJHxLhBd6ZikPGJdG6PJimmYZY8wSddCn1jZO3e4zDyS_-vNdafqYt-FZQOWD3R7xsFx1jvFWMn_IgRjXyPSOROZQQXcVPnexO4fNL7quFQXhOFCw-fPdn85m0EnZtprUbB2x4qKVTn7Q0_hM0Ogm_PUoc5WwOMYqxGHxEwoDqtdD9-C4tTixWxWa_5UlKIiv8qhcF8ld3kI4MBA_xBf1ay3nPz2ZZSwyfDk10qLnriVGALIHBv6URLPbAC_Bs5NAt39x230NRFGphsiOuoM6jF9Fq3tQM--buxUVIusXI13s2T2OL_O-TqC6iA6inRgNz4SaWnJVb9LSLXaxdD4Qv1H93O8`
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

    incomeAccount: {
      id: '2208', 
      recordType: 'account'
    },
    costOfGoodsSoldAccount: {
      id: '2209', 
      recordType: 'account'
    },
    assetAccount: {
      id: '2211', 
      recordType: 'account'
    },

    subsidiary: [
      {
        id: '30', 
        recordType: 'subsidiary'
      }
    ],

    rate: product.price || 0,          
    basePrice: product.price || 0,     // Required for pricing
    cost: product.cost || 0,           // Optional

    unitsType: {
      id: '1',                          // Usually "Each" → confirm from NetSuite
      recordType: 'unitstype'
    },
    location: {
      id: '217',                          // Inventory location
      recordType: 'location'
    },

    salesDescription: `Foodics synced: ${product.name}`,
    purchaseDescription: `Imported from Foodics`,
    custitem_foodics_id: product.id    // Custom field (if configured in NetSuite)
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




module.exports = {
  syncData,
  syncNetSuiteProducts,
  syncCustomers,
  run,
  syncFoodicsProductsToNetSuite,
  updateNetSuiteCustomers
};
