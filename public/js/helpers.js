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

const htmlEscapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Playlist and track names are written by other Spotify users, so they must
// be escaped before they go into innerHTML
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, (character) => htmlEscapes[character]);
}

function csvField(value){
  let text = String(value);
  // a spreadsheet runs a cell that starts with one of these as a formula
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(rows){
  return rows.map((row) => row.map(csvField).join(',')).join('\n') + '\n';
}


export {
  addActiveClass,
  removeActiveClass,
  errorHandler,
  escapeHtml,
  toCsv
}
