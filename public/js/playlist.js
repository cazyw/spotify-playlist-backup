/**
   * Retrieve playlist data from Spotify
   */

import { getMe, getPlaylists } from './spotify.js';
import { getOrRemoveTracks } from './tracks.js';
import { removeActiveClass, addActiveClass, errorHandler } from './helpers.js';

let userPlaylists = [];
let accessToken;

// After authentication, get and display the user's playlists
const accessPlaylist = async (token) => {
  accessToken = token;
  document.querySelector('input').addEventListener('keyup', getInput);
  try {
    const user = await getMe(token);
    removeActiveClass('#loading', addActiveClass, '#loggedin');
    document.querySelector('.display-name').textContent = user.id;
    document.querySelector(".playlists").innerHTML = '<p class="loading"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></p>';

    userPlaylists = await getPlaylists(token);
    document.querySelector('.number-of-playlists').textContent = userPlaylists.length;
    displayUserPlaylists(userPlaylists);
  } catch (e) {
    errorHandler(e);
  }
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
    // Spotify gives no track count for playlists the user does not own
    const numTracks = playlist.totalTracks === null ? '' : `<span class="playlist-num-tracks"> [${playlist.totalTracks} tracks]</span>`;
    return `
      <li id="${playlist.id}" class="playlist">
        <div class="playlist-info">
          <div class="playlist-name">${playlist.name}${numTracks}</div>
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
    list.addEventListener('click', () => getOrRemoveTracks(list.parentNode.id, accessToken));
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
    displayUserPlaylists(userPlaylists);
  } else {
    displayUserPlaylists(filterPlaylist(this.value.toLowerCase()));
  }
}

export {
  accessPlaylist
}