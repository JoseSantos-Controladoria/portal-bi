const db = require('./database');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send({ status: 'ERROR', error_message: 'Token não informado.' });
  }

  try {

    const query = `
      SELECT * FROM portalbi.tb_api_access_control 
      WHERE api_token = $1 
      AND active = true
      AND created_at > NOW() - INTERVAL '1 hours'
    `;
    
    const result = await db.query(query, [token]);

    if (result.rowCount === 0) {
      return res.status(401).send({ status: 'ERROR', error_message: 'Sessão expirada ou inválida.' });
    }
    const secret = process.env.JWT_SECRET || 'SEGREDO_TEMPORARIO_DEV';
    
    try {
      const decoded = jwt.verify(token, secret);
      
      req.user = decoded; 
      
      next();
    } catch (jwtError) {
      return res.status(401).send({ status: 'ERROR', error_message: 'Token inválido ou corrompido.' });
    }

  } catch (error) {
    console.error('Erro na validação do token:', error);
    return res.status(500).send({ status: 'ERROR', error_message: 'Erro interno ao validar token.' });
  }
};