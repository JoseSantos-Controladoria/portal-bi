const db = require('../config/database.js');
const params = require('../config/params.js');

exports.createGroupsbyReport = async (req, res) => {

  let cQuery = '';
  let body = req.body;
  let requisicaoOK = true;
  let messageError = '';
  let action = '';

  if ((body.reportid == undefined) || (body.reportid == null)) {
    requisicaoOK = false;
    messageError = 'ID do Relatório não foi informado.';
  }

  if ((body.groups == undefined) || (body.groups == null) || (body.groups.length == 0)) {
    requisicaoOK = false;
    messageError = 'ID de Grupos(s) não foi informado.';
  }

  if ((body.action == undefined) || (body.action == null)) {  
      action = 'KEEP_EXISTING_GROUPS';
  }
  else {
    action = body.action;

    if (['KEEP_EXISTING_GROUPS', 'DELETE_EXISTING_GROUPS'].includes(action) == false) {
      requisicaoOK = false;
      messageError = `AÇÃO [${action}] não é válida!`;
    }
  }


  if (requisicaoOK == true) {

    let groupsIDs = body.groups.join(',');

    cQuery = `delete from portalbi.tb_report_group where report_id = ${body.reportid} `;

    if (action == 'KEEP_EXISTING_GROUPS') {
      cQuery += `and group_id in (${groupsIDs})`
    }
    await db.query( cQuery );


    for (let i=0; i<body.groups.length; i++) {

      try {
        nNextID = await getNextID();
        cQuery  = `insert into portalbi.tb_report_group ( id, report_id, group_id, last_update, active ) 
                      values (${nNextID}, ${body.reportid}, ${body.groups[i]}, now(), true )`;
        await db.query( cQuery );
      }
      catch(e) {
        messageError = `${e.message} ${e.detail}` ;
      }

    }

    if (messageError.length == 0) {
      res.status(200).send({ status: 'SUCCESS', error_message: ''})
    }
    else {
      res.status(400).send({ status: 'ERROR', error_message: messageError})  
    }
    

  }
  else {
    res.status(400).send({ status: 'ERROR', error_message: messageError})
  }

  return
};


async function getNextID() {

  let cQuery = `select (coalesce(max(id),0)+1) as id from portalbi.tb_report_group;`
  let responseSQL = await db.query( cQuery );
  let nID = null;

  if (responseSQL.rowCount > 0) {
    nID = parseInt(responseSQL.rows[0].id);
  }

  return (nID);

}

exports.getGroupsbyReport = async (req, res) => {

  let reportid = parseInt(req.params.reportid);
  let cQuery = '';
  
  cQuery = `select id, title, description from portalbi.tb_report where id = $1`;
  let dadosreport = await db.query( cQuery, [reportid])

  cQuery = `select	tb_group.id group_id, upper(tb_group.name) group_name,
                    tb_group.customer_id, tb_customer.name customer_name,
                    coalesce(tb_report_group.active,false) group_associated,
                    tb_report_group.last_update 
                from portalbi.tb_group
                left join portalbi.tb_report_group on (tb_report_group.group_id = tb_group.id and tb_report_group.report_id = $1 )
                left join portalbi.tb_customer on (tb_group.customer_id = tb_customer.id)
                order by tb_group.name`;

  let responseSQL = await db.query( cQuery, [reportid])
  
  if (responseSQL.rowCount > 0) {
    res.status(200).send( { report_id: dadosreport.rows[0].id ?? null, 
                            report_title: dadosreport.rows[0].title ?? null, 
                            report_description: dadosreport.rows[0].description ?? null, 
                            groups: responseSQL.rows, status: 'SUCCESS', error_message: ''} );
  }
  else{
    res.status(404).send( { status: 'ERROR', error_message: 'Not found.' } );
  }  

  return;

};
