const db = require('../config/database.js');

exports.getCustomers = async (req, res) => {
  try {
    let cQuery = '';

    cQuery = `select customer_id, customer_name, sum(qty_report) qty_report
                from (
                  select distinct tb_group.customer_id, tb_customer."name" as customer_name,
                          tb_report_group.report_id, tb_report.description,
                          case when tb_report_group.report_id is null then 0 else 1 end qty_report
                  from portalbi.tb_customer
                  left join portalbi.tb_group on (tb_customer.id = tb_group.customer_id)
                  left join portalbi.tb_report_group on (tb_group.id = tb_report_group.group_id)
                  left join portalbi.tb_report on (tb_report.id = tb_report_group.report_id)
                  where (coalesce(tb_report.active,true) = true or tb_report.active is null)
                    and (tb_report_group.active = true or tb_report_group.active is null)
                  order by tb_customer."name", tb_report.description
                ) as subquery
                group by customer_id, customer_name
                order by customer_name`;

    let customers = await db.query(cQuery);

    // Query 2: Estrutura de Grupos
    cQuery = `select distinct tb_group.customer_id, tb_customer."name" as customer_name,
                      tb_group.id, tb_group."name"
              from portalbi.tb_customer
              left join portalbi.tb_group on (tb_customer.id = tb_group.customer_id)
              left join portalbi.tb_report_group on (tb_group.id = tb_report_group.group_id)
              left join portalbi.tb_report on (tb_report.id = tb_report_group.report_id)
              where (coalesce(tb_report.active,true) = true or tb_report.active is null)
                and (tb_report_group.active = true or tb_report_group.active is null)
              order by tb_customer."name", tb_group.name`;

    let groupsbycustomer = await db.query(cQuery);

    let mergedCustomers = [];

    if (customers.rowCount > 0) {
      // 1. Agrupa os grupos por customer_id
      const groupsByCustomer = groupsbycustomer.rows.reduce((acc, group) => {
        const customerId = group.customer_id;
        if (!acc[customerId]) acc[customerId] = [];
        
        if(group.id) {
            acc[customerId].push({
              group_id: group.id,
              group_name: group.name
            });
        }
        return acc;
      }, {});

      // 2. Merge customers + groups
      mergedCustomers = customers.rows.map(customer => ({
        customer_id: customer.customer_id,
        customer_name: customer.customer_name,
        qty_report: customer.qty_report,
        groups: groupsByCustomer[customer.customer_id] || []
      }));
    }

    res.status(200).send({
      customers: mergedCustomers,
      status: 'SUCCESS',
      error_message: ''
    });

  } catch (error) {
    console.error("Erro no getCustomers:", error);
    res.status(500).send({
      status: 'ERROR',
      error_message: error.message || 'Erro interno ao buscar clientes.'
    });
  }
};