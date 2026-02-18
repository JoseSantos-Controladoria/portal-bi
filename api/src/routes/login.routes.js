const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const loginController = require('../controllers/login.controller');

router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);

module.exports = router;
