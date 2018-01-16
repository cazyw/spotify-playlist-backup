# Spotify Playlist Backup App
Project to create a website that displays a user's playlist track details from Spotify. 

https://spotify-copy-playlist.herokuapp.com

# Objective

The app will allow users to: 
* log in
* display their playlists (and search for a particular playlist)
* display the details (name, album, artist(s)) of the songs in that playlist
* download a copy of the track details as a csv file

# Operating Instructions

<img src="https://cazyw.github.io/img/js-spotify.jpg" width="450" alt="Spotify Playlist Backup">

Navigate to https://spotify-copy-playlist.herokuapp.com. You'll be asked to log in and then the page will display a list of all your playlists. Clicking on a playlist will display the tracks and the option to download the list to a csv file.

# Project Setup/Running

The project is hosted on Heroku but can also be run locally.

## Requirements

* node (version 8.9.1)
* npm (version 5.6.0)
* a developer account on Spotify

An overview of Spotify Web API setup: https://developer.spotify.com/web-api/

Using the Authorization Code Flow, the following configuration variables must be set as environment variables in a `.env` file:
```
$ export CLIENT_ID=<value in your Spotify app account>

$ export CLIENT_SECRET=<value in your Spotify app account>

$ export REDIRECT_URI=https://localhost:8888/callback/
```
## Steps (local server)

Setup your Spotify Developer and App account, node and npm and environment variables above.

Clone the repository.

To install the required packages (see package.json), run:
```
$ npm install
```

Start the server:
```
$ npm start
```
Then open the browser and go to http://localhost:8888/

To rebuild (after any file changes), run:
```
$ npm run build
```
Or to watch for and rebuild automatically after any changes, run:
```
$ npm run watch
```

## Project file structure

The project uses webpack.js to build the final Javascript file. The following are the final project files:
```
server.js
\public
  |- index.html
  |- bundle.js
  |- style.css

```

The `bundle.js` file is built from the files in
```
\working.js
  |- authentication.js
  |- playlist.js
  |- tracks.js
```

# Status

The project is finished as is, however the following features might be added in future:
* logout and better handling of token expiry
* smoother display
* sorting/ordering of lists

# Discussion

This project came about as users can no longer easily copy the details of the songs on their playlists from Spotify (and I'd really really like a list of my songs fo when I forget). Also a great way to learn about fetching data from external sources where authorisation is required.

Reviewed the info on the Spotify Developer website and their examples on how to log in and get the access token to connect to the API.

Then researched how to fetch data from them (using https://github.com/jmperez/spotify-web-api-js). There are limits to the data returned (only 20 playlists at a time) so needed to loop and use offset to return all the playlists. Since these calls are synchronous, I had to look into how to wait until all the playlists had been retrieved before moving on. This involved looking at promises.

During development, the `client id`, `client secret`, and `redirect uri` values was set using environment variables. I used the `dotenv` package so that in a development environment, the values were obtained from a `.env` file (which isn't uploaded to GitHub).


# Resources
https://developer.spotify.com/web-api/

https://github.com/jmperez/spotify-web-api-js