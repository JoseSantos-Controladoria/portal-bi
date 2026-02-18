const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const userGroupController = require('../controllers/usergroup.controller');

router.get('/usersbygroup/:groupid', verifyAuthorization, userGroupController.getUsersByGroup);
router.get('/groupsbyuser/:userid', verifyAuthorization, userGroupController.getGroupsbyUser);
router.post('/groupsbyuser', verifyAuthorization, userGroupController.createGroupsbyUser);
router.post('/usersbygroup', verifyAuthorization, userGroupController.createUsersbyGroup);

module.exports = router;
