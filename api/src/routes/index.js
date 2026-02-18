const express = require('express');
const router = express.Router();

const customerRoute = require('./customer.routes');

router.get('/', (_, res) => {
  res.status(200).send({
    success: 'true',
    message: 'Welcome do Portal BI',
    version: '1.0.0',
  });
});

router.use('/', customerRoute);

module.exports = router;