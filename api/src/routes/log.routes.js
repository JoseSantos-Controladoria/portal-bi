const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const logController = require('../controllers/log.controller');

router.post('/logs', verifyAuthorization, logController.createLog);
router.get('/logs', verifyAuthorization, logController.getAllLogs);

module.exports = router;