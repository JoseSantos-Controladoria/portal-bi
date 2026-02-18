/**
 * Arquivo: config/database.js
 * Descrição: arquivo responsável pelas 'connectionStrings da aplicação: PostgreSQL.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// homologacao
// let cConnectionString = "postgres://mce_hml:21S179J3O75H43Zw@34.151.251.73:5432/mce_hml";

// ==> Conexão com a Base de Dados:
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

pool.on('connect', (client) => {
  client.query("SET TIME ZONE 'America/Sao_Paulo';");
  console.log('Base de Dados conectado com sucesso!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
