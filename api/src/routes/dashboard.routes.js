const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/dashboard/:idSelectedProject', verifyAuthorization, dashboardController.getDashboardData);


module.exports = router;
