/**
   * Retrieve track data from Spotify
   */

var SpotifyWebApi = require('spotify-web-api-js');
var spotifyApi = new SpotifyWebApi();
var playlistTracks = [];
var trackOffset = null;

function retrieveTracks(listOwner, listID) {
  console.log('getting tracks');
  return Promise.resolve(
    spotifyApi.getPlaylistTracks(listOwner, listID)
    .then(function(data){
      let tracks = data.items;
      trackOffset = data.next;
      console.log("===========");
      console.log(`offset: ${trackOffset}`);
      console.log("===========");
      tracks.forEach((track) => {
        let id = track.track.id;
        let name = track.track.name;
        let album = track.track.album.name;
        let artists = track.track.artists.map((artist) => artist.name);
        playlistTracks.push({id: id, name: name, album: album, artists: artists});
      });
    }, function(err){
      console.error(err);
    })
    .then(function(data){
      console.log('finished getting the tracks');
    })
  )
}

function toggleTracks(tracks) {
  tracks[0].parentNode.classList.toggle('hide');
}

function displayUserTracks(playlist, tracks){
  console.log(`== start tracks: ${tracks.length} tracks ==`);
  const playlistSelected = document.getElementById(`track-info-${playlist}`);
  console.log(playlist);
 
  let displayLI = tracks.map((track) => {
      console.log(track.id, track.name, track,name, track.artists);

      return `<tr class="tracks-${playlist}">
        <td class="track-name">${track.name}</td> 
        <td class="track-album">${track.album}</td> 
        <td class="track-artists">${track.artists}</td>
      </tr>`;
      // insertAfter(playlistSelected, newLI);
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

function showOrHideTracks(playlistIDCombo) {
  const hasTracks = document.getElementsByClassName(`tracks-${playlistIDCombo}`);
  if (hasTracks.length > 0){
    toggleTracks(hasTracks);
  } else {
    document.getElementById(`track-info-${playlistIDCombo}`).classList.remove('hide');
    showTracks(playlistIDCombo);
  }
}

function showTracks(playlistIDCombo){
  console.log(`tracks for ${playlistIDCombo}`);
  let listOwner = playlistIDCombo.split('---')[1];
  let listID = playlistIDCombo.split('---')[0];
  playlistTracks = [];
  return new Promise(function(resolve, reject) {
    resolve(1);
  })
  .then(function (result) {
    return Promise.resolve(
      retrieveTracks(listOwner, listID)
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