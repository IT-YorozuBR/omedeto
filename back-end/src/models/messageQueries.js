const { pool } = require('../config/database');

const messageQueries = {
  saveMessage: async (data) => {
    try {
      const result = await pool.query(
        `INSERT INTO messages (remetente_nome, destinatario_nome, mensagem, status)
         VALUES ($1, $2, $3, 'active') RETURNING *`,
        [data.remetente_nome, data.destinatario_nome, data.mensagem]
      );
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error.message);
      return { success: false, error: error.message };
    }
  },

  updateMessage: async (id, data) => {
    try {
      const result = await pool.query(
        `UPDATE messages
         SET remetente_nome = $1, destinatario_nome = $2, mensagem = $3
         WHERE id = $4 RETURNING *`,
        [data.remetente_nome, data.destinatario_nome, data.mensagem, id]
      );
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error.message);
      return { success: false, error: error.message };
    }
  },

  getAllMessages: async () => {
    try {
      const result = await pool.query(
        `SELECT * FROM messages WHERE status = 'active' ORDER BY created_at DESC`
      );
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error.message);
      return { success: false, error: error.message };
    }
  },

  getMessageById: async (id) => {
    try {
      const result = await pool.query(
        `SELECT * FROM messages WHERE id = $1 AND status = 'active'`,
        [id]
      );
      if (result.rows.length === 0) return { success: false, error: 'Mensagem não encontrada' };
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Erro ao buscar mensagem:', error.message);
      return { success: false, error: error.message };
    }
  },

  deleteMessage: async (id) => {
    try {
      const result = await pool.query(
        `UPDATE messages SET status = 'deleted' WHERE id = $1 RETURNING *`,
        [id]
      );
      if (result.rowCount === 0) return { success: false, error: 'Mensagem não encontrada' };
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error.message);
      return { success: false, error: error.message };
    }
  },

  deleteAllMessages: async () => {
    try {
      const result = await pool.query(
        `UPDATE messages SET status = 'deleted' WHERE status = 'active' RETURNING *`
      );
      return { success: true, data: result.rows, count: result.rowCount };
    } catch (error) {
      console.error('Erro ao excluir todas as mensagens:', error.message);
      return { success: false, error: error.message };
    }
  },

  markAsPrinted: async (id) => {
    try {
      const result = await pool.query(
        `UPDATE messages SET isPrinted = true, printed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id]
      );
      if (result.rowCount === 0) return { success: false, error: 'Mensagem não encontrada' };
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Erro ao marcar mensagem como impressa:', error.message);
      return { success: false, error: error.message };
    }
  },

  getMessagesOrdered: async () => {
    try {
      const result = await pool.query(
        `SELECT * FROM messages WHERE status = 'active'
         ORDER BY CASE WHEN isPrinted = false THEN 0 ELSE 1 END, created_at DESC`
      );
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Erro ao buscar mensagens ordenadas:', error.message);
      return { success: false, error: error.message };
    }
  },

  getStats: async () => {
    try {
      const [total, printed, recipients, recent] = await Promise.all([
        pool.query(`SELECT COUNT(*) as total FROM messages WHERE status = 'active'`),
        pool.query(`SELECT COUNT(*) as printed FROM messages WHERE status = 'active' AND isPrinted = true`),
        pool.query(`SELECT COUNT(DISTINCT destinatario_nome) as recipients FROM messages WHERE status = 'active'`),
        pool.query(`SELECT COUNT(*) as recent FROM messages WHERE status = 'active' AND created_at >= NOW() - INTERVAL '7 days'`)
      ]);
      return {
        success: true,
        data: {
          total: parseInt(total.rows[0].total),
          printed: parseInt(printed.rows[0].printed),
          uniqueRecipients: parseInt(recipients.rows[0].recipients),
          recent: parseInt(recent.rows[0].recent)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error.message);
      return { success: false, error: error.message };
    }
  },

  getMessagesSinceId: async (sinceId, limit = 50) => {
    try {
      const result = await pool.query(
        `SELECT id, remetente_nome, destinatario_nome, mensagem, created_at, printed_at, isprinted
         FROM messages WHERE id > $1 ORDER BY id DESC LIMIT $2`,
        [sinceId, limit]
      );
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Erro ao buscar mensagens desde ID:', error.message);
      return { success: false, error: error.message };
    }
  },

  getUnreadMessagesCount: async () => {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM messages WHERE isprinted = false`
      );
      return { success: true, count: parseInt(result.rows[0].count) };
    } catch (error) {
      console.error('Erro ao buscar contagem de não impressas:', error.message);
      return { success: false, error: error.message };
    }
  },

  getLatestMessages: async (limit = 10) => {
    try {
      const result = await pool.query(
        `SELECT id, remetente_nome, destinatario_nome, created_at, isprinted
         FROM messages ORDER BY id DESC LIMIT $1`,
        [limit]
      );
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Erro ao buscar últimas mensagens:', error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = { messageQueries };
