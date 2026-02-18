const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const customerController = require('../controllers/customer.controller');

router.get('/customers', verifyAuthorization, customerController.getCustomers);

module.exports = router;