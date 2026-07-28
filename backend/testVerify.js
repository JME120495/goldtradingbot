const http = require('http');
const https = require('https');

const data = JSON.stringify({
  account: 404999,
  ea: "GOLD_SCALPER"
});

const req = http.request('http://localhost:3000/api/license/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
