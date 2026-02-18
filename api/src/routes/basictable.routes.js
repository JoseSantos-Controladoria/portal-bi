const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const basicTableController = require('../controllers/basictable.controller');

router.get('/basictable', verifyAuthorization, basicTableController.getAllItems);
router.post('/basictable', verifyAuthorization, basicTableController.createItem);
router.patch('/basictable', verifyAuthorization, basicTableController.updateItem);
router.delete('/basictable', verifyAuthorization, basicTableController.deleteItem);


module.exports = router;
