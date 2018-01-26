/**
 * The code here was from Spotify's authentication workflow and then modified
 * 
 * It performs the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const dotenv = require('dotenv'); // for local environment variables
const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

dotenv.load();

const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

const port = process.env.PORT || 8888;

const app = express();
const stateKey = 'spotify_auth_state';


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */

// this is used for verification 
const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


// the static files are in the public folder
app.use(express.static(__dirname + '/public'))
   .use(cookieParser());
   

// function for when there's an error linking with Spotify
const errorAction = (res, msg) => {
  res.clearCookie(stateKey);
  console.log(msg);
  res.redirect('/');
}

// the user selects to login and is redirected to
// Spotify's login and authorisation page
app.get('/login', function(req, res) {

  // set cookie
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  // scope has been set to 'playlist-read-private playlist-read-collaborative'
  // which means you can read playlists you've marked private
  // or that you've collaborated on
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      client_id: client_id,
      response_type: 'code',
      redirect_uri: redirect_uri,
      scope: 'playlist-read-private playlist-read-collaborative',
      state: state, // recommended for validation purposes
      show_dialog: true // so users have to re-login/authenticate
    }));
});


// after the authorisation page, the user is then redirected
// back to a 'middle' uri where, if the user has authorised 
// access to their account, a request is sent for access tokens
app.get('/boomerang', function(req, res) {
  
  // your application requests access tokens
  // after checking the state parameter (it should return
  // the same value as was sent in the original request)

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (req.query.code === undefined) {
    // if the user hits Cancel on the authorisation page
    errorAction(res, 'Authorisation not granted - redirecting to login');

  } else if (state === null || state !== storedState) {
    // if there's an error with the state
    errorAction(res, 'State sent did not match the state received - redirecting to login');

  } else {

    // success - therefore set the details to exchange the authorisation code
    // for an access token
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri // for validation only
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    // request the access token
    request.post(authOptions, function(error, response, body) {
      // no errors
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token

        // redirect and pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token
          }));
      } else {
        errorAction(res, 'Error retrieving the access token - redirecting to login');
      }
    });
  }
});

app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});