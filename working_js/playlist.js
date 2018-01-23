/**
   * Retrieve playlist data from Spotify
   */


var SpotifyWebApi = require('spotify-web-api-js');
var showOrHideTracks = require('./tracks.js').showOrHideTracks;
var removeClass = require('./helpers.js').removeClass;
var addClass = require('./helpers.js').addClass;
var errorHandler = require('./helpers.js').errorHandler;

var userPlaylists = [];
var noPlaylists = 0;
var spotifyApi = new SpotifyWebApi();

// After authentication, get and display the user's playlists

function inPlaylist(token, userID){
  spotifyApi.setAccessToken(token);
  document.querySelector(".playlists").innerHTML = '<p class="loading"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></p>';
  return new Promise(function(resolve, reject) {
    resolve(spotifyApi.getUserPlaylists());
  })
  .then(function (data) {
    console.log(`Number of playlists: ${data.total}`);
    noPlaylists = data.total;
    document.querySelector('.number-of-playlists').textContent = data.total;
  })
  .then(function (result) {
    return Promise.resolve(
      getAllUserPlaylists(userID)
    )
  })
  .then(function (result) {
    return Promise.resolve(
      displayUserPlaylists(userPlaylists)
    )
  })
  .catch((e) => {
    errorHandler(e);
  })
}

// retrieve the logged in user's playlists from Spotify
// save the playlists to the array

function getAllUserPlaylists(userID) {
  var promises = [];
  console.log('== start retrieving playlists ==');
  for(let i = 0; i < noPlaylists; i += 20){
    promises.push(spotifyApi.getUserPlaylists(userID, {offset: i})
    .then(function(data){
      const playlists = data.items;
      playlists.forEach(function(playlist) {
        userPlaylists.push({owner: playlist.owner.id, name:playlist.name, id:playlist.id, totalTracks: playlist.tracks.total});
      });
    })
    .catch((e) => {
      errorHandler(e);
    })
    ) 
  }
  return Promise.all(promises)
  .then(removeClass('.playlists'))
  .then(console.log('== finished retrieving playlists =='))
  .catch((e) => {
    errorHandler(e);
  });
}

// display the logged in user's playlists

function displayUserPlaylists(playlists){
  
  // header for playlists
  const header = `<li class="playlist-header">
      <div class="playlist-owner">Owner</div>
      <div class="playlist-name">Playlist</div>
      <div class="playlist-no-tracks">Tracks</div>
    </li>`;

  document.querySelector('.playlists').innerHTML = `${header}`; 

  // loop through to create LI for each playlist  
  let displayLI = playlists.map((playlist) => {
    return `
      <li id="${playlist.id}" class="playlist">
        <div class="playlist-info">
          <div class="playlist-owner">${playlist.owner}</div> 
          <div class="playlist-name">${playlist.name}</div> 
          <div class="playlist-no-tracks">${playlist.totalTracks}</div>
        </div>
        <div id="track-info-${playlist.id}" class="tracks"></div>
      </li>
    `;
  }).join('');
  document.querySelector('.playlists').innerHTML += `${displayLI}`;
  addClass('.playlists');

  // add a listener for clicking on the playlist
  const lists = document.querySelectorAll('.playlist-info');
  lists.forEach((list) => {
    const owner = list.childNodes[1].textContent;
    const numTracks = list.childNodes[5].textContent;
    list.addEventListener('click', showOrHideTracks.bind(this, list.parentNode.id, owner, numTracks));
  });
  console.log(`== displaying playlists ==`);
}


/**
   * Search playlists for a particular playlist
   */

function filterPlaylist(word) {
  return userPlaylists.filter(playlist => playlist.name.toLowerCase().includes(word) || playlist.owner.toLowerCase().includes(word));
}

function getInput() {
  if (this.value === ""){
    displayUserPlaylists(userPlaylists, 0);
  } else {
    displayUserPlaylists(filterPlaylist(this.value.toLowerCase()), 0);
  }
}

const input = document.querySelector('input');
input.addEventListener('keyup', getInput);

module.exports = {
  inPlaylist
}