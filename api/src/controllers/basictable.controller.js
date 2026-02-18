const db = require('../config/database.js');
const params = require('../config/params.js');


function isValidTable( cTablename ) {

  let aBasicTables = [ 'company', 'customer', 'group', 'profile', 'report', 'report_group', 
                       'report_log_access', 'user', 'user_group', 'workspace' ] ;

  return ( aBasicTables.includes( cTablename.toLowerCase() ) );

}
 

function isTableRestrictSameName( cTablename ) {

  let aTablesRestrictSameName = [  'customer', 'project', 'address_type', 'state', 'country', 'pos_chain','pos_brand', 'pos_channel',
                                   'pos_location_type', 'pos_status', 'profile', 'doctype', 'pos_business_unit_type' ];

  return ( aTablesRestrictSameName.includes( cTablename.toLowerCase() ) );

}


exports.getAllItems = async (req, res) => {

  if (isValidTable( req.query.tablename.toLowerCase() ) == true) {

    let responseSQL = await ListAllItems( req.query );


    if (responseSQL.rowCount >= 0) {
      res.status(200).send( { items: responseSQL.rows, ...responseSQL.responseinfo} );
    }
    else{
      res.status(404).send({ items: responseSQL.rows, responseinfo: responseSQL.responseinfo});
    }  

  }
  else {
    res.status(400).send( { status: 'ERROR', error_message: 'TABLE NAME parameter is invalid or missing.'} );
  }

  return

};

