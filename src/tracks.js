/**
   * Retrieve track data from Spotify
   */

import { getPlaylistItems } from './spotify.js';
import { removeActiveClass, addActiveClass, errorHandler } from './helpers.js';


// either retrieves or removes tracks

const getOrRemoveTracks = (playlistID, token) => {
  const trackInfo = document.getElementById(`track-info-${playlistID}`);
  if (trackInfo.innerHTML !== ''){
    trackInfo.innerHTML = '';
    removeActiveClass(`#track-info-${playlistID}`);
  } else {
    addActiveClass(`#track-info-${playlistID}`);
    trackInfo.innerHTML = `<p class="loading"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></p>`;
    showTracks(playlistID, token);
  }
}

// retrieves then displays tracks

const showTracks = async (playlistID, token) => {
  try {
    const tracks = await getPlaylistItems(playlistID, token);
    if (tracks === null) {
      document.getElementById(`track-info-${playlistID}`).innerHTML = `<p class="tracks-unavailable">Tracks are not available. Spotify only shares the tracks of playlists you own or collaborate on.</p>`;
    } else {
      displayUserTracks(playlistID, tracks);
    }
  } catch (e) {
    errorHandler(e);
  }
}


// formats the track details
const getTrackBody = (playlist, tracks) => {
  let displayLI = tracks.map((track) => {
    return `<tr class="tracks-${playlist}">
      <td class="track-name">${track.name}</td> 
      <td class="track-album">${track.album}</td> 
      <td class="track-artists">${track.artists.join('; ')}</td>
    </tr>`;
  }).join('');

  return displayLI;
}

// displays the track details
const displayUserTracks = (playlist, tracks) => {
  console.log(`== displaying ${tracks.length} tracks ==`);
  const playlistSelected = document.getElementById(`track-info-${playlist}`);
 
  document.getElementById(`track-info-${playlist}`).innerHTML = `<table class="track-table"> 
      <tr class="track-heading">
        <th class="track-name">Name</th>
        <th class="track-album">Album</th>
        <th class="track-artists">Artists <span id="dl-${playlist}" class="download"><i class="fa fa-download" aria-hidden="true"></i></span></th>
      </tr>
      ${getTrackBody(playlist, tracks)} 
    </table>`;

  // add listener for clicking to download
  const trackHeading = document.getElementById(`dl-${playlist}`);
  addActiveClass(`#track-info-${playlist}`);
  trackHeading.addEventListener('click', downloadTracks.bind(this, playlist));
}


const getTrackInfo = (playlistCombo, selector) => {
  return document.getElementById(playlistCombo).querySelector('.playlist-info').querySelector(selector).textContent;
}

// function to download tracks to csv file
function downloadTracks(playlistCombo) {
  console.log(`== downloading tracks ==`);
  const owner = getTrackInfo(playlistCombo, '.playlist-owner');
  const nameAndNum = getTrackInfo(playlistCombo, '.playlist-name');
  let csv = `${owner}, Playlist Name: ${nameAndNum}\n`;
  csv += "Name,Album,Artists\n";

  const playlist = document.querySelectorAll(`.tracks-${playlistCombo}`);

  playlist.forEach((track) => {
    csv += `${Array.from(track.children)[0].textContent},${Array.from(track.children)[1].textContent},${Array.from(track.children)[2].textContent}`;
    csv += `\n`;
  });

  const hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'playlist.csv';
  hiddenElement.click();

}

export {
  getOrRemoveTracks
}