const router = require('express-promise-router')();
const verifyAuthorization = require('../config/middleware');
const posProjectController = require('../controllers/posproject.controller');

// router.get('/basictable', verifyAuthorization, basicTableController.getAllItems);
router.get('/posproject/:id', verifyAuthorization, posProjectController.getItemById);
router.post('/posproject', verifyAuthorization, posProjectController.createItem);
// router.patch('/basictable', verifyAuthorization, basicTableController.updateItem);
// router.delete('/basictable', verifyAuthorization, basicTableController.deleteItem);


module.exports = router;