async function ListAllItems( queryparam ) {

  let nDefaultPageSize = await params.getDefaultParam('PAGINATION_DEFAULT_PAGE_SIZE');
  let bHasPagination = queryparam.page == undefined ? false : true;
  let nPage = queryparam.page == undefined ? 1 : parseInt(queryparam.page);
  let nPageSize = queryparam. pagesize == undefined ? null : parseInt(queryparam.pagesize);
  nDefaultPageSize = nDefaultPageSize == null ? 10 : nDefaultPageSize;
  nPageSize = nPageSize == null ? nDefaultPageSize : nPageSize;

  let cCountQuery = `select count(*) as qtde_registros from portalbi.tb_${queryparam.tablename.toLowerCase()} as "${queryparam.tablename}" where 1=1 `;

  let cSelectQuery = ``;
  if (queryparam.tablename.toLowerCase() == 'group') {
    cSelectQuery = `select  "group".id,
                            "group".name,
                            "group".active,
                            "group".customer_id,
                            customer.name customer,
                            (	select count(*)	from portalbi.tb_user_group
                            where group_id = "group".id
                            ) qty_users,
                            "group".last_update
                        from portalbi.tb_group "group"
                        left join portalbi.tb_customer customer on ( "group".customer_id = customer.id)
                        where 1=1 `
  }
  else if (queryparam.tablename.toLowerCase() == 'customer') {
    cSelectQuery = `select  customer.id,
                            customer.name,
                            customer.active,
                            customer.company_id,
                            tb_company.name company,
                            customer.last_update
                        from portalbi.tb_customer as "customer"
                        left join portalbi.tb_company on ( customer.company_id = tb_company.id )
                        where 1=1 `
  }
  else if (queryparam.tablename.toLowerCase() == 'project') {
    cSelectQuery = `select 	project.*, tb_customer.name as customer                            
                        from portalbi.tb_project project
                        left join portalbi.tb_customer on (tb_customer.id = project.id_customer)
                        where 1=1 `
  }
  else if (queryparam.tablename.toLowerCase() == 'user') {
    cSelectQuery = `select 	"user".*, tb_profile.name as perfil                              
                        from portalbi.tb_user "user"
                        left join portalbi.tb_profile on (tb_profile.id = "user".profile_id)
                        where 1=1 `
  }
  else if (queryparam.tablename.toLowerCase() == 'pos_brand') {
    cSelectQuery = `select 	pos_brand.*, tb_pos_chain.name as chain
                        from portalbi.tb_pos_brand pos_brand
                        left join portalbi.tb_pos_chain on (tb_pos_chain.id = pos_brand.id_chain)
                        where 1=1 `
  }
  else {
    cSelectQuery = `select * from portalbi.tb_${queryparam.tablename.toLowerCase()} as "${queryparam.tablename}" where 1=1 `;
  }
  
  let cOrderbyQuery = queryparam.orderby == undefined ? ` ` : ` order by "${queryparam.tablename}".${queryparam.orderby}`;

  let aParamsReq = Object.entries(queryparam);
  let nParamReq = 0;
  let cReservedParams = [ 'tablename', 'page', 'pagesize', 'orderby' ];
  let cFilterQuery = '';
  let regex = /\[(.*?)\]/;
  let aPossibleOperators = ['equal','equal-string','in','greater','greater-equal','less','less-equal','like'];
  let cOperator = '';
  let cErrorMessage = '';
  let lQueryOK = true;

  for (nParamReq=0; nParamReq<=aParamsReq.length-1; nParamReq++) {

    if (cReservedParams.includes(aParamsReq[nParamReq][0]) == false) {
      
      let strValue = String(aParamsReq[nParamReq][1]);
      let matchResult = strValue.match(regex);
      let cValuetoSearch = '';

      if (matchResult) {
        cOperator = matchResult[1];
        cValuetoSearch = strValue.replace(matchResult[0], '');
      } else {
        cOperator = 'equal';
        cValuetoSearch = strValue;
      }

      if (aPossibleOperators.includes(cOperator) == false) {
        lQueryOK = false;
        cErrorMessage += `[${cOperator}] is a invalid operator! List of valid operators: [${aPossibleOperators.toString()}]. `;        
      }
      else {

        if (cOperator == 'like') { cFilterQuery += ` and upper("${queryparam.tablename}".${aParamsReq[nParamReq][0]}) `; }
        else { cFilterQuery += ` and "${queryparam.tablename}".${aParamsReq[nParamReq][0]} `; }

        if ((cOperator == 'equal') || (cOperator == 'equal-string'))  { cFilterQuery += ' = '; }
        if (cOperator == 'in') { cFilterQuery += ' in '; }
        if (cOperator == 'greater') { cFilterQuery += ' > '; }
        if (cOperator == 'greater-equal') { cFilterQuery += ' >= '; }
        if (cOperator == 'less') { cFilterQuery += ' < '; }
        if (cOperator == 'less-equal') { cFilterQuery += ' <= '; }
        if (cOperator == 'like') { cFilterQuery += ' like '; }

        if (cOperator == 'equal-string') { cFilterQuery += ` '${cValuetoSearch}' ` }
        else if (cOperator == 'in') { cFilterQuery += ` (${cValuetoSearch}) ` }
        else if (cOperator == 'like') { cFilterQuery += ` '%${cValuetoSearch.toUpperCase()}%' ` }
        else { cFilterQuery += ` '${cValuetoSearch}' ` }

      }

    }
  }

  let responseSQL = null;
  let nTotalRegistros = 0;
  let nOffSet = 0;
  let cQuery = '';

  if (lQueryOK == true) {
    if (bHasPagination == true) {

      cQuery = cCountQuery + cFilterQuery;
      responseSQL = await db.query( cQuery, [] );
      nTotalRegistros = parseInt(responseSQL.rows[0].qtde_registros);

      nOffSet = (nPage-1)*nPageSize;
      while ( nOffSet >= nTotalRegistros ) {
        nPage--;
        nOffSet = (nPage-1)*nPageSize;
      }
      nOffSet = (nOffSet<0 ? 0 : nOffSet);

      cQuery = cSelectQuery + cFilterQuery + cOrderbyQuery;
      cQuery = cQuery + ` limit ${nPageSize} offset ${nOffSet}`;  

      console.log(cQuery);
      responseSQL = await db.query( cQuery, [] );
    } 
    else {
      cQuery = cSelectQuery + cFilterQuery + cOrderbyQuery;

      console.log(cQuery);
      responseSQL = await db.query( cQuery, [] );
      nTotalRegistros = responseSQL.rowCount;
    };
  }

  responseinfo = {  status: (lQueryOK == true ? 'SUCCESS' : 'ERROR'),
                    error_message: (lQueryOK == true ? '' : cErrorMessage ),
                    page: (lQueryOK == true ? nPage : 0),
                    page_size: (lQueryOK == true ? nPageSize : 0),
                    total_pages: (lQueryOK == true ? Math.ceil(nTotalRegistros / nPageSize) : 0),
                    total_records: (lQueryOK == true ? nTotalRegistros : 0)
                  }

  return { responseinfo, ...responseSQL};

}

