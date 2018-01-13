console.log('starting console log');

/**
   * Retrieve data from Spotify
   */

var SpotifyWebApi = require('spotify-web-api-js');

var userPlaylists = [];
var playlistTracks = [];
// var username = "";
// var access_token = "";
var noPlaylists = 0;
var noTracks = 0;
var spotifyApi = new SpotifyWebApi();

function inPlaylist(token, userID){
  spotifyApi.setAccessToken(token);
  // username = id;
  var step = 0;
  return new Promise(function(resolve, reject) {
      resolve(1);
  })
  .then(function (result) {
    return Promise.resolve(
      spotifyApi.getUserPlaylists()
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
      getAllUserPlaylists(++step, userID)
    )
  })
  .then(function (result) {
    return Promise.resolve(
      displayUserPlaylists(userPlaylists, ++step)
    )
  })
}

function getAllUserPlaylists(step, userID) {
  console.log(`== Resolve ${step} ==`);
  var promises = [];
  for(let i = 0; i < 30 ; i += 20){
    promises.push(spotifyApi.getUserPlaylists(userID, {offset: i})
    .then(function(data){
      // console.log(i);
      console.log(data.items);
      const playlists = data.items;
      playlists.forEach(function(playlist) {
        userPlaylists.push({owner: playlist.owner.id, name:playlist.name, id:playlist.id, totalTracks: playlist.tracks.total});
      });
    })
    .catch((e) => {
      // handle errors here
      console.error(e);
    })
    )
  }
  return Promise.all(promises)
  .then('finished getting all the playlists')
  .catch((e) => {
    // handle errors here
    console.error(e);
  });
}

function displayUserPlaylists(playlists, step){
  console.log(`== Resolve ${step} ==`);
  console.log(`== start playlists: ${playlists.length} playlists ==`);
  document.querySelector('.number-of-playlists').textContent = playlists.length;
  const header = `<li class="playlistHeader">
      <div class="playlistOwner">Owner</div>
      <div class="playlistName">Playlist</div>
      <div class="playlistNoTracks">Tracks</div>
    </li>`;
  let displayLI = playlists.map((playlist) => {
    console.log(playlist.owner, playlist.name, playlist.id);
    
    return `
      <li id="${playlist.id}---${playlist.owner}" class="playlist">
        <div class="playlistInfo">
          <div class="playlistOwner">${playlist.owner}</div> 
          <div class="playlistName">${playlist.name}</div> 
          <div class="playlistNoTracks">${playlist.totalTracks} track${playlist.totalTracks!== 1 ? 's' : ''}</div>
        </div>
        <div id="trackInfo-${playlist.id}---${playlist.owner}" class="tracks hide"></div>
      </li>
    `;
  }).join('');
  document.querySelector('.playlists').innerHTML = `${header} ${displayLI}`;
  const lists = document.querySelectorAll('.playlistInfo');
  lists.forEach((list) => {
    list.addEventListener('click', showOrHideTracks.bind(this, list.parentNode.id));
  } );
  console.log(`== end playlists ==`);
}

function retrieveTracks(listOwner, listID) {
  console.log('getting tracks');
  return Promise.resolve(
    spotifyApi.getPlaylistTracks(listOwner, listID)
    .then(function(data){
      let tracks = data.items;
      // console.log(tracks);
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
      // console.log(playlistTracks);
      console.log('finished getting the tracks');
      // return playlistTracks;
    })
  )
}

function toggleTracks(tracks) {
  // const tracks = document.getElementsByClassName(playlist);
  // Array.from(tracks).forEach((track) => {
  //   // track.parentNode.removeChild(track);
  //   track.parentNode.classList.toggle('hide');
  // });
  tracks[0].parentNode.classList.toggle('hide');
}

function insertAfter(node, nodeToInsert) {
  node.parentNode.insertBefore(nodeToInsert, node.nextSibling);
}



function displayUserTracks(playlist, tracks){
  console.log(`== start tracks: ${tracks.length} tracks ==`);
  const playlistSelected = document.getElementById(`trackinfo-${playlist}`);
  console.log(playlist);
  // example
  // 

  let displayLI = tracks.map((track) => {
      console.log(track.id, track.name, track,name, track.artists);
      // var newLI = document.createElement('li');
      // newLI.setAttribute("class", `${playlist} tracks` );

      return `<li class="tracks-${playlist}">
        <div class="trackName">${track.name}</div> 
        <div class="trackAlbum">${track.album}</div> 
        <div class="trackArtists">${track.artists}</div>
      </li>`;
      insertAfter(playlistSelected, newLI);
    }).join('');
    document.getElementById(`trackInfo-${playlist}`).innerHTML = displayLI;
  console.log('displaying tracks')
}



function showOrHideTracks(playlistIDCombo) {
  const hasTracks = document.getElementsByClassName(`tracks-${playlistIDCombo}`);
  if (hasTracks.length > 0){
    toggleTracks(hasTracks);
  } else {
    document.getElementById(`trackInfo-${playlistIDCombo}`).classList.remove('hide');
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
      
      // spotifyApi.getPlaylistTracks(listOwner, listID)
      // .then(function(data) {
      //   let tracks = data.items;
      //   tracks.forEach((track) => {
      //     let name = track.track.name;
      //     let album = track.track.album.name;
      //     let artists = track.track.artists.map((artist) => artist.name);
      //     console.log(name, album, artists);
      //   });
      // }, function(err){
      //   console.error(err);
      // })
    )
  })
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

module.exports = {
  inPlaylist
}