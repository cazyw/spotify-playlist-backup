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
  let displayLI = playlists.map((playlist) => {
    console.log(playlist.owner, playlist.name, playlist.id);
    
    return `
      <li id='${playlist.id}---${playlist.owner}' class='playlist'>
        <div class="playlistOwner">${playlist.owner}</div> 
        <div class="playlistName">${playlist.name}</div> 
        <div class="playlistNoTracks">${playlist.totalTracks} track${playlist.totalTracks!== 1 ? 's' : ''}</div>
      </li>
    `;
  }).join('');
  document.querySelector('.playlists').innerHTML = displayLI;
  const lists = document.querySelectorAll('.playlist');
  lists.forEach((list) => {
    list.addEventListener('click', showTracks.bind(this, list.id));
  } );
  console.log(`== end playlists ==`);
}

function retrieveTracks(listOwner, listID) {
  console.log('getting tracks');
  return Promise.resolve(
    spotifyApi.getPlaylistTracks(listOwner, listID)
    .then(function(data){
      let tracks = data.items;
      console.log(tracks);
      tracks.forEach((track) => {
        let name = track.track.name;
        let album = track.track.album.name;
        let artists = track.track.artists.map((artist) => artist.name);
        playlistTracks.push({name: name, album: album, artists: artists});
      });
    }, function(err){
      console.error(err);
    })
    .then(function(data){
      console.log(playlistTracks);
      console.log('finished getting the tracks');
      // return playlistTracks;
    })
  )
}

function showTracks(id){
  console.log(`tracks for ${id}`);
  let listOwner = id.split('---')[1];
  let listID = id.split('---')[0];
  return new Promise(function(resolve, reject) {
    resolve(1);
  })
  .then(function (result) {
    return Promise.resolve(
      retrieveTracks(listOwner, listID)
      
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
  .then(function (result) {
    return Promise.resolve(
      console.log('got tracks')
      
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