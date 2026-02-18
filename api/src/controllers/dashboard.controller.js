const db = require('../config/database.js');
const params = require('../config/params.js');

exports.getDashboardData = async (req, res) => {

  let SelectedProjectID = parseInt(req.params.idSelectedProject);
  let cQuery = ``;
  let responseSQL = [];
  let pdvs_full = [];
  let pdvs_project = [];

  cQuery = `select initcap(tb_pos_status.name) as status, count(*) quantidade_pdvs
                from hub.tb_pos
                left join hub.tb_pos_status on tb_pos_status.id = tb_pos.id_status
                where tb_pos.active = true
                group by 1
                order by 1`;
  responseSQL = await db.query( cQuery )
  if (responseSQL.rowCount > 0) {
    pdvs_full = responseSQL.rows;
  }

  cQuery = `select initcap(tb_pos_status.name) as status, count(*) quantidade_pdvs
                from hub.tb_pos
                join hub.tb_pos_project on (tb_pos_project.id_pos = tb_pos.id)
                left join hub.tb_pos_status on tb_pos_status.id = tb_pos.id_status
                where tb_pos.active = true
                  and tb_pos_project.id_project = $1                
                group by 1
                order by 1`;
  responseSQL = await db.query( cQuery, [SelectedProjectID])
  if (responseSQL.rowCount > 0) {
    pdvs_project = responseSQL.rows;
  }
  
  res.status(200).send( { fulllist: pdvs_full, projectlist: pdvs_project, status: 'SUCCESS', error_message: ''} );

  return;

};
