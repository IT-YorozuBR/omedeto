const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados Neon PostgreSQL');
    await createTables();
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
    return false;
  }
}

async function createTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS messages (
      id            SERIAL PRIMARY KEY,
      remetente_nome    VARCHAR(255) NOT NULL,
      destinatario_nome VARCHAR(255) NOT NULL,
      mensagem      TEXT          NOT NULL,
      isPrinted     BOOLEAN       DEFAULT FALSE,
      printed_at    TIMESTAMP,
      created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      status        VARCHAR(50)   DEFAULT 'active'
    );
  `;
  try {
    await pool.query(sql);
    console.log('✅ Tabela "messages" verificada/criada');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  }
}

module.exports = { pool, testConnection, createTables };
