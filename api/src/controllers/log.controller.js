const db = require('../config/database.js');

async function getNextLogID() {
  const query = `SELECT (COALESCE(MAX(id), 0) + 1) as id FROM portalbi.tb_report_log_access`;
  const res = await db.query(query);
  return parseInt(res.rows[0].id);
}

exports.createLog = async (req, res) => {
  const { userid, reportid, action } = req.body;

  if (!userid || !action) {
    return res.status(400).send({ status: 'ERROR', error_message: 'Dados incompletos.' });
  }

  try {
    let groupId = null;

    if (reportid) {
      const findGroupQuery = `
        SELECT ug.group_id 
        FROM portalbi.tb_user_group ug
        INNER JOIN portalbi.tb_report_group rg ON ug.group_id = rg.group_id
        WHERE ug.user_id = $1 
          AND rg.report_id = $2
          AND ug.active = true
        LIMIT 1
      `;
      const groupRes = await db.query(findGroupQuery, [userid, reportid]);
      if (groupRes.rowCount > 0) {
        groupId = groupRes.rows[0].group_id;
      }
    }

    const nextId = await getNextLogID();

    const insertQuery = `
      INSERT INTO portalbi.tb_report_log_access 
      (id, user_id, report_id, group_id, "action", created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;

    await db.query(insertQuery, [nextId, userid, reportid || null, groupId, action]);
    
    res.status(201).send({ status: 'SUCCESS' });

  } catch (error) {
    console.error("Erro ao criar log:", error);
    res.status(500).send({ 
      status: 'ERROR', 
      error_message: 'Falha ao registrar log.',
      detail: error.message 
    });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.id,
        l.created_at,
        l.action,
        
        -- USUÁRIO
        CASE 
           WHEN u.name IS NULL THEN 'Usuário Removido'
           WHEN u.active = false THEN u.name || ' (Inativo)'
           ELSE u.name 
        END as user_name,
        coalesce(u.email, '-') as user_email,

        -- RELATÓRIO (AQUI ESTÁ O QUE VOCÊ QUER)
        CASE 
           WHEN r.title IS NULL THEN 'Relatório Removido' -- Só se foi DELETADO
           WHEN r.active = false THEN r.title || ' (Inativo)' -- Se foi INATIVADO, mostra o nome + tag
           ELSE r.title -- Se está ATIVO, mostra só o nome
        END as report_name,

        -- GRUPO
        CASE 
           WHEN g.name IS NULL THEN '-'
           WHEN g.active = false THEN g.name || ' (Inativo)'
           ELSE g.name 
        END as group_name

      FROM portalbi.tb_report_log_access l
      LEFT JOIN portalbi.tb_user u ON l.user_id = u.id
      LEFT JOIN portalbi.tb_report r ON l.report_id = r.id
      LEFT JOIN portalbi.tb_group g ON l.group_id = g.id
      ORDER BY l.created_at DESC
    `;

    const response = await db.query(query);

    res.status(200).send({ 
      status: 'SUCCESS', 
      items: response.rows,
      count: response.rowCount 
    });

  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    res.status(500).send({ status: 'ERROR', error_message: 'Falha ao buscar logs.' });
  }
};