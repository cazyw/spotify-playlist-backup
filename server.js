import { createApp } from './app.js';

const port = process.env.PORT || 8888;

const app = createApp({
  clientId: process.env.CLIENT_ID, // Your client id
  clientSecret: process.env.CLIENT_SECRET, // Your secret
  redirectUri: process.env.REDIRECT_URI // Your redirect uri
});

app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});
