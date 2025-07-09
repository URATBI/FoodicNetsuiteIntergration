const cron = require('node-cron');
const { fetchOrders } = require('../services/foodicsService');
const { createSalesOrder } = require('../services/netsuiteService');
const { mapOrderToNetSuite } = require('../utils/mapper');
const SyncLog = require('../models/SyncLog');

const logSyncJob = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running scheduled sync job...');
    try {
      const orders = await fetchOrders();
      for (const order of orders) {
        const mapped = mapOrderToNetSuite(order);
        await createSalesOrder(mapped);
      }
      await SyncLog.create({ total: orders.length, status: 'success' });
    } catch (err) {
      await SyncLog.create({ total: 0, status: 'fail', error: err.message });
      console.error('Scheduled job failed:', err.message);
    }
  });
};

module.exports = { logSyncJob };