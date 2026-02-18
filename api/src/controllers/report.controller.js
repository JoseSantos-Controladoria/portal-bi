const db = require('../config/database.js');

exports.getReportsByUser = async (req, res) => {
  const userId = parseInt(req.params.userid);

  if (!userId) {
    return res.status(400).send({ status: 'ERROR', error_message: 'User ID is missing.' });
  }

  try {
    
    const cQuery = `
      SELECT DISTINCT
        r.id,
        r.title,
        r.description,
        r.embedded_url,
        r.workspace_id,
        w.name as workspace_name,
        r.active,
        r.last_update
      FROM portalbi.tb_report r
      INNER JOIN portalbi.tb_report_group rg ON r.id = rg.report_id
      INNER JOIN portalbi.tb_user_group ug   ON rg.group_id = ug.group_id
      LEFT JOIN  portalbi.tb_workspace w     ON r.workspace_id = w.id
      WHERE ug.user_id = $1
        AND ug.active = true
        AND r.active = true
        AND (w.active = true OR w.active IS NULL)
      ORDER BY r.title ASC
    `;

    const responseSQL = await db.query(cQuery, [userId]);

    res.status(200).send({ 
      status: 'SUCCESS', 
      items: responseSQL.rows, 
      count: responseSQL.rowCount 
    });

  } catch (error) {
    console.error(`Erro ao buscar relatórios para o usuário ${userId}:`, error);
    res.status(500).send({ 
      status: 'ERROR', 
      error_message: 'Erro interno ao buscar relatórios.' 
    });
  }
};