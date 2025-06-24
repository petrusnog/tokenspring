const express = require('express');
const app = express();
const port = 3000;

// 🟢 Aqui é o lugar certo!
app.use(express.static('public'));

// Configurações adicionais
app.use(express.urlencoded({ extended: true }));

// Suas rotas vêm depois
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Suas rotas vêm depois
app.get('/microsoft', (req, res) => {
  res.sendFile(__dirname + '/views/microsoft.html');
});

app.get('/google', (req, res) => {
  res.sendFile(__dirname + '/views/google.html');
});

app.post('/microsoft/auth', (req, res) => {
  const authUrl = `https://login.microsoftonline.com/${req.tenantId}/oauth2/v2.0/authorize` +
    `?client_id=${req.clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(req.redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes.join(' '))}`;

  // Em vez de abrir localmente, redireciona o navegador do cliente
  res.redirect(authUrl);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});