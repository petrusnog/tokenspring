const express = require('express');
const axios = require('axios');

const open = (...args) => import('open').then(m => m.default(...args));

const app = express();
app.use(express.static(__dirname));
const port = 3000;

// 👇 Copie isso do terminal do ngrok após iniciar o tunnel
const redirectUri = '';

const clientId = '';
const clientSecret = '';
const tenantId = '';
const scopes = ['offline_access', 'https://outlook.office365.com/SMTP.Send'];

app.use(express.urlencoded({ extended: true }));

// Página inicial com botão
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; margin-top: 10%;">
        <h2>Autenticação Microsoft OAuth2</h2>
        <p>Gerador de refresh token</p>
        <form action="/auth" method="POST">
          <button type="submit" style="padding: 1em; font-size: 16px;">Iniciar autenticação</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/auth', (req, res) => {
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes.join(' '))}`;

  // Em vez de abrir localmente, redireciona o navegador do cliente
  res.redirect(authUrl);
});


// Callback que recebe o código de autorização
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('Nenhum código retornado.');

  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: clientId,
        scope: scopes.join(' '),
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        client_secret: clientSecret
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log('\n✅ Access Token:', response.data.access_token);
    console.log('🔁 Refresh Token:', response.data.refresh_token);

    res.send(`
        <html><body style="font-family: sans-serif; text-align: center; margin-top: 20%;">
        <img src="/logo_gpmsolucoes.png" alt="Logo GPM Soluções" width="250">
        <h2>Tokens recebidos!</h2>
        <p>Verifique o console da aplicação.</p>
        <a href="/">Voltar</a>
      </body></html>
    `);
  } catch (err) {
    console.error('\n❌ Erro ao trocar código por tokens:', err.response?.data || err.message);
    res.status(500).send('Erro ao obter tokens. Veja o console.');
  }
});


app.listen(port, () => {
  console.log(`\n🚀 Servidor disponível em: http://localhost:${port}`);
  console.log('🔧 Inicie o tunnel com: ngrok http 3000');
  console.log(`🔁 Depois, copie a URL HTTPS do ngrok e atualize o redirectUri no código`);
});
