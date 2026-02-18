const dotenv = require('dotenv');

async function getDefaultParam(cParam) {

  await dotenv.config();

  cParam = cParam.toUpperCase();
  let retorno = null;

  if (cParam == 'PAGE_SIZE') {
    retorno = await process.env.PAGE_SIZE;
  }  

  return ( retorno ) ;

};

module.exports = {  getDefaultParam };

