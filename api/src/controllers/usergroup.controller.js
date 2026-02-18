const db = require('../config/database.js');
const params = require('../config/params.js');

exports.createGroupsbyUser = async (req, res) => {

  let cQuery = '';
  let body = req.body;
  let requisicaoOK = true;
  let messageError = '';
  let action = '';

  if ((body.userid == undefined) || (body.userid == null)) {
    requisicaoOK = false;
    messageError = 'ID do Usuário não foi informada.';
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

    cQuery = `delete from portalbi.tb_user_group where user_id = ${body.userid} `;

    if (action == 'KEEP_EXISTING_GROUPS') {
      cQuery += `and group_id in (${groupsIDs})`
    }
    await db.query( cQuery );


    for (let i=0; i<body.groups.length; i++) {

      try {
        nNextID = await getNextID();
        cQuery  = `insert into portalbi.tb_user_group ( id, user_id, group_id, last_update, active ) 
                      values (${nNextID}, ${body.userid}, ${body.groups[i]}, now(), true )`;
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

exports.createUsersbyGroup = async (req, res) => {

  let cQuery = '';
  let body = req.body;
  let requisicaoOK = true;
  let messageError = '';
  let action = '';

  if ((body.groupid == undefined) || (body.groupid == null)) {
    requisicaoOK = false;
    messageError = 'ID do Grupo não foi informado.';
  }

  if ((body.users == undefined) || (body.users == null) || (body.users.length == 0)) {
    requisicaoOK = false;
    messageError = 'ID de Usuário(s) não foi informado.';
  }

  if ((body.action == undefined) || (body.action == null)) {  
      action = 'KEEP_EXISTING_USERS';
  }
  else {
    action = body.action;

    if (['KEEP_EXISTING_USERS', 'DELETE_EXISTING_USERS'].includes(action) == false) {
      requisicaoOK = false;
      messageError = `AÇÃO [${action}] não é válida!`;
    }
  }


  if (requisicaoOK == true) {

    let usersIDs = body.users.join(',');

    cQuery = `delete from portalbi.tb_user_group where group_id = ${body.groupid} `;

    if (action == 'KEEP_EXISTING_USERS') {
      cQuery += `and user_id in (${usersIDs})`
    }
    await db.query( cQuery );


    for (let i=0; i<body.users.length; i++) {

      try {
        nNextID = await getNextID();
        cQuery  = `insert into portalbi.tb_user_group ( id, group_id, user_id, last_update, active ) 
                      values (${nNextID}, ${body.groupid}, ${body.users[i]}, now(), true )`;
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

  let cQuery = `select (coalesce(max(id),0)+1) as id from portalbi.tb_user_group;`
  let responseSQL = await db.query( cQuery );
  let nID = null;

  if (responseSQL.rowCount > 0) {
    nID = parseInt(responseSQL.rows[0].id);
  }

  return (nID);

}

exports.getUsersByGroup = async (req, res) => {

  let groupid = parseInt(req.params.groupid);
  let cQuery = '';

  cQuery = `select id, name from portalbi.tb_group where id = $1`;
  let dadosgrupo = await db.query( cQuery, [groupid])

  cQuery = `select 	tb_user.id user_id, tb_user.name user_name, tb_user.email user_email,
                    coalesce(tb_user_group.active,false) user_associated,
                    tb_user_group.last_update 
                from portalbi.tb_user
                left join portalbi.tb_user_group on (tb_user_group.user_id = tb_user.id and tb_user_group.group_id = $1 )  
                left join portalbi.tb_group on ( tb_user_group.group_id = tb_group.id)
                order by tb_user.name`;

  let responseSQL = await db.query( cQuery, [groupid])
  
  if (responseSQL.rowCount > 0) {
    res.status(200).send( { group_id: dadosgrupo.rows[0].id ?? null,
                            group_name: dadosgrupo.rows[0].name ?? null,
                            users: responseSQL.rows, status: 'SUCCESS', error_message: ''} );
  }
  else{
    res.status(404).send( { status: 'ERROR', error_message: 'Not found.' } );
  }  

  return;

};

exports.getGroupsbyUser = async (req, res) => {

  let userid = parseInt(req.params.userid);
  let cQuery = '';
  
  cQuery = `select id, name, email from portalbi.tb_user where id = $1`;
  let dadosusuario = await db.query( cQuery, [userid])

  cQuery = `select	tb_group.id group_id, upper(tb_group.name) group_name,
                    coalesce(tb_user_group.active,false) user_associated,
                    tb_user_group.last_update 
                from portalbi.tb_group
                left join portalbi.tb_user_group on (tb_user_group.group_id = tb_group.id and tb_user_group.user_id = $1 )                  
                order by tb_group.name`;

  let responseSQL = await db.query( cQuery, [userid])
  
  if (responseSQL.rowCount > 0) {
    res.status(200).send( { user_id: dadosusuario.rows[0].id ?? null, 
                            user_name: dadosusuario.rows[0].name ?? null, 
                            user_email: dadosusuario.rows[0].email ?? null, 
                            groups: responseSQL.rows, status: 'SUCCESS', error_message: ''} );
  }
  else{
    res.status(404).send( { status: 'ERROR', error_message: 'Not found.' } );
  }  

  return;

};
