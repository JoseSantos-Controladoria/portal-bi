const db = require('../config/database.js');
const params = require('../config/params.js');

exports.createItem = async (req, res) => {

  let cQuery = '';
  let body = req.body;
  let requisicaoOK = true;
  let messageError = '';
  let action = '';

  if ((body.profileid == undefined) || (body.profileid == null)) {
    requisicaoOK = false;
    messageError = 'ID do Perfil não foi informado.';
  }

  if ((body.features == undefined) || (body.features == null) || (body.features.length == 0)) {
    requisicaoOK = false;
    messageError = 'ID de Feature(s) não foi informado.';
  }

  if ((body.action == undefined) || (body.action == null)) {  
      action = 'KEEP_EXISTING_FEATURES';
  }
  else {
    action = body.action;

    if (['KEEP_EXISTING_FEATURES', 'DELETE_EXISTING_FEATURES'].includes(action) == false) {
      requisicaoOK = false;
      messageError = `AÇÃO [${action}] não é válida!`;
    }
  }


  if (requisicaoOK == true) {

    let featuresIDs = body.features.join(',');

    cQuery = `delete from hub.tb_profile_feature where id_profile = ${body.profileid} `;

    if (action == 'KEEP_EXISTING_FEATURES') {
      cQuery += `and id_feature in (${featuresIDs})`
    }
    await db.query( cQuery );


    for (let i=0; i<body.features.length; i++) {

      try {
        nNextID = await getNextID();
        cQuery  = `insert into hub.tb_profile_feature ( id, id_profile, id_feature, active ) 
                      values (${nNextID}, ${body.profileid}, ${body.features[i]}, true)`;
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

  let cQuery = `select (coalesce(max(id),0)+1) as id from hub.tb_profile_feature;`
  let responseSQL = await db.query( cQuery );
  let nID = null;

  if (responseSQL.rowCount > 0) {
    nID = parseInt(responseSQL.rows[0].id);
  }

  return (nID);

}

exports.getItemById = async (req, res) => {

  let profileid = parseInt(req.params.id);
  let cQuery = `select	tb_profile.id id_profile, upper(tb_profile.name) profile,
                        tb_feature.id id_feature, tb_feature.feature_group, tb_feature.sequence, 
                        case
                          when tb_feature.type = 'MENU' then tb_feature.description || ' (Menu de Acesso) '
                          else tb_feature.description
                        end feature,
                        tb_feature.internal_code, tb_feature.type feature_type,
                        coalesce(tb_profile_feature.active,false) feature_associated,
                        tb_profile_feature.created_at, tb_profile_feature.updated_at 
                  from hub.tb_feature 
                  left join hub.tb_profile_feature on ( tb_profile_feature.id_feature = tb_feature.id and tb_profile_feature.id_profile = $1)
                  left join hub.tb_profile on ( tb_profile.id = $1)
                  order by tb_feature.sequence, tb_feature.feature_group, tb_feature.description`;

  let responseSQL = await db.query( cQuery, [profileid])
  
  if (responseSQL.rowCount > 0) {
    res.status(200).send( { items: responseSQL.rows, status: 'SUCCESS', error_message: ''} );
  }
  else{
    res.status(404).send( { status: 'ERROR', error_message: 'Not found.' } );
  }  

  return;

};
