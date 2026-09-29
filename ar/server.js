const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5055;
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
const root = __dirname;

function sendHtml(file) {
  return (req, res) => res.sendFile(path.join(root, file));
}

// Arabic uses the same files. Country code is +966 only.
app.use((req, res, next) => {
  if (req.path === '/ar' || req.path.startsWith('/ar/')) {
    const cleaned = req.path.replace(/^\/ar(?=\/|$)/, '') || '/';
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(302, cleaned + query);
  }
  next();
});

// All routes that must work for /ar
const arRoutes = express.Router();
arRoutes.get('/', sendHtml('index.html'));
arRoutes.get('/index.html', sendHtml('index.html'));
arRoutes.get('/moreGames.html', sendHtml('moreGames.html'));
arRoutes.get('/myAccount.html', sendHtml('myAccount.html'));
arRoutes.get('/termsAndConditions.html', sendHtml('termsAndConditions.html'));
// Static assets under /ar (e.g. /ar/main.js, /ar/style.css)
arRoutes.use(express.static(root));

app.get(BASE_PATH + '/ar', sendHtml('index.html'));
app.get(BASE_PATH + '/ar/', sendHtml('index.html'));
app.use(BASE_PATH + '/ar', arRoutes);

// Proxy: /api/checkstatus?serviceid=...&msisdn=...
app.get(BASE_PATH + '/api/checkstatus', (req, res) => {
  const { serviceid, msisdn } = req.query;
  if (!serviceid || !msisdn) return res.status(400).json({ status: 'error', message: 'Missing params' });
  const url = `https://wap.zeendcb.com/vaspay/checkstatus?serviceid=${encodeURIComponent(serviceid)}&msisdn=${encodeURIComponent(msisdn)}`;
  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch { res.status(502).json({ status: 'error' }); }
    });
  }).on('error', () => res.status(502).json({ status: 'error' }));
});

// Proxy: /api/subscriptioninfo?serviceid=...&msisdn=...
app.get(BASE_PATH + '/api/subscriptioninfo', (req, res) => {
  const { serviceid, msisdn } = req.query;
  if (!serviceid || !msisdn) return res.status(400).json({ status: 'error', message: 'Missing params' });
  const url = `https://wap.zeendcb.com/vaspay/subscriptioninfo?serviceid=${encodeURIComponent(serviceid)}&msisdn=${encodeURIComponent(msisdn)}`;
  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch { res.status(502).json({ status: 'error' }); }
    });
  }).on('error', () => res.status(502).json({ status: 'error' }));
});

// Proxy: /api/unsubscribe -> TPay KSA cancel-subscription
// Body: { "msisdn": "9665XXXXXXXX", "serviceId": "1035" }
app.post(BASE_PATH + '/api/unsubscribe', (req, res) => {
  const serviceId = String((req.body && req.body.serviceId) || '').trim();
  let msisdn = String((req.body && req.body.msisdn) || '').replace(/\D/g, '').replace(/^00/, '');
  if (msisdn && !msisdn.startsWith('966')) msisdn = '966' + msisdn.replace(/^0+/, '');
  if (!serviceId || !/^9665\d{8}$/.test(msisdn)) {
    return res.status(400).json({ status: false, message: 'Missing or invalid params' });
  }
  const body = JSON.stringify({ msisdn, serviceId });
  const options = {
    hostname: 'wap.zeendcb.com',
    path: '/vaspay/tpayksalebara/cancel-subscription',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  };
  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch { res.status(502).json({ status: false }); }
    });
  });
  apiReq.on('error', () => res.status(502).json({ status: false }));
  apiReq.write(body);
  apiReq.end();
});

// Root static files
app.use(BASE_PATH + '/', express.static(root));
// Root HTML
app.get(BASE_PATH + '/', sendHtml('index.html'));
if (BASE_PATH) {
  app.get(BASE_PATH, sendHtml('index.html')); // /portal without trailing slash
}

app.listen(PORT, '0.0.0.0', () => {
  const host = `http://localhost:${PORT}`;
  const base = host + BASE_PATH;
  console.log(`AiGameopedia running on port ${PORT}`);
  console.log(`  English: ${base}/`);
  console.log(`  Arabic:  ${base}/ar`);
  if (BASE_PATH) console.log(`  (BASE_PATH=${BASE_PATH})`);
});
