const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { messageQueries } = require('../models/messageQueries');

const router = express.Router();

// ── Rotas públicas ──────────────────────────────────────────

// GET /api/messages — lista todas (front-end já protege o acesso)
router.get('/', async (req, res) => {
  try {
    const result = await messageQueries.getAllMessages();
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, count: result.data.length, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar mensagens' });
  }
});

// GET /api/stats
router.get('/stats', async (req, res) => {
  try {
    const result = await messageQueries.getStats();
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar estatísticas' });
  }
});

// POST /api/messages/public — envio público (sem autenticação)
router.post('/public', async (req, res) => {
  try {
    const data = req.body;
    if (!data.remetente_nome || !data.destinatario_nome || !data.mensagem) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando' });
    }
    const result = await messageQueries.saveMessage(data);
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.status(201).json({ success: true, message: 'Mensagem salva com sucesso', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao salvar mensagem' });
  }
});

// ── Rotas protegidas ────────────────────────────────────────

// GET /api/messages/new?since_id=&limit=
router.get('/new', authenticateToken, async (req, res) => {
  try {
    const sinceId = req.query.since_id || 0;
    const limit = req.query.limit || 50;
    const result = await messageQueries.getMessagesSinceId(sinceId, limit);
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, count: result.data.length, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar novas mensagens' });
  }
});

// GET /api/messages/ordered
router.get('/ordered', authenticateToken, async (req, res) => {
  try {
    const result = await messageQueries.getMessagesOrdered();
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, count: result.data.length, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar mensagens ordenadas' });
  }
});

// GET /api/messages/unread-count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await messageQueries.getUnreadMessagesCount();
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, count: result.count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar contagem' });
  }
});

// GET /api/messages/latest
router.get('/latest', authenticateToken, async (req, res) => {
  try {
    const result = await messageQueries.getLatestMessages();
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, count: result.data.length, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar últimas mensagens' });
  }
});

// POST /api/messages (protegido)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    if (!data.remetente_nome || !data.destinatario_nome || !data.mensagem) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando' });
    }
    const result = await messageQueries.saveMessage(data);
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.status(201).json({ success: true, message: 'Mensagem salva com sucesso', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao salvar mensagem' });
  }
});

// PUT /api/messages/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await messageQueries.updateMessage(req.params.id, req.body);
    if (!result.success) return res.status(404).json({ success: false, error: result.error });
    res.json({ success: true, message: 'Mensagem atualizada com sucesso', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao atualizar mensagem' });
  }
});

// PUT /api/messages/:id/printed
router.put('/:id/printed', authenticateToken, async (req, res) => {
  try {
    const result = await messageQueries.markAsPrinted(req.params.id);
    if (!result.success) return res.status(404).json({ success: false, error: result.error });
    res.json({ success: true, message: 'Mensagem marcada como impressa', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao marcar como impressa' });
  }
});

// DELETE /api/messages (todas)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const result = await messageQueries.deleteAllMessages();
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, message: `${result.count} mensagens excluídas com sucesso`, count: result.count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao excluir mensagens' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await messageQueries.deleteMessage(req.params.id);
    if (!result.success) return res.status(404).json({ success: false, error: result.error });
    res.json({ success: true, message: 'Mensagem excluída com sucesso', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao excluir mensagem' });
  }
});

module.exports = router;
