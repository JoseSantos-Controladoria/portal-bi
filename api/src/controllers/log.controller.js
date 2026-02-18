const db = require('../config/database.js');

exports.getAllLogs = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.id,

        l.action,
        
        -- USUÁRIO
        CASE 
           WHEN u.name IS NULL THEN 'Usuário Removido'
           WHEN u.active = false THEN u.name || ' (Inativo)'
           ELSE u.name 
        END as user_name,
        coalesce(u.email, '-') as user_email,

        -- RELATÓRIO
        CASE 
           WHEN r.title IS NULL THEN 'Relatório Removido' 
           WHEN r.active = false THEN r.title || ' (Inativo)'
           ELSE r.title
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