import { accessPlaylist } from './playlist.js';
import { removeActiveClass, addActiveClass } from './helpers.js';

/**
 * The code here was from Spotify's authentication workflow and then modified
 */

// gets the hash (part from # onwards)
// theoretically should be only access_token
const getHashParams = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  // take the token out of the address bar and the browser history
  history.replaceState(null, '', window.location.pathname);
  return { access_token: params.get('access_token'), error: params.get('error') };
}

/**
   * Authentication with Spotify
   */


const authenticate = () => {
  const params = getHashParams();

  let access_token = params.access_token,
        error = params.error;

  if (error) {
    console.log('There was an error during the authentication');
    alert('There was an error during the authentication');
    window.location.href = "/";
  } else {
    if (access_token) {
      removeActiveClass('#login', addActiveClass, '#loading');
      accessPlaylist(access_token);
    } else {
        // render initial screen
        removeActiveClass('#loggedin', addActiveClass, '#login');
    }
  }
}

authenticate();
