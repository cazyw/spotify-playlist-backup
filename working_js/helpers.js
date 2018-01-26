// Helper functions

function addActiveClass(section){
  document.querySelector(section).classList.add('active');
}

function removeActiveClass(section, ...callbackParam){
  document.querySelector(section).classList.remove('active');
  if(callbackParam.length > 0) {
    callbackParam[0](callbackParam[1]);
  }
}

function errorHandler(e){
  console.error(e);
  alert('There was an authentication error, please log in again');
  window.location.href = "/";
  removeActiveClass('#loading');
  removeActiveClass('#loggedin', addActiveClass, '#login');
}


module.exports = {
  addActiveClass,
  removeActiveClass,
  errorHandler
}
