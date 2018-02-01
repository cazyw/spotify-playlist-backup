/**
   * Retrieve playlist data from Spotify
   */

const SpotifyWebApi = require('spotify-web-api-js');
const getOrRemoveTracks = require('./tracks.js').getOrRemoveTracks;
const removeActiveClass = require('./helpers.js').removeActiveClass;
const addActiveClass = require('./helpers.js').addActiveClass;
const errorHandler = require('./helpers.js').errorHandler;

let userPlaylists = [];
let numPlaylists = 0;
const spotifyApi = new SpotifyWebApi();

// After authentication, get and display the user's playlists
const accessPlaylist = (token) => {
  return new Promise(function(resolve, reject){
    resolve(spotifyApi.setAccessToken(token))
  })
  .then(function (result) {
    return getUser()
  })
  .then(function (result) {
    return getUserPlaylistsCount(result)
  })
  .then(function (result) {
    return getAllUserPlaylists(result)
  })
  .then(function (result) {
    return displayUserPlaylists(userPlaylists)
  })
  .catch((e) => {
    errorHandler(e);
  })
}


// get the user id of the user logged in
const getUser = () => {
  return Promise.resolve(spotifyApi.getMe())
  .then(function (response) {
    removeActiveClass('#loading', addActiveClass, '#loggedin');
    document.querySelector('.display-name').textContent = response.id;
    document.querySelector(".playlists").innerHTML = '<p class="loading"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></p>';
    return response.id;
  })
  .catch((e) => {
    return Promise.reject(e);
  })
}

// get a count of the number of playlists
const getUserPlaylistsCount = (userID) => {
  return Promise.resolve(spotifyApi.getUserPlaylists({limit: 1}))
  .then(function (data) {
    numPlaylists = data.total;
    console.log(`Number of playlists: ${data.total}`);
    document.querySelector('.number-of-playlists').textContent = data.total;
    return userID;
  })
  .catch((e) => {
    return Promise.reject(e);
  })
}

// retrieve the logged in user's playlists from Spotify
// save the playlists to the array

const getAllUserPlaylists = (userID) => {
  let promises = [];
  console.log('== start retrieving playlists ==');
  for(let i = 0; i < numPlaylists; i += 20){
    promises.push(spotifyApi.getUserPlaylists(userID, {offset: i})
    .then(function(data){
      const playlists = data.items;
      playlists.forEach(function(playlist) {
        userPlaylists.push({owner: playlist.owner.id, name:playlist.name, id:playlist.id, totalTracks: playlist.tracks.total});
      });
    })
    .catch((e) => {
      return Promise.reject(e);
    })
    ) 
  }
  return Promise.all(promises)
  .then(console.log('== finished retrieving playlists =='))
  // .then(removeActiveClass('.playlists'))
  .catch((e) => {
    return Promise.reject(e);
  });
}

// display the logged in user's playlists
// display the header
// display the body
// add an event listener to each playlist (to show tracks)

const addPlaylistHeader = (playlists) => {
  // header for playlists
  const header = `<li class="playlist-header">
      Playlists
    </li>`;
      // <div class="playlist-owner">Owner</div>
      // <div class="playlist-name">Playlist</div>
      // <div class="playlist-num-tracks">Tracks</div>
  document.querySelector('.playlists').innerHTML = `${header}`; 
}

const addPlaylistBody = (playlists) => {
  // loop through to create LI for each playlist  
  let displayLI = playlists.map((playlist) => {
    return `
      <li id="${playlist.id}" class="playlist">
        <div class="playlist-info">
          <div class="playlist-name">${playlist.name}<span class="playlist-num-tracks"> [${playlist.totalTracks} tracks]</span></div> 
          <div class="playlist-owner">Owned by ${playlist.owner}</div>  
        </div>
        <div id="track-info-${playlist.id}" class="tracks"></div>
      </li>
    `;
  }).join('');
  document.querySelector('.playlists').innerHTML += `${displayLI}`;
  addActiveClass('.playlists');
}

const addPlaylistListener = () => {
  // add a listener for clicking on the playlist
  const lists = document.querySelectorAll('.playlist-info');
  lists.forEach((list) => {
    const owner = list.childNodes[3].textContent.match(/Owned by (.*)/)[1];
    const numTracks = list.childNodes[1].childNodes[1].textContent.match(/([0-9]+) /)[1];
    list.addEventListener('click', getOrRemoveTracks.bind(this, list.parentNode.id, owner, numTracks));
  });
}

const displayUserPlaylists = (playlists) => {
  removeActiveClass('.playlists')
  console.log(`== start displaying playlists ==`);
  setTimeout(() => {
    addPlaylistHeader(playlists);
    addPlaylistBody(playlists);
    addPlaylistListener();
    console.log(`== finish displaying playlists ==`);
  }, 500);
  
}


// search playlists for a particular playlist

const filterPlaylist = (word) => {
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
  accessPlaylist
}