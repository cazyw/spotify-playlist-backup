/**
 * The code here was from Spotify's authentication workflow and then modified
 *
 * It performs the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

import { randomBytes } from 'node:crypto';
import express from 'express'; // Express web server framework
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const stateKey = 'spotify_auth_state';

// helmet's default policy is not used because it adds upgrade-insecure-requests,
// which breaks the page when it is served over http on 127.0.0.1
const contentSecurityPolicy = {
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://maxcdn.bootstrapcdn.com'],
    fontSrc: ['https://cdnjs.cloudflare.com'],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ['https://api.spotify.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"]
  }
};

// `fetch` can be replaced so tests do not call Spotify
export const createApp = ({ clientId, clientSecret, redirectUri, fetch: fetchFn = fetch }) => {
  const app = express();

  // the browser sends the state cookie back on the redirect from Spotify
  // because that is a top-level navigation, which sameSite 'lax' allows
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: redirectUri.startsWith('https:')
  };

  // function for when there's an error linking with Spotify
  const errorAction = (res, msg, err) => {
    res.clearCookie(stateKey, cookieOptions);
    console.error(msg);
    if (err) console.error(err);
    res.redirect('/');
  }

  // the static files are in the public folder
  app.use(helmet({ contentSecurityPolicy }))
     .use(express.static(import.meta.dirname + '/public'))
     .use(cookieParser());

  // redirects to Spotify's login and authorisation page
  const authorise = (res, showDialog) => {
    // set cookie; the state is used for verification
    const state = randomBytes(16).toString('hex');
    res.cookie(stateKey, state, { ...cookieOptions, maxAge: 10 * 60 * 1000 });

    // your application requests authorization
    // scope has been set to 'playlist-read-private playlist-read-collaborative'
    // which means you can read playlists you've marked private
    // or that you've collaborated on
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'playlist-read-private playlist-read-collaborative',
      state: state, // recommended for validation purposes
      show_dialog: showDialog
    })

    res.redirect('https://accounts.spotify.com/authorize?' + params);
  };

  // the user selects to login; show_dialog is false
  // so users do not have to re-login/authenticate
  app.get('/login', (req, res) => authorise(res, false));

  // since there's no real way of logging out from the
  // spotify web API, the work around is to direct users to
  // authorisation page where they can select "Not you?"
  // the alternative logout endpoint does not redirect back to
  // this app so cannot be used
  app.get('/logout', (req, res) => authorise(res, true));

  // after the authorisation page, the user is then redirected
  // back to a 'middle' uri where, if the user has authorised
  // access to their account, a request is sent for access tokens
  app.get('/callback', async (req, res) => {
    // your application requests access tokens
    // after checking the state parameter (it should return
    // the same value as was sent in the original request)

    const { code, state } = req.query;
    const storedState = req.cookies[stateKey];

    if (code === undefined) {
      // if the user hits Cancel on the authorisation page
      return errorAction(res, 'Authorisation not granted - redirecting to login');
    }

    if (!state || state !== storedState) {
      // if there's an error with the state
      return errorAction(res, 'State sent did not match the state received - redirecting to login');
    }

    // success - therefore exchange the authorisation code for an access token
    res.clearCookie(stateKey, cookieOptions);

    try {
      const response = await fetchFn('https://accounts.spotify.com/api/token', {
        method: 'post',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri // for validation only
        })
      });

      if (!response.ok) {
        throw new Error(`response was status ${response.status}`);
      }

      const { access_token } = await response.json();

      // redirect and pass the token to the browser to make requests from there
      res.redirect('/#' + new URLSearchParams({ access_token }));
    } catch (err) {
      errorAction(res, 'Error retrieving the access token - redirecting to login', err);
    }
  });

  return app;
};
