// Map of Foodics product IDs to NetSuite item IDs (you should maintain/update this map)
const productMap = {
  "9f51bfc9-ce58-491d-bb3a-3264beac5753": "48892",
  "9f51bfc9-cf3c-4fa6-b51a-6ddec1fbf8c5": "48893",
  "9f51bfc9-d0bf-411a-8df9-72c72c94484a": "48894",
  "9f51bfc9-d18a-4457-9e89-3a7f7842b0ee": "48895"
  // Add more mappings here as needed
};

const locationMap = {
  "9e82336d-9acc-4330-a94c-dfbc3b6bd55c": 3
};
const findNetSuiteCustomerIdByNameOrPhone = async (name, phone) => {
  const query = encodeURIComponent(`companyName IS "${name}" OR phone IS "${phone}"`);
  const url = `https://5374245.suitetalk.api.netsuite.com/services/rest/record/v1/customer?q=${query}`;
  const res = await axios.get(url, { headers: getAuthHeader('GET', url) });
  if (res.data?.items?.[0]?.id) {
    return res.data.items[0].id;
  } else {
    throw new Error(`Customer not found: ${name} / ${phone}`);
  }
};
const getNetSuiteLocationId = (foodicsBranchId) => {
  return locationMap[foodicsBranchId] || 3; // Default fallback
};
const mapOrderToNetSuite = async (foodicsOrder) => {
  const customerName = foodicsOrder.customer?.name || "Walk-in";
  const customerPhone = foodicsOrder.customer?.phone || "00000000";
  const customerId = await findNetSuiteCustomerIdByNameOrPhone(customerName, customerPhone);

  const lineItems = (foodicsOrder.products || []).map(product => {
    const itemId = productMap[product.id];
    if (!itemId) {
      console.warn(`⚠️ Unmapped Foodics product ID: ${product.id}`);
      return null;
    }
    return {
      item: { id: itemId },
      quantity: product.quantity || 1,
      rate: product.unit_price || 0,
      amount: product.total_price || 0
    };
  }).filter(Boolean);

  return {
    entity: { id: customerId },
    tranId: `FDX-${foodicsOrder.reference}`,
    externalId: foodicsOrder.id,
    item: lineItems,
    location: { id: getNetSuiteLocationId(foodicsOrder.branch?.id) },
    custbody_payment_method: foodicsOrder.payments?.[0]?.payment_method?.name || 'Unknown',
    memo: `Foodics Order #${foodicsOrder.reference}`
  };
};
module.exports = { mapOrderToNetSuite };
