const db = require('./database');

const verifyAuthorization = async (req, res, next) => {
  const cToken = req.headers.authorization;

  if ((cToken === undefined) || (cToken === '')) {
    return res.status(401).json({
      mensagem: 'Authorization Token não informado.',
    });
  }

  const resultSQL = await db.query('select * from portalbi.tb_api_access_control where api_token = $1', [cToken]);

  if (resultSQL.rowCount === 0) {
    return res.status(401).json({
      mensagem: 'Authorization Token inválido.',
    });
  }

  next();
};

module.exports = verifyAuthorization;
