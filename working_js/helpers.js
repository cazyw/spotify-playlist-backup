// Helper functions

function addClass(section){
  document.querySelector(section).classList.add('active');
}

function removeClass(section, ...callbackParam){
  document.querySelector(section).classList.remove('active');
  if(callbackParam.length > 0) {
    callbackParam[0](callbackParam[1]);
  }
}

function errorHandler(e){
  console.error(e);
  alert('There was an error, please log in again');
  removeClass('#loggedin', addClass, '#login');
}


module.exports = {
  addClass,
  removeClass,
  errorHandler
}
