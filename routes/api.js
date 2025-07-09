const express = require('express');
const router = express.Router();
const { syncData, syncNetSuiteProducts,syncCustomers ,run,updateNetSuiteCustomers,syncFoodicsProductsToNetSuite} = require('../controllers/syncController');
const { getStatus } = require('../controllers/statusController');

router.get('/sync', syncData);
router.get('/sync/netsuite-products', syncNetSuiteProducts); 
router.get('/sync/netsuite-customers',syncCustomers)
router.get('/sync/syncFoodicsProductsToNetSuite',syncFoodicsProductsToNetSuite)

router.get('/sync/netsuite-customers_delete',updateNetSuiteCustomers)
router.get('/status', getStatus);

module.exports = router;
