# Music Listing Backup App
Personal project to create an app that displays playlist track details from Spotify. This project came about as users can no longer easily copy the details of the songs on their playlists from Spotify (and I'd really really like a list of my songs fo when I forget). Also a great way to learn about fetching data from external sources where authorisation is required.

# Objective

The app will allow users to: 
* log in
* display their playlists
* display the details (name, album, artist(s)) of the songs in that playlist

# Setup/Running

***will not work for others as environment variables used to set `client id`, `client secret`, and `redirect uri` and the app is run on a local server***


`app.js` server file. Start the server with:

```
$ node app.js
```

Then navigate to `http://localhost:8888`. Select to log in. Log into Spotify. This will then display a page with some user details (based off the example code from Spotify).

However the console should then display a list of the user's playlists.

`playlist.js` the js file retrieving the music data from Spotify (also currently includes code from the Spotify example that renders the page) 

`public/index.html` the html file

`public/bundle.js` javascript file created useing webpack and referred to in the html file


# Status

In progress. Working out how to interact with Spotify's Web API and display the data.

## Done

The `client id`, `client secret`, and `redirect uri` are currently stored as environment variables (not accessable from github).

Having roughly worked out how to retrieve data from Spotify (displaying in console), I used the example authorisation code from Spotify to integrate the authorisation/log in step so the `access token` and `username` is dynamic rather than hard coded. I then reviewed their example code and modified it so it displayed the data I needed (playlists rather than user details).

A search functionality has also been added so users can search for a particular playlist.

## To do

* add code to retrieve tracks for a selected playlist
* refactor how the information is displayed
* add logout feature and handle authorisation timeouts
* deploy online

# Discussion

tbc...

Reviewed the info on the Spotify Developer website and their examples on how to log in and get the access token to connect to the API.

Then researched how to fetch data from them (using https://github.com/jmperez/spotify-web-api-js). There are limits to the data returned (only 20 playlists at a time) so needed to loop and use offset to return all the playlists. Since these calls are synchronous, I had to look into how to wait until all the playlists had been retrieved before moving on. This involved looking at promises.


# Resources
https://developer.spotify.com/web-api/

https://github.com/jmperez/spotify-web-api-js