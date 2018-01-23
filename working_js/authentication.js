var inPlaylist = require('./playlist.js').inPlaylist;
var removeClass = require('./helpers.js').removeClass;
var addClass = require('./helpers.js').addClass;
var errorHandler = require('./helpers.js').errorHandler;

/**
 * The code here is from Spotify's authentication workflow and then modified
 * 
 * 
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

/**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}


/**
   * Authentication with Spotify
   */

function authenticate() {

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {

      removeClass('#login', addClass, '#loading');

      $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          inPlaylist(access_token, response.id);
          removeClass('#loading', addClass, '#loggedin');
          document.querySelector('.display-name').textContent = response.id;
          },
        error: function(e) {
          errorHandler(e);
        }
        });
      } else {
        // render initial screen
        removeClass('#loggedin', addClass, '#login');
    }
  }
}

authenticate();
