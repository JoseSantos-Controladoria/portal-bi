const express = require('express');
const cors = require('cors');

const app = express();

const index = require('./routes/index');
const login = require('./routes/login.routes');
const basicTableRoute = require('./routes/basictable.routes');
const userGroupRoute = require('./routes/usergroup.routes');
const reportGroupRoute = require('./routes/reportgroup.routes');
const reportRoute = require('./routes/report.routes'); 
const logRoute = require('./routes/log.routes');
const customerRoute = require('./routes/customer.routes');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(cors());

app.use(index);
app.use('/v1', index);
app.use('/v1/', login);
app.use('/v1/', basicTableRoute);
app.use('/v1/', userGroupRoute);
app.use('/v1/', reportGroupRoute);
app.use('/v1/', reportRoute);
app.use('/v1/', customerRoute);
app.use('/v1/', logRoute);


module.exports = app;