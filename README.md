# Spotify Playlist Backup
Project to create a website that displays a user's Spotify playlist track details so they can be downloaded. 

https://spotify-playlist-backup.herokuapp.com

# Objective

The app will allow users to: 
* log in
* display their playlists (and search for a particular playlist)
* display the details (name, album, artist(s)) of the songs in that playlist
* download a copy of the track details as a csv file

# Operating Instructions

<img src="https://cazyw.github.io/img/js-spotify.jpg" width="450" alt="Spotify Playlist Backup">

Navigate to https://spotify-playlist-backup.herokuapp.com. You'll be asked to log in and then the page will display a list of all your playlists. Clicking on a playlist will display the tracks and the option to download the list to a csv file.

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

Pushing to Heroku requires an account on Heroku and following some of their setup instruction (see https://devcenter.heroku.com/articles/deploying-nodejs). 

## Project file structure

The project uses webpack.js to build the final Javascript file. The following are the final project files:
```
server.js
\public
  |- index.html
  |- bundle.js
  |- style.css

```

The `bundle.js` file is built using webpack from the files in
```
\working.js
  |- authentication.js
  |- playlist.js
  |- tracks.js
```

# Status

The project is finished as is, however the following features might be added in future:
* logout and better handling of token expiry (currently can log out by selecting "not you?" in the permission page)
* smoother display
* sorting/ordering of lists
* refactor code so cleaner

# Discussion

This project came about because due to Spotify's UI update a while ago, I could no longer copy the details of the songs on my Spotify playlists anymore (and I'd really really like a list of my songs for when I forget). Also it was a great way to learn about fetching data from external sources where authorisation was required and building something that I'd actually use.

My first step was to investigate how to connect to Spotify, how their Web API and authentication worked and other resources that would assist in fetching data (e.g. I used https://github.com/jmperez/spotify-web-api-js). I primarily used Spotify's code from the Authentication Code Flow for authentication, and built the rest of my app around it. 

One of the challenges was working out how to retrieve the data from Spotify, wait until it had all been retrieved, and then display the result. Javascript is asynchronous in that functions may finishing executing out of order (non-blocking) and fetching data will usually take the longest time (compared to other functions). This can result in the displaying function being executed and finished before data retrieval. 

Rather than using callbacks (and falling into potential callback-hell), I decided to implement "function ordering" using Promises. I'm still grappling with using them, but a lot of searching and experimenting got me able to make my functions run in order and wait for loops to completely finish before moving on. These loops were required as multiple calls were often required to retrieve chunks of data.

Design-wise, working out how the data would display, particularly in mobile view required a fair amount of testing to determine appropriate spacing and to make sure data did not overrun. I ended up displaying the track information in a table as this was both appropriate and meant I could literally copy and paste the data, if I wanted to, into excel as well. I added some animations to show data was loading/being retrieved and further animations to fade in/out sections is on my list to do. 

One new item I had never touched on was downloading/saving information from a website to a local file, which I needed as I wanted to be able to save track information to a csv file. This turned out to be pretty easy to implement once I worked out how to download using the anchor `<a>` tag. 

As the project progressed I began separating my code out into smaller modules. This made it both easier to manage and a good way to explore how to use webpack and how to break code up into chunks.

The project has essentially finished (barring some ongoing feature/design tweaks/refactoring) and was pretty fun, a great learning experience and resulted in something I will use.