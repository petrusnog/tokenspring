const express = require('express');
const session = require('express-session');
const axios = require('axios');
const app = express();

// APP CORE CONFIGURATION
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'tokenspring-fresh-new-session', // Coloque uma string aleatória segura
  resave: false, // Não salvar sessão se nada foi modificado
  saveUninitialized: true, // Salvar nova sessão mesmo se vazia
  cookie: { secure: false } // true se for HTTPS; false pra testes locais
}));

/**
 * ROUTES
 */
app.get('/', (req, res) => {
  if (!req.session.baseUrl) {
    req.session.baseUrl = `${req.protocol}://${req.get('host')}`;
  }

  res.sendFile(__dirname + '/views/index.html');
});

// MICROSOFT

app.get('/microsoft', (req, res) => {
  if (!req.session.baseUrl) {
    req.session.baseUrl = `${req.protocol}://${req.get('host')}`;
  }

  res.sendFile(__dirname + '/views/microsoft/index.html');
});

app.post('/microsoft/auth', (req, res) => {
  const { baseUrl } = req.session;
  const scopes = ['offline_access', 'https://outlook.office365.com/SMTP.Send'];
  req.session.scopes = scopes;

  const redirectUri = `${baseUrl}/microsoft/callback`;
  req.session.redirectUri = redirectUri;

  const clientId = req.body.clientId;
  const clientSecret = req.body.clientSecret;
  const tenantId = req.body.tenantId;

  // If some credential is missing, redirect to the error page.
  if (!req.body.clientId || !req.body.clientSecret || !req.body.tenantId) {
    console.log(req.body);
    return res.sendFile(__dirname + '/views/500.html');
  }

  // Saving credentials in session.
  req.session.clientId = clientId;
  req.session.clientSecret = clientSecret;
  req.session.tenantId = tenantId;

  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes.join(' '))}`;

  res.redirect(authUrl);
});

app.get('/microsoft/callback', async (req, res) => {
  const { tenantId, clientId, clientSecret, baseUrl, redirectUri, scopes } = req.session;
  const params = req.query;
  const code = params.code;

  if (!code) {
    return res.sendFile(__dirname + '/views/404.html');
  }

  try {
    console.log(req.session);
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
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }
    );

    res.render('microsoft/callback', {
      baseUrl: baseUrl,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token
    });

  } catch (err) {
    console.log(err);
    let errorMsg = '\nErro ao trocar código por refresh token:' + err.response?.data || err.message;
    console.error(errorMsg);
    res.status(500).send(errorMsg);
  }
});

// GOOGLE

app.get('/google', (req, res) => {
  if (!req.session.baseUrl) {
    req.session.baseUrl = `${req.protocol}://${req.get('host')}`;
  }

  res.sendFile(__dirname + '/views/google/index.html');
});



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


// Route for internal use only
// app.get('/template-editor', (req, res) => {
//   res.render('microsoft/callback', {
//     accessToken: 'dksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajd',
//     refreshToken: 'dksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajddksjdkajkdaksdjaskjdkajd'
//   });
// })