console.log('starting console log');

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
          // userProfilePlaceholder.innerHTML = userProfileTemplate(response);
          inPlaylist(access_token, response.id);
          document.getElementById('loading').classList.remove('active');
          document.querySelector('.display-name').textContent = response.id;
          document.getElementById('loggedin').classList.add('active');
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

/**
   * Retrieve data from Spotify
   */

var SpotifyWebApi = require('spotify-web-api-js');

var userPlaylists = [];
var noPlaylists = 0;
var spotifyApi = new SpotifyWebApi();

function inPlaylist(token, id){
  spotifyApi.setAccessToken(token);
  var step = 0;
  return new Promise(function(resolve, reject) {
      resolve(1);
  })
  .then(function (result) {
    return Promise.resolve(
      spotifyApi.getUserPlaylists(id)
        .then(function(data) {
          console.log(`== Resolve ${++step} ==`);
          console.log(`Number of playlists: ${data.total}, ${Math.ceil(data.total / 20)} loops`)
          noPlaylists = data.total
        }, function(err){
          console.error(err);
        })
    )
  })
  .then(function (result) {
    return Promise.resolve(
      getAllUserPlaylists(++step, id)
    )
  })
  .then(function (result) {
    return Promise.resolve(
      displayUserPlaylists(userPlaylists, ++step)
    )
  })
      .then(function (result) {
          console.log('Ending demo ');
          return Promise.resolve(step);
      })
}

function getAllUserPlaylists(step, id) {
  console.log(`== Resolve ${step} ==`);
  var promises = [];
  for(let i = 0; i < (noPlaylists) ; i += 20){
    promises.push(spotifyApi.getUserPlaylists(id, {offset: i})
    .then(function(data){
      // console.log(i);
      // console.log(data.items);
      const playlists = data.items;
      playlists.forEach(function(playlist) {
        userPlaylists.push({name:playlist.name, id:playlist.id, totalTracks: playlist.tracks.total});
      });
    })
    .catch((e) => {
      // handle errors here
      console.error(e);
    })
    )
  }
  return Promise.all(promises)
  .then('finished')
  .catch((e) => {
    // handle errors here
    console.error(e);
  });
}


function displayUserPlaylists(playlists, step){
  console.log(`== Resolve ${step} ==`);
  console.log(`== start playlists: ${playlists.length} playlists ==`);
  document.querySelector('.number-of-playlists').textContent = playlists.length;
  let displayLI = playlists.map((playlist) => {
    console.log(playlist.name, playlist.id);
    
    return `
      <li id='${playlist.id}' class='playlist'>${playlist.name} (${playlist.totalTracks} track${playlist.totalTracks!== 1 ? 's' : ''})</li>
    `;
  }).join('');
  document.querySelector('.playlists').innerHTML = displayLI;
  const lists = document.querySelectorAll('.playlist');
  lists.forEach((list) => {
    list.addEventListener('click', showTracks.bind(this, list.id));
  } );
  console.log(`== end playlists ==`);
}

function showTracks(id){
  console.log(`tracks for ${id}`);
}

// spotifyApi.getPlaylistTracks('elliedub', playlist.id)
// .then(function(data){
//   let tracks = data.items;
//   tracks.forEach((track) => {
//     let name = track.track.name;
//     let album = track.track.album.name;
//     let artists = track.track.artists.map((artist) => artist.name);
//     console.log(name, album, artists);
//   });
// });



/**
   * Search playlists for a particular playlist
   */

const filterPlaylist = (word) =>{
  return userPlaylists.filter(playlist => playlist.name.toLowerCase().includes(word));
}

function getInput() {
  if (this.value === ""){
    displayUserPlaylists(userPlaylists, 0);
  } else {
    displayUserPlaylists(filterPlaylist(this.value), 0);
  }
}

const input = document.querySelector('input');
input.addEventListener('keyup', getInput);