const express = require('express');
const path = require('path');

const app = express();
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
const root = __dirname;

function sendHtml(file) {
  return (req, res) => res.sendFile(path.join(root, file));
}

// Static assets (css, js, images, icons, etc.)
app.use(BASE_PATH + '/', express.static(root));

// Flow pages
app.get(BASE_PATH + '/lp-page', sendHtml('lp-page.html'));
app.get(BASE_PATH + '/lp-page.html', sendHtml('lp-page.html'));
app.get(BASE_PATH + '/otp', sendHtml('otp.html'));
app.get(BASE_PATH + '/otp.html', sendHtml('otp.html'));
app.get(BASE_PATH + '/thankyou', sendHtml('thankyou.html'));
app.get(BASE_PATH + '/thankyou.html', sendHtml('thankyou.html'));

// Named HTML pages
app.get(BASE_PATH + '/moreGames.html', sendHtml('moreGames.html'));
app.get(BASE_PATH + '/myAccount.html', sendHtml('myAccount.html'));
app.get(BASE_PATH + '/termsAndConditions.html', sendHtml('termsAndConditions.html'));

// Root
app.get(BASE_PATH + '/', sendHtml('index.html'));
if (BASE_PATH) app.get(BASE_PATH, sendHtml('index.html'));

// Catch-all → index.html
app.get('*', sendHtml('index.html'));

// Local dev server
if (require.main === module) {
  const PORT = process.env.PORT || 5055;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AiGameopedia running on http://localhost:${PORT}`);
  });
}

module.exports = app;
