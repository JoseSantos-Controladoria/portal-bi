const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const profileFeatureController = require('../controllers/profilefeature.controller');

router.get('/profilefeature/:id', verifyAuthorization, profileFeatureController.getItemById);
router.post('/profilefeature', verifyAuthorization, profileFeatureController.createItem);

module.exports = router;
