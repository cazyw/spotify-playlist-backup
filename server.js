import { createApp } from './app.js';

const port = process.env.PORT || 8888;

const missing = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI'].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = createApp({
  clientId: process.env.CLIENT_ID, // Your client id
  clientSecret: process.env.CLIENT_SECRET, // Your secret
  redirectUri: process.env.REDIRECT_URI // Your redirect uri
});

app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});
