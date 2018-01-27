# Spotify Playlist Backup
Project to create a web app that displays a user's Spotify playlist track details so they can be downloaded as a csv file. 

https://spotify-playlist-backup.herokuapp.com

# Objective

The app will allow users to: 
* log in
* display their playlists (and search for a particular playlist)
* display the details (name, album, artist(s)) of the tracks in that playlist
* download a copy of the track details as a csv file

# Operating Instructions

<img src="https://cazyw.github.io/img/js-spotify.jpg" width="450" alt="Spotify Playlist Backup">

Navigate to https://spotify-playlist-backup.herokuapp.com. You'll be asked to log in, authorise the connection of the app to your Spotify account, and then the page will display a list of all your playlists. Clicking on a playlist will display the tracks and the option to download the list to a csv file.

# Project Setup/Running

The project is hosted on Heroku but can also be run locally.

##  Project Requirements

* node (version 8.9.1)
* npm (version 5.6.0)
* Spotify accounts (a normal user account and a developer account)
* Heroku account and CLI (if deploying to Heroku)

An overview of Spotify Web API setup: https://developer.spotify.com/web-api/ and deploying to Heroku: https://devcenter.heroku.com/articles/deploying-nodejs/


## Steps

Setup your Spotify Developer account and in the Dashboard create an App. Edit the settings so the `Redirect URIs` section includes `http://localhost:8888/boomerang/`. You will need to (later) add additional entries if deploying to Heroku (e.g. in my case `https://spotify-playlist-backup.herokuapp.com/boomerang/`)

Clone the repository.

Install node and npm.

Using the Authorization Code Flow to access Spotify, the following configuration variables must be set as environment variables in a `.env` file in the project root directory (if running locally) and/or as config variables if deploying to Heroku. If running locally, the `dotenv` module will load the file into `process.env`. The `REDIRECT_URI` will have a different address in Heroku.
```
$ export CLIENT_ID=<value in your Spotify app account>

$ export CLIENT_SECRET=<value in your Spotify app account>

$ export REDIRECT_URI=https://localhost:8888/boomerang/ 
```


To install the required packages (see package.json), run:
```
$ npm install
```

Start the server locally:
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

Deploying to Heroku requires some additional setup such as installing Heroku and creating an app and setting config variables (see https://devcenter.heroku.com/articles/deploying-nodejs) however the settings in `package.json` are already done. 

## Project file structure

The project uses webpack.js to build the final Javascript file. The following are the final project files:
```
server.js
public/
  |- index.html
  |- bundle.js
  |- style.css

```

The `bundle.js` file is built using webpack from the files in
```
working_js/
  |- authentication.js
  |- helpers.js
  |- playlist.js
  |- tracks.js
```

# Status

The project is complete. Further tweaks and modifications may be made if anything comes up:
* Possible further research into Spotify's authorisation workflows

# Discussion

This project came about because due to Spotify's UI update a while ago, I could no longer copy the details of the tracks on my Spotify playlists anymore (and I'd really really like a list of my tracks for when I forget). Also it was a great way to learn about fetching data from external sources where authorisation was required and building something that I'd actually use.

## Spotify Authentication
My first step was to investigate how to connect to Spotify, how their Web API and authentication worked and other resources that would assist in fetching data (e.g. I used https://github.com/jmperez/spotify-web-api-js). In order to access user data in Spotify, users need to log in and then authorize the application. 

I picked the `Authentication Code Flow` for authentication, as it allowed me to access user data and had the greatest options. The `Implicit Grant` workflow could work as I currently do not user refresh tokens but at the time, I hadn't decided on this and it would be a good opportunity to build on the server-side as well.

The server and authentication code was based on the code in https://github.com/spotify/web-api-auth-examples, which I modified so only the parts I needed remained and which I spent some time reviewing to understand what it did.

## Retrieving Data from Spotify

I used the helper wrapper module https://github.com/jmperez/spotify-web-api-js to assist with retrieving data from Spotify.
One of the challenges was working out how to retrieve the data from Spotify, wait until it had all been retrieved, and then display the result. Javascript is asynchronous in that functions may finishing executing out of order (non-blocking) and fetching data will usually take the longest time (compared to other functions). This can result in the displaying function being executed and finished before data retrieval. 

Rather than using callbacks (and resulting in very ugly code), I decided to implement "function ordering" using Promises. I'm still grappling with using them, but a lot of searching and experimenting got me able to make my functions run in order and wait for loops to completely finish before moving on. These loops were required as Spotify has limits on the amount of data returned and multiple calls were often required to retrieve chunks of data, which then needed to be pieced together.

## Downloading to a Local File
One new item I had never touched on was downloading/saving information from a website to a local file, which I needed as I wanted to be able to save track information to a csv file. This turned out to be pretty easy to implement once I worked out how to download using the anchor `<a>` tag. 

## Structure

I used `webpack` for the module bundler. As the project progressed I began separating my code out into smaller modules that tackled one aspect of the app. This made it both easier to manage and a good way to explore how to use webpack and how to break code up into chunks and then refer to functions in different files. It was useful to set up scripts so that webpack automatically rebuilt my javascript file each time one of the working files was updated.

I also included the `babel-core babel-preset-env babel-loader` modules which compiles/transpiles javascript that is using new features into code that can run in older browsers that do not support the features yet.

## Design

Design-wise, working out how the data would display, particularly in mobile view required a fair amount of testing to determine appropriate spacing and to make sure data did not overrun. I ended up displaying the track information in a table as this was both appropriate and meant I could literally copy and paste the data, if I wanted to, into excel as well. I added some spinning animations to show data was loading/retrieved and further animations to fade in the playlist. 

## Conclusion

The project has essentially finished (barring some ongoing feature/design tweaks/refactoring) and was pretty fun, a great learning experience and resulted in something I will use.