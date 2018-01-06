console.log('starting console log');
let userPlaylists = [];
let noPlaylists = 0;
var SpotifyWebApi = require('spotify-web-api-js');
var q = require('Q');
var promises = [];

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
      getNames(++step)
    )
  })
      .then(function (result) {
          return Promise.resolve(
              // rp(req3, function (err, resp) {
                  console.log('step: ', ++step, ' UHub')
              // })
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


// spotifyApi.getUserPlaylists('elliedub')
//   .then(function(data) {
//     console.log('User playlists', data, data.total);
//     let loops = data.total / 20;
//     console.log(`loops: ${loops}`);
//     return noPlaylists = data.total;
//   }, function(err){
//     console.error(err);
//   })
//   .then(function(){
//     getNames();
//   })
//   .then(printEnd);

// function printEnd(){
//   console.log('end');
// }

function getNames(step) {
  console.log(`== Resolve ${step} ==`);
  var promises = [];
  for(var i = 0; i < (noPlaylists) ; i += 20){
    promises.push(spotifyApi.getUserPlaylists('elliedub', {offset: i})
    .then(function(data){
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

// spotifyApi.getUserPlaylists('elliedub', {offset: i})
//         .then(function(data) {
//           let playlists = data.items;
//           playlists.forEach(playlist => {
//             console.log(playlist.name, playlist.id);
//           });
//         }, function(err) {
//           console.error(err);
//         });

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
