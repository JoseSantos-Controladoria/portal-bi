const db = require('../config/database.js');
const params = require('../config/params.js');

exports.createItem = async (req, res) => {

  let cQuery = '';
  let body = req.body;
  let requisicaoOK = true;
  let messageError = '';
  let action = '';

  if ((body.posid == undefined) || (body.posid == null)) {
    requisicaoOK = false;
    messageError = 'ID do PDV não foi informado.';
  }

  if ((body.projects == undefined) || (body.projects == null) || (body.projects.length == 0)) {
    requisicaoOK = false;
    messageError = 'ID de Projeto(s) não foi informado.';
  }

  if ((body.action == undefined) || (body.action == null)) {  
      action = 'KEEP_EXISTING_PROJECTS';
  }
  else {
    action = body.action;

    if (['KEEP_EXISTING_PROJECTS', 'DELETE_EXISTING_PROJECTS'].includes(action) == false) {
      requisicaoOK = false;
      messageError = `AÇÃO [${action}] não é válida!`;
    }
  }


  if (requisicaoOK == true) {

    let projectsIDs = body.projects.join(',');

    cQuery = `delete from hub.tb_pos_project where id_pos = ${body.posid} `;

    if (action == 'KEEP_EXISTING_PROJECTS') {
      cQuery += `and id_project in (${projectsIDs})`
    }
    await db.query( cQuery );


    for (let i=0; i<body.projects.length; i++) {

      try {
        nNextID = await getNextID();
        cQuery  = `insert into hub.tb_pos_project ( id, id_pos, id_project, active ) 
                      values (${nNextID}, ${body.posid}, ${body.projects[i]}, true)`;
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

  let cQuery = `select (coalesce(max(id),0)+1) as id from hub.tb_pos_project;`
  let responseSQL = await db.query( cQuery );
  let nID = null;

  if (responseSQL.rowCount > 0) {
    nID = parseInt(responseSQL.rows[0].id);
  }

  return (nID);

}

exports.getItemById = async (req, res) => {

  let posid = parseInt(req.params.id);
  let cQuery = `select 	tb_project.id_customer, upper(tb_customer."name") as customer_name,
                        tb_project.id id_project, upper(tb_project.name) project_name,
                        upper(tb_customer."name" || ' (' || tb_project.id_customer || ') / ' || tb_project.name || ' (' || tb_project.id || ') ') project,
                        coalesce(tb_pos_project.active,false) project_associated,
                        tb_pos_project.created_at, tb_pos_project.updated_at 
                from hub.tb_project
                left join hub.tb_customer on (tb_project.id_customer = tb_customer.id)
                left join hub.tb_pos_project on (tb_pos_project.id_project = tb_project.id and tb_pos_project.id_pos = $1 )  
                order by tb_project.id_customer, tb_project.id `;

  let responseSQL = await db.query( cQuery, [posid])
  
  if (responseSQL.rowCount > 0) {
    res.status(200).send( { items: responseSQL.rows, status: 'SUCCESS', error_message: ''} );
  }
  else{
    res.status(404).send( { status: 'ERROR', error_message: 'Not found.' } );
  }  

  return;

};
