const API = 'https://api.spotify.com/v1';

const get = async (url, token, fetchFn) => {
  const response = await fetchFn(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const error = new Error(`Spotify responded with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

// Spotify pages its lists; `next` holds the URL of the following page, or null
const getAll = async (url, token, fetchFn) => {
  const items = [];
  while (url) {
    const page = await get(url, token, fetchFn);
    items.push(...page.items);
    url = page.next;
  }
  return items;
};

export const getMe = (token, fetchFn = fetch) => get(`${API}/me`, token, fetchFn);

export const getPlaylists = async (token, fetchFn = fetch) => {
  const playlists = await getAll(`${API}/me/playlists?limit=50`, token, fetchFn);
  return playlists.filter(Boolean).map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    owner: playlist.owner.id,
    // `items` is absent for playlists the user does not own or collaborate on;
    // `tracks` is the name the field had before February 2026
    totalTracks: playlist.items?.total ?? playlist.tracks?.total ?? null
  }));
};

// Resolves to null when Spotify refuses to share the tracks (403), which it
// does for playlists the user does not own or collaborate on
export const getPlaylistItems = async (playlistID, token, fetchFn = fetch) => {
  let entries;
  try {
    entries = await getAll(`${API}/playlists/${playlistID}/items?limit=50`, token, fetchFn);
  } catch (e) {
    if (e.status === 403) return null;
    throw e;
  }
  return entries
    .map((entry) => entry.item ?? entry.track)
    // removed tracks come back as null
    .filter(Boolean)
    .map((track) => ({
      id: track.id,
      name: track.name,
      // podcast episodes have no album or artists
      album: track.album?.name ?? '',
      artists: (track.artists ?? []).map((artist) => artist.name)
    }));
};
