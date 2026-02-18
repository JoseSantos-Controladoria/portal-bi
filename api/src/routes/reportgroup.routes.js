const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const reportGroupController = require('../controllers/reportgroup.controller');

router.get('/groupsbyreport/:reportid', verifyAuthorization, reportGroupController.getGroupsbyReport);
router.post('/groupsbyreport', verifyAuthorization, reportGroupController.createGroupsbyReport);

module.exports = router;
