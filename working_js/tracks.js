/**
   * Retrieve track data from Spotify
   */

var SpotifyWebApi = require('spotify-web-api-js');
var spotifyApi = new SpotifyWebApi();
var playlistTracks = [];

function retrieveTracks(listOwner, listID, noTracks) {
  var promises = [];
  console.log('== start retrieving tracks ==');
  for(let i = 0; i < noTracks; i += 100){
    promises.push(spotifyApi.getPlaylistTracks(listOwner, listID, {offset: i})
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
      console.error(e);
    })
    )
  }
  return Promise.all(promises)
  .then(console.log('== finished retrieving tracks =='))
  .catch((e) => {
    console.error(e);
  });
}

function toggleTracks(tracks) {
  tracks[0].parentNode.classList.toggle('hide');
  console.log('== toggling the display of tracks ==');
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
    trackHeading.addEventListener('click', downloadTracks.bind(this, playlist));
}

function showOrHideTracks(playlistIDCombo, noTracks) {
  const hasTracks = document.getElementsByClassName(`tracks-${playlistIDCombo}`);
  if (hasTracks.length > 0){
    toggleTracks(hasTracks);
  } else {
    document.getElementById(`track-info-${playlistIDCombo}`).innerHTML = `<p class="loading black"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></p>`;
    document.getElementById(`track-info-${playlistIDCombo}`).classList.remove('hide');
    showTracks(playlistIDCombo, noTracks);
  }
}

function showTracks(playlistIDCombo, noTracks){
  let listOwner = playlistIDCombo.split('---')[1];
  let listID = playlistIDCombo.split('---')[0];
  playlistTracks = [];
  return new Promise(function(resolve, reject) {
    resolve(1);
  })
  .then(function (result) {
    return Promise.resolve(
      retrieveTracks(listOwner, listID, noTracks)
    )
  })
  .then(function (result) {
    return Promise.resolve(
      displayUserTracks(playlistIDCombo, playlistTracks)
    )
  })
}

function downloadTracks(playlistCombo) {
  console.log(`== downloading ${playlistCombo} ==`);
  const playlist = document.querySelectorAll(`.tracks-${playlistCombo}`);
  var csv = "Name,Album,Artists\n";
  playlist.forEach((track) => {
    csv += `${Array.from(track.children)[0].textContent},${Array.from(track.children)[1].textContent},${Array.from(track.children)[2].textContent}`;
    csv += `\n`;
  });

  console.log(csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'playlist.csv';
  hiddenElement.click();

}

module.exports = {
  showOrHideTracks
}