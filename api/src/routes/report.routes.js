const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const reportController = require('../controllers/report.controller');

router.get('/myreports/:userid', verifyAuthorization, reportController.getReportsByUser);

module.exports = router;