const mapOrderToNetSuite = (foodicsOrder) => {
  const customerId = '11'; 
  const itemId = '48892'; 

  return {
    entity: { id: customerId },
    tranId: `FDX-${foodicsOrder.reference}`,
    externalId: foodicsOrder.id,
    item: [
      {
        item: { id: itemId },
        quantity: 1,
        rate: foodicsOrder.subtotal_price,
        discount: foodicsOrder.discount_amount || 0
      }
    ],
    location: { id: 3 },
    custbody_payment_method: foodicsOrder.meta?.external_source || 'Unknown',
    memo: `Foodics Order #${foodicsOrder.reference}`
  };
};


module.exports = { mapOrderToNetSuite };
