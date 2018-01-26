/**
   * Retrieve track data from Spotify
   */

const SpotifyWebApi = require('spotify-web-api-js');
const removeActiveClass = require('./helpers.js').removeActiveClass;
const addActiveClass = require('./helpers.js').addActiveClass;
const errorHandler = require('./helpers.js').errorHandler;

const spotifyApi = new SpotifyWebApi();
let playlistTracks = [];

function showOrHideTracks(playlistID, owner, noTracks) {
  const hasTracks = document.getElementsByClassName(`tracks-${playlistID}`);
  if (hasTracks.length > 0){
    document.getElementById(`track-info-${playlistID}`).innerHTML = '';
    removeActiveClass(`#track-info-${playlistID}`);
  } else {
    addActiveClass(`#track-info-${playlistID}`);
    document.getElementById(`track-info-${playlistID}`).innerHTML = `<p class="loading black"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></p>`;
    showTracks(playlistID, owner, noTracks);
  }
}

function showTracks(playlistID, owner, noTracks){
  playlistTracks = [];
  return retrieveTracks(playlistID, owner, noTracks)
  .then(function (result) {
    return displayUserTracks(playlistID, playlistTracks)
  })
  .catch((e) => {
    errorHandler(e);
  })
}

function retrieveTracks(playlistID, owner, noTracks) {
  let promises = [];

  console.log('== start retrieving tracks ==');
  for(let i = 0; i < noTracks; i += 100){
    promises.push(spotifyApi.getPlaylistTracks(owner, playlistID, {offset: i})
    .then(function(data){
      const tracks = data.items;
      tracks.forEach((track) => {
        const id = track.track.id;
        const name = track.track.name;
        const album = track.track.album.name;
        const artists = track.track.artists.map((artist) => artist.name);
        playlistTracks.push({id: id, name: name, album: album, artists: artists});
      });
    })
    .catch((e) => {
      return Promise.reject(e);
    })
    )
  }
  return Promise.all(promises)
  // .then(removeActiveClass(`#track-info-${playlistID}`))
  .then(console.log('== finished retrieving tracks =='))
  .catch((e) => {
    return Promise.reject(e);
  });
}

function displayUserTracks(playlist, tracks){
  console.log(`== displaying ${tracks.length} tracks ==`);
  const playlistSelected = document.getElementById(`track-info-${playlist}`);
 
  let displayLI = tracks.map((track) => {
      return `<tr class="tracks-${playlist}">
        <td class="track-name">${track.name}</td> 
        <td class="track-album">${track.album}</td> 
        <td class="track-artists">${track.artists.join('; ')}</td>
      </tr>`;
    }).join('');

    document.getElementById(`track-info-${playlist}`).innerHTML = `<table class="track-table"> 
        <tr class="track-heading">
          <th class="track-name">Name</th>
          <th class="track-album">Album</th>
          <th class="track-artists">Artists <span id="dl-${playlist}" class="download"><i class="fa fa-download" aria-hidden="true"></i></span></th>
        </tr>
        ${displayLI} 
      </table>`;
    const trackHeading = document.getElementById(`dl-${playlist}`);
    addActiveClass(`#track-info-${playlist}`);
    trackHeading.addEventListener('click', downloadTracks.bind(this, playlist));
}

function downloadTracks(playlistCombo) {
  console.log(`== downloading tracks ==`);
  const owner = document.getElementById(playlistCombo).querySelector('.playlist-info').querySelector('.playlist-owner').textContent;
  const name = document.getElementById(playlistCombo).querySelector('.playlist-info').querySelector('.playlist-name').textContent;
  const numTracks = document.getElementById(playlistCombo).querySelector('.playlist-info').querySelector('.playlist-no-tracks').textContent;
  let csv = `Playlist Owner: ${owner}, Playlist Name: ${name}, Number of tracks: ${numTracks}\n`;
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

module.exports = {
  showOrHideTracks
}