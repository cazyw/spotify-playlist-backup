console.log('starting');
var SpotifyWebApi = require('spotify-web-api-js');

var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken('fill in');

spotifyApi.getUserPlaylists('elliedub')
  .then(function(data) {
    console.log('User playlists', data, data.total);
    let loops = data.total / 20;
    console.log(`loops: ${loops}`);
    for(var i = 0; i < (data.total) ; i += 20){
      console.log('test', i);
      spotifyApi.getUserPlaylists('elliedub', {offset: i})
      .then(function(data){
        console.log(data);
      }, function(err){
        console.error(err);
      });
    }
    console.log('hi');
  }, function(err) {
    console.error(err);
});


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
