/**
   * Retrieve track data from Spotify
   */

var SpotifyWebApi = require('spotify-web-api-js');
var removeClass = require('./helpers.js').removeClass;
var addClass = require('./helpers.js').addClass;
var errorHandler = require('./helpers.js').errorHandler;

var spotifyApi = new SpotifyWebApi();
var playlistTracks = [];

function showOrHideTracks(playlistID, owner, noTracks) {
  const hasTracks = document.getElementsByClassName(`tracks-${playlistID}`);
  if (hasTracks.length > 0){
    document.getElementById(`track-info-${playlistID}`).innerHTML = '';
    removeClass(`#track-info-${playlistID}`);
  } else {
    document.getElementById(`track-info-${playlistID}`).innerHTML = `<p class="loading black"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></p>`;
    addClass(`#track-info-${playlistID}`);
    showTracks(playlistID, owner, noTracks);
  }
}

function showTracks(playlistID, owner, noTracks){
  playlistTracks = [];
  return new Promise(function(resolve, reject) {
    resolve(retrieveTracks(playlistID, owner, noTracks));
  })
  .then(function (result) {
    return Promise.resolve(
      displayUserTracks(playlistID, playlistTracks)
    )
  })
  .catch((e) => {
    errorHandler(e);
  })
}

function retrieveTracks(playlistID, owner, noTracks) {
  var promises = [];

  console.log('== start retrieving tracks ==');
  for(let i = 0; i < noTracks; i += 100){
    promises.push(spotifyApi.getPlaylistTracks(owner, playlistID, {offset: i})
    .then(function(data){
      const tracks = data.items;
      tracks.forEach((track) => {
        let id = track.track.id;
        let name = track.track.name;
        let album = track.track.album.name;
        let artists = track.track.artists.map((artist) => artist.name);
        playlistTracks.push({id: id, name: name, album: album, artists: artists});
      });
    })
    .catch((e) => {
      errorHandler(e);
    })
    )
  }
  return Promise.all(promises)
  .then(removeClass(`#track-info-${playlistID}`))
  .then(console.log('== finished retrieving tracks =='))
  .catch((e) => {
    errorHandler(e);
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
    addClass(`#track-info-${playlist}`);
    trackHeading.addEventListener('click', downloadTracks.bind(this, playlist));
}

function downloadTracks(playlistCombo) {
  console.log(`== downloading tracks ==`);
  const owner = document.getElementById(playlistCombo).querySelector('.playlist-info').querySelector('.playlist-owner').textContent;
  const name = document.getElementById(playlistCombo).querySelector('.playlist-info').querySelector('.playlist-name').textContent;
  const numTracks = document.getElementById(playlistCombo).querySelector('.playlist-info').querySelector('.playlist-no-tracks').textContent;
  var csv = `Playlist Owner: ${owner}, Playlist Name: ${name}, Number of tracks: ${numTracks}\n`;
  csv += "Name,Album,Artists\n";

  const playlist = document.querySelectorAll(`.tracks-${playlistCombo}`);

  playlist.forEach((track) => {
    csv += `${Array.from(track.children)[0].textContent},${Array.from(track.children)[1].textContent},${Array.from(track.children)[2].textContent}`;
    csv += `\n`;
  });

  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'playlist.csv';
  hiddenElement.click();

}

module.exports = {
  showOrHideTracks
}