var playlist = require('./playlist.js');

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

function addClass(section){
  document.getElementById(section).classList.add('active');
}

function removeClass(section, callback, param){
  document.getElementById(section).classList.remove('active');
  callback(param);
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
      removeClass('login', addClass, 'loading');

      $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          playlist.inPlaylist(access_token, response.id);
          document.getElementById('loading').classList.remove('active');
          document.querySelector('.display-name').textContent = response.id;
          document.getElementById('loggedin').classList.add('active');
          },
        error: function() {
          alert('token expired, please log in again');
          document.getElementById('loggedin').classList.remove('active');
          document.getElementById('loading').classList.remove('active');
          document.getElementById('login').classList.add('active');
        }
        });
      } else {
        // render initial screen
        document.getElementById('loggedin').classList.remove('active');
        document.getElementById('login').classList.add('active');
    }
  }
}

authenticate();

