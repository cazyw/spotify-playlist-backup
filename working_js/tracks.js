/**
   * Retrieve track data from Spotify
   */

var SpotifyWebApi = require('spotify-web-api-js');
var spotifyApi = new SpotifyWebApi();
var playlistTracks = [];

function retrieveTracks(listOwner, listID, noTracks) {
  var promises = [];
  console.log('== start retrieving all the tracks ==');
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
  .then(console.log('== finished retrieving all the tracks =='))
  .catch((e) => {
    console.error(e);
  });
}




function toggleTracks(tracks) {
  tracks[0].parentNode.classList.toggle('hide');
  console.log('== toggling the display of tracks ==');
}

function displayUserTracks(playlist, tracks){
  console.log(`== start displaying ${tracks.length} tracks ==`);
  const playlistSelected = document.getElementById(`track-info-${playlist}`);
 
  let displayLI = tracks.map((track) => {

      return `<tr class="tracks-${playlist}">
        <td class="track-name">${track.name}</td> 
        <td class="track-album">${track.album}</td> 
        <td class="track-artists">${track.artists}</td>
      </tr>`;
    }).join('');

    document.getElementById(`track-info-${playlist}`).innerHTML = `<table class="track-table"> 
        <tr class="track-heading">
          <th class="track-name">Name</th>
          <th class="track-album">Album</th>
          <th class="track-artists">Artists</th>
        </tr>
        ${displayLI} 
      </table>`;
}

function showOrHideTracks(playlistIDCombo, noTracks) {
  const hasTracks = document.getElementsByClassName(`tracks-${playlistIDCombo}`);
  if (hasTracks.length > 0){
    toggleTracks(hasTracks);
  } else {
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

module.exports = {
  showOrHideTracks
}