const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5055;
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
const root = __dirname;

function sendHtml(file) {
  return (req, res) => res.sendFile(path.join(root, file));
}

// Flow pages
app.get(BASE_PATH + '/lp-page', sendHtml('lp-page.html'));
app.get(BASE_PATH + '/lp-page.html', sendHtml('lp-page.html'));
app.get(BASE_PATH + '/otp', sendHtml('otp.html'));
app.get(BASE_PATH + '/otp.html', sendHtml('otp.html'));
app.get(BASE_PATH + '/thankyou', sendHtml('thankyou.html'));
app.get(BASE_PATH + '/thankyou.html', sendHtml('thankyou.html'));

// Root static files
app.use(BASE_PATH + '/', express.static(root));
// Root HTML
app.get(BASE_PATH + '/', sendHtml('index.html'));
if (BASE_PATH) {
  app.get(BASE_PATH, sendHtml('index.html'));
}

app.listen(PORT, '0.0.0.0', () => {
  const host = `http://localhost:${PORT}`;
  const base = host + BASE_PATH;
  console.log(`AiGameopedia running on port ${PORT}`);
  console.log(`  URL: ${base}/`);
  if (BASE_PATH) console.log(`  (BASE_PATH=${BASE_PATH})`);
});
