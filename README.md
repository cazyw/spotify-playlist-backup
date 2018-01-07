# Spotify Playlist Details App
Personal project to create an app that displays playlist track details from Spotify. This project came about as users can no longer easily copy the details of the songs on their playlists from Spotify (and I'd really really like a list of my songs fo when I forget). Also a great way to learn about fetching data from external sources where authorisation is required.

# Objective

The app will allow users to: 
* log in
* display their playlists
* display the details (name, album, artist(s)) of the songs in that playlist

# Status

In progress. 

Working out how to interact with Spotify's Web API.

Currently obtaining the `access token` via a separate process (not in this repo - using Spotify's tutorial). The token is then manually added to the code here so that it will run. The `client id`, `client secret`, and `redirect uri` are stored as environment variables.

Having roughly worked out how to retrieve data from Spotify (displaying in console), the next step is to integrate the authorisation/log in step so the `access token` and `username` is dynamic rather than hard coded.

To do:
* link up the authorisation
* refactor the code to retrieve playlists and tracks
* display it all nicely in html (rather than console)
* add functionality to search for a playlist within the list of playlists 

# Resources
https://developer.spotify.com/web-api/

https://github.com/jmperez/spotify-web-api-js