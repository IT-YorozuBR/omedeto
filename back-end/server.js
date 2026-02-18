require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const messageRoutes = require('./src/routes/messages');

const app = express();

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5501', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.log('CORS bloqueado para origem:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors());

// ── Middlewares ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`${new Date().toLocaleString()} - ${req.method} ${req.url}`);
  next();
});

// ── Rotas ───────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/messages', messageRoutes);

// GET /api/health
app.get('/api/health', async (_req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      success: true,
      service: 'RH Backend API',
      status: 'online',
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Página inicial
app.use(express.static('public'));
app.get('/', (_req, res) => {
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Sistema RH - Backend</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.1); }
    .status { padding: 12px; border-radius: 5px; margin: 15px 0; }
    .online { background: #d4edda; color: #155724; }
    .offline { background: #f8d7da; color: #721c24; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Sistema RH — Backend API</h1>
    <p>API REST para gerenciamento de mensagens de reconhecimento.</p>
    <div id="status" class="status">Verificando status...</div>
    <h3>Endpoints disponíveis</h3>
    <ul>
      <li><code>GET  /api/health</code> — Status do servidor</li>
      <li><code>POST /api/login</code> — Autenticação</li>
      <li><code>GET  /api/verify-token</code> — Validar token (🔒)</li>
      <li><code>GET  /api/messages</code> — Listar mensagens</li>
      <li><code>POST /api/messages/public</code> — Enviar mensagem (público)</li>
      <li><code>GET  /api/messages/new</code> — Novas desde ID (🔒)</li>
      <li><code>GET  /api/stats</code> — Estatísticas</li>
    </ul>
    <p><strong>URL da API:</strong> <code>${apiUrl}</code></p>
    <p><strong>Usuário padrão:</strong> <code>${process.env.ADMIN_EMAIL || 'rh.admin'}</code></p>
  </div>
  <script>
    fetch('/api/health').then(r => r.json()).then(d => {
      const el = document.getElementById('status');
      el.className = 'status ' + (d.success ? 'online' : 'offline');
      el.innerHTML = d.success
        ? \`✅ Online | Banco: \${d.database} | Ambiente: \${d.environment}\`
        : '❌ Servidor offline';
    }).catch(() => {
      document.getElementById('status').className = 'status offline';
      document.getElementById('status').textContent = '❌ Erro ao conectar';
    });
  </script>
</body>
</html>`);
});

// ── Inicialização ───────────────────────────────────────────
const PORT = process.env.PORT || 3001;

async function startServer() {
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.warn('⚠️  Sem banco de dados — funcionando em modo degradado');
  }

  app.listen(PORT, () => {
    console.log(`
  ═══════════════════════════════════════════════
  🚀 Sistema RH Backend iniciado!

  📍 Local:      http://localhost:${PORT}
  🌐 API URL:    ${process.env.API_URL || `http://localhost:${PORT}`}
  🌿 Ambiente:   ${process.env.NODE_ENV || 'development'}
  🗄️  Banco:     ${dbConnected ? '✅ Conectado' : '❌ Desconectado'}

  🔐 Usuário admin: ${process.env.ADMIN_EMAIL || 'rh.admin'}
  ═══════════════════════════════════════════════
    `);
  });
}

startServer();
