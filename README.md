# Omedeto — Sistema de Reconhecimento RH

Sistema web para envio e gestão de mensagens de reconhecimento entre colaboradores. O front-end é estático (HTML/CSS/JS) e o back-end é uma API REST em Node.js + Express, conectada ao banco de dados PostgreSQL gerenciado pelo [Neon](https://neon.tech).

---

## Estrutura do Projeto

```
omedeto/
├── back-end/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Conexão e criação de tabelas (Neon/PostgreSQL)
│   │   ├── middleware/
│   │   │   └── auth.js           # Middleware de autenticação JWT
│   │   ├── models/
│   │   │   └── messageQueries.js # Queries CRUD para a tabela messages
│   │   └── routes/
│   │       ├── auth.js           # Rotas de login e verificação de token
│   │       └── messages.js       # Rotas de mensagens (públicas e protegidas)
│   ├── .env                      # Variáveis de ambiente (não versionar!)
│   ├── .env.example              # Modelo de variáveis de ambiente
│   ├── package.json
│   └── server.js                 # Ponto de entrada da aplicação
│
└── front-end/
    ├── config.js                 # URL base da API (altere conforme o ambiente)
    ├── index.html                # Página inicial
    ├── login.html                # Login do RH
    ├── mensagem.html             # Formulário público de envio
    ├── rh.html                   # Painel administrativo RH
    ├── fonts/                    # Fontes locais
    └── styles/                   # Folhas de estilo
```

---

## Configuração

### 1. Variáveis de Ambiente (back-end)

Copie o arquivo de exemplo e preencha com os seus valores:

```bash
cd back-end
cp .env.example .env
```

| Variável         | Descrição                                              | Exemplo                          |
|------------------|--------------------------------------------------------|----------------------------------|
| `DATABASE_URL`   | String de conexão Neon PostgreSQL                      | `postgresql://user:pass@host/db` |
| `JWT_SECRET`     | Chave secreta para assinar tokens JWT                  | `uma_string_longa_e_aleatória`   |
| `ADMIN_EMAIL`    | Usuário de login do RH                                 | `rh.admin`                       |
| `ADMIN_PASSWORD` | Senha do usuário RH                                    | `sua_senha_segura`               |
| `PORT`           | Porta do servidor                                      | `3001`                           |
| `NODE_ENV`       | Ambiente (`development` / `production`)                | `development`                    |
| `API_URL`        | URL pública da API (usada na página inicial e logs)    | `https://omedeto.onrender.com`   |
| `CORS_ORIGIN`    | Origens permitidas separadas por vírgula               | `http://localhost:5501,...`      |

### 2. URL da API (front-end)

Abra o arquivo `front-end/config.js` e altere a variável `API_BASE_URL`:

```js
// Desenvolvimento
const API_BASE_URL = 'http://localhost:3001/api';

// Produção
const API_BASE_URL = 'https://omedeto.onrender.com/api';
```

> Todos os arquivos HTML importam esse `config.js` e utilizam `API_BASE_URL` automaticamente — não é necessário editar cada página individualmente.

---

## Instalação e Execução

### Back-end

```bash
cd back-end
npm install

# Modo desenvolvimento (com hot-reload)
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em `http://localhost:3001`.

### Front-end

Por ser estático, basta abrir os arquivos em qualquer servidor HTTP local. Exemplos:

```bash
# Com VS Code Live Server — abra o index.html e clique em "Go Live"

# Com npx serve
cd front-end
npx serve .

# Com Python
python3 -m http.server 5501
```

---

## Endpoints da API

### Públicos

| Método | Rota                      | Descrição                         |
|--------|---------------------------|-----------------------------------|
| GET    | `/api/health`             | Status do servidor e banco        |
| POST   | `/api/login`              | Autenticação (retorna JWT)        |
| GET    | `/api/messages`           | Listar todas as mensagens ativas  |
| GET    | `/api/stats`              | Estatísticas gerais               |
| POST   | `/api/messages/public`    | Enviar mensagem (sem autenticação)|

### Protegidos (requerem `Authorization: Bearer <token>`)

| Método | Rota                           | Descrição                              |
|--------|--------------------------------|----------------------------------------|
| GET    | `/api/verify-token`            | Verificar validade do token            |
| POST   | `/api/messages`                | Criar mensagem (admin)                 |
| PUT    | `/api/messages/:id`            | Editar mensagem                        |
| PUT    | `/api/messages/:id/printed`    | Marcar mensagem como impressa          |
| DELETE | `/api/messages/:id`            | Excluir mensagem (soft delete)         |
| DELETE | `/api/messages`                | Excluir todas as mensagens             |
| GET    | `/api/messages/ordered`        | Mensagens (não impressas primeiro)     |
| GET    | `/api/messages/new?since_id=`  | Mensagens desde um ID (notificações)   |
| GET    | `/api/messages/unread-count`   | Contagem de mensagens não impressas    |
| GET    | `/api/messages/latest`         | Últimas 10 mensagens                   |

---

## Deploy

O projeto está configurado para deploy no [Render](https://render.com):

- **Back-end:** `https://omedeto.onrender.com`
- **Front-end:** `https://omedeto-front-end.onrender.com`

Para outras plataformas (Railway, Fly.io, etc.), basta ajustar as variáveis de ambiente e o `API_BASE_URL` no `config.js`.

---

## Tecnologias

| Camada     | Tecnologia               |
|------------|--------------------------|
| Front-end  | HTML, CSS, JavaScript    |
| Back-end   | Node.js, Express         |
| Banco      | PostgreSQL (Neon)        |
| Autenticação | JWT (jsonwebtoken)     |
| Deploy     | Render                   |
