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
  res.sendFile(__dirname + '/views/microsoft/index.html');
});

// Suas rotas vêm depois
app.get('/microsoft/callback', (req, res) => {
  res.sendFile(__dirname + '/views/microsoft/callback.html');
});


app.get('/google', (req, res) => {
  res.sendFile(__dirname + '/views/google/index.html');
});

app.post('/microsoft/auth', (req, res) => {
  const scopes = ['offline_access', 'https://outlook.office365.com/SMTP.Send'];
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${baseUrl}`;

  console.log(
    {
      "scopes": scopes,
      "baseUrl": baseUrl,
      "redirectUri": redirectUri,
      "req": req
    }
  );

  const authUrl = `https://login.microsoftonline.com/${req.get('tenantId')}/oauth2/v2.0/authorize` +
    `?client_id=${req.get('clientId')}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes.join(' '))}`;

  // Em vez de abrir localmente, redireciona o navegador do cliente
  res.redirect(authUrl);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});