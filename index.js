console.log('starting console log');
let userPlaylists = [];
let noPlaylists = 0;
var SpotifyWebApi = require('spotify-web-api-js');


var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken('fill in');

function doCalls(message) {
  var step = 0;
  console.log(message);
  return new Promise(function(resolve, reject) {
      resolve(1);
  })
  .then(function (result) {
    return Promise.resolve(
      spotifyApi.getUserPlaylists('elliedub')
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
      getAllUserPlaylists(++step)
    )
  })
  .then(function (result) {
    return Promise.resolve(
      printAllUserPlaylists(++step)
    )
  })
      .then(function (result) {
          console.log('Ending demo ');
          return Promise.resolve(step);
      })
}

doCalls('Starting calls')
  .then(function (steps) {
          console.log('Completed in step ', steps);
  });


function getAllUserPlaylists(step) {
  console.log(`== Resolve ${step} ==`);
  var promises = [];
  for(let i = 0; i < (noPlaylists) ; i += 20){
    promises.push(spotifyApi.getUserPlaylists('elliedub', {offset: i})
    .then(function(data){
      console.log(i);
      console.log(data.items);
      const playlists = data.items;
      playlists.forEach(function(playlist) {
        userPlaylists.push({name:playlist.name, id:playlist.id});
      });
    })
    .catch((e) => {
      // handle errors here
      console.error(e);
    })
    )
  }
  return Promise.all(promises)
  .then('finished')
  .catch((e) => {
    // handle errors here
    console.error(e);
  });
}

function printAllUserPlaylists(step){
  console.log(`== Resolve ${step} ==`);
  console.log(`== start playlists: ${userPlaylists.length} playlists ==`);
  userPlaylists.forEach((playlist) => console.log(playlist.name, playlist.id));
  console.log(`== end playlists ==`);
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