exports.getItemById = async (req, res) => {

  if (isValidTable( req.query.tablename.toLowerCase()) == true) {

    let iditem = parseInt(req.params.id);
    let responseSQL = await ListAllItems( { tablename: req.query.tablename.toLowerCase(), id: `[equal]${iditem}` } );

    if (responseSQL.rowCount > 0) {
      res.status(200).send( { items: responseSQL.rows, ...responseSQL.responseinfo} );
    }
    else{
      res.status(404).send( { status: 'ERROR', error_message: 'Not found.'} );
    }  

  }
  else {
    res.status(400).send( { status: 'ERROR', error_message: 'TABLE NAME parameter is invalid or missing.'} );
  }

  return;

};

exports.createItem = async (req, res) => {

  let cQuery = '';

  
  if (isValidTable( req.query.tablename.toLowerCase() ) == true) {

    let lDadosOK = true;
    let cMessageError = '';
    if (isTableRestrictSameName( req.query.tablename.toLowerCase() ) == true) {

      cQuery = `select count(*) as qtde from portalbi.tb_${req.query.tablename.toLowerCase()}
                  where upper(unaccent(name)) = unaccent($1)`
      responseSQL = await db.query( cQuery, [req.body.name.toUpperCase()] );

      if (responseSQL.rowCount > 0) {
        if ( parseInt(responseSQL.rows[0].qtde) > 0) {
          lDadosOK = false;
          cMessageError = `Já existe um registro com este nome informado!`
        }
      }

    }
    

    if (lDadosOK == true){

      let aFields = Object.entries(req.body);
      let nField  = 0;
      let nItemID = await getNextIDItem( req.query.tablename.toLowerCase() );
      let aParamInsert = [];
      let responseSQL = null;

      let cFields = 'id, last_update, ';
      let cFieldValues = `$1, now(), `;
      aParamInsert.push( nItemID );

      for (nField=0; nField<=aFields.length-1; nField++) {
        cFields += aFields[nField][0] + (nField < aFields.length-1 ? `, ` : ``);
        cFieldValues += `$${nField+2}` + (nField < aFields.length-1 ? `, ` : ``);
        aParamInsert.push( aFields[nField][1] );
        
      }

      cQuery = `insert into portalbi.tb_${req.query.tablename.toLowerCase()} (${cFields}) values (${cFieldValues});`
      responseSQL = await db.query( cQuery, aParamInsert );

      if (responseSQL.rowCount > 0) {
        res.status(201).send( { status: 'SUCCESS', id: nItemID, message: `ID ${nItemID} was created.` } );  
      }
      else {
        res.status(500).send({ status: 'ERROR', error_message: 'Internal error.'})
      }

    }
    else {
      res.status(500).send({ status: 'ERROR', error_message: cMessageError})
    }

  }
  else {
    res.status(400).send( { status: 'ERROR', error_message: 'TABLE NAME parameter is invalid or missing.' } );
  }

  return

};

