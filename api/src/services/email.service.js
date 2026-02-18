const nodemailer = require('nodemailer');

const transportConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
};

if (process.env.EMAIL_SERVICE) {
  transportConfig.service = process.env.EMAIL_SERVICE;
}

const emailService = nodemailer.createTransport(transportConfig);

module.exports = emailService;