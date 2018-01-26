const accessPlaylist = require('./playlist.js').accessPlaylist;
const removeClass = require('./helpers.js').removeClass;
const addClass = require('./helpers.js').addClass;
const errorHandler = require('./helpers.js').errorHandler;

/**
 * The code here was from Spotify's authentication workflow and then modified
 */

/**
   * Obtains parameters from the hash of the URL
   * @return Object
   */

// gets the has (part from # onwards)
// theoretically should be only access_token
const getHashParams = () => {
  let hashParams = {};
  let result = [], 
      pattern = /#([^&;=]+)=?([^&;]*)/g,
      anchor = window.location.hash;

  if (anchor !== '') {
    result = pattern.exec(anchor);
    hashParams[result[1]] = decodeURIComponent(result[2]);
  }
  return hashParams;
}

/**
   * Authentication with Spotify
   */

const authenticate = () => {
  const params = getHashParams();

  const access_token = params.access_token,
        error = params.error;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
      removeClass('#login', addClass, '#loading');
      accessPlaylist(access_token);
    } else {
        // render initial screen
        removeClass('#loggedin', addClass, '#login');
    }
  }
}

authenticate();