async function getNextIDItem( cTablename ) {

  let cQuery = `select coalesce(max(id),0)+1 id from portalbi.tb_${cTablename.toLowerCase()};`
  let responseSQL = await db.query( cQuery );
  let nID = null;

  if (responseSQL.rowCount > 0) {
    nID = parseInt(responseSQL.rows[0].id);
  }

  return (nID);

}

exports.updateItem = async (req, res) => {

  let cQuery = '';

  if (isValidTable( req.query.tablename.toLowerCase() ) == true) {

    let aFields = Object.entries(req.body);
    let nField  = 0;
    let aParamsUpdate = [];
    let responseSQL = null;
    let nIDItem = -1;
    let cFields = '';
    let nSeqField = 0;

    for (nField=0; nField<=aFields.length-1; nField++) {

      if (aFields[nField][0].toUpperCase() == 'ID') {
        nIDItem = aFields[nField][1];
      }
      else {
        nSeqField++
        cFields += ` "${aFields[nField][0]}" = $${nSeqField}, ` ; 
        aParamsUpdate.push( aFields[nField][1] );
      }
    }
    
    cFields += ` last_update = now() `

    if (nIDItem == -1) {
      res.status(400).send( { status: 'ERROR', error_message: 'ID attribute is missing.' } )
    }
    else {
      cQuery = `update portalbi.tb_${req.query.tablename.toLowerCase()} set ${cFields} where id = ${nIDItem};`
      responseSQL = await db.query( cQuery, aParamsUpdate );

      if (req.query.tablename.toLowerCase() === 'workspace') {

        if (req.body.active === false || req.body.active === 'false') {
            try {

              await db.query(
                `UPDATE portalbi.tb_report SET active = false, last_update = now() WHERE workspace_id = $1`, 
                [nIDItem]
              );
              console.log(`[System] Workspace ${nIDItem} inativado: Relatórios vinculados foram inativados em cascata.`);
            } catch (error) {
              console.error('[System] Erro ao inativar relatórios em cascata:', error);
            }
        }
      }

      if (responseSQL.rowCount <= 0) {
        res.status(200).send( { status: 'ERROR', id: nIDItem, message: `ID ${nIDItem} not found.` } );  
      }
      else if (responseSQL.rowCount > 0) {
        res.status(200).send( { status: 'SUCCESS', id: nIDItem, message: `ID ${nIDItem} was updated.` } );  
      }
      else {
        res.status(500).send( { status: 'ERROR', error_message: 'Internal error.' } );
      }
    }

  }
  else {
    res.status(400).send( { status: 'ERROR', error_message: 'TABLE NAME parameter is invalid or missing.'} );
  }

  return

};

exports.deleteItem = async (req, res) => {

  let cQuery = '';
  let cTablename = req.query.tablename.toLowerCase();

  if (isValidTable( cTablename ) == true) {

    let nIDItem = req.body?.id

    let responseSQL = null;

    if (nIDItem == undefined) {
      res.status(400).send( { success: false, message: '', error: 'ID attribute is missing.' } )
    }
    else {
      try {

        if (cTablename == 'pos') {
          cQuery = `delete from portalbi.tb_pos_project where id_pos = ${nIDItem};`
          responseSQL = await db.query( cQuery );
        }

        cQuery = `delete from portalbi.tb_${req.query.tablename.toLowerCase()} where id = ${nIDItem};`
        responseSQL = await db.query( cQuery );

        res.status(200).send( { success: true, message: `ID ${nIDItem} was deleted.`, error: '' } );  

      } catch (error) {
        console.error('Erro ao executar query: ' + cQuery, error);

        res.status(500).json({
          success: false,
          message: 'Erro ao excluir o registro.',
          error: error.detail || error.message || error
        });
      }

    }

  }
  else {
    res.status(400).send( { status: 'ERROR', error_message: 'TABLE NAME parameter is invalid or missing.'} );
  }

  return

};