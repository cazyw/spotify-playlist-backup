var SpotifyWebApi = require('spotify-web-api-js');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('to be filled in');

spotifyApi.getUserPlaylists('elliedub')
  .then(function(data) {
    // console.log('User playlists', data);
    let playlists = data.items;
    playlists.forEach(playlist => {
      console.log(playlist.name, playlist.id);
      spotifyApi.getPlaylistTracks('elliedub', playlist.id)
      .then(function(data){
        let tracks = data.items;
        tracks.forEach((track) => {
          let name = track.track.name;
          let album = track.track.album.name;
          let artists = track.track.artists.map((artist) => artist.name);
          console.log(name, album, artists);
        });
      });
    }, function(err) {
      console.error(err);
    });
    
  }, function(err) {
    console.error(err);
  });