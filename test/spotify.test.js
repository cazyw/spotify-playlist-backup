import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMe, getPlaylists, getPlaylistItems } from '../public/js/spotify.js';

// Answers each call with the next response in the list and records the call
const fakeFetch = (...responses) => {
  const calls = [];
  const fetchFn = async (url, options) => {
    calls.push({ url, options });
    const { status = 200, body = {} } = responses[calls.length - 1];
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  return { fetchFn, calls };
};

test('getMe sends the token and returns the profile', async () => {
  const { fetchFn, calls } = fakeFetch({ body: { id: 'caz' } });

  const me = await getMe('token-1', fetchFn);

  assert.deepEqual(me, { id: 'caz' });
  assert.equal(calls[0].url, 'https://api.spotify.com/v1/me');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token-1');
});

test('getMe throws with the status when Spotify rejects the token', async () => {
  const { fetchFn } = fakeFetch({ status: 401 });

  await assert.rejects(getMe('expired', fetchFn), { status: 401 });
});

test('getPlaylists follows next links until the last page', async () => {
  const next = 'https://api.spotify.com/v1/me/playlists?offset=50&limit=50';
  const { fetchFn, calls } = fakeFetch(
    { body: { items: [{ id: 'p1', name: 'One', owner: { id: 'caz' }, items: { total: 3 } }], next } },
    { body: { items: [{ id: 'p2', name: 'Two', owner: { id: 'bob' }, items: { total: 7 } }], next: null } }
  );

  const playlists = await getPlaylists('token-1', fetchFn);

  assert.deepEqual(playlists, [
    { id: 'p1', name: 'One', owner: 'caz', totalTracks: 3 },
    { id: 'p2', name: 'Two', owner: 'bob', totalTracks: 7 }
  ]);
  assert.deepEqual(calls.map((call) => call.url), ['https://api.spotify.com/v1/me/playlists?limit=50', next]);
});

test('getPlaylists reads the track count from the old or missing field', async () => {
  const { fetchFn } = fakeFetch({
    body: {
      items: [
        { id: 'old', name: 'Old', owner: { id: 'caz' }, tracks: { total: 2 } },
        { id: 'followed', name: 'Followed', owner: { id: 'bob' } }
      ],
      next: null
    }
  });

  const playlists = await getPlaylists('token-1', fetchFn);

  assert.deepEqual(playlists.map((playlist) => playlist.totalTracks), [2, null]);
});

test('getPlaylistItems returns name, album and artists for each track', async () => {
  const { fetchFn, calls } = fakeFetch({
    body: {
      items: [
        { item: { id: 't1', name: 'Song', album: { name: 'Album' }, artists: [{ name: 'A' }, { name: 'B' }] } },
        { item: null },
        { item: { id: 'e1', name: 'Episode', type: 'episode' } },
        { track: { id: 't2', name: 'Old shape', album: { name: 'LP' }, artists: [{ name: 'C' }] } }
      ],
      next: null
    }
  });

  const tracks = await getPlaylistItems('p1', 'token-1', fetchFn);

  assert.deepEqual(tracks, [
    { id: 't1', name: 'Song', album: 'Album', artists: ['A', 'B'] },
    { id: 'e1', name: 'Episode', album: '', artists: [] },
    { id: 't2', name: 'Old shape', album: 'LP', artists: ['C'] }
  ]);
  assert.equal(calls[0].url, 'https://api.spotify.com/v1/playlists/p1/items?limit=50');
});

test('getPlaylistItems follows next links', async () => {
  const next = 'https://api.spotify.com/v1/playlists/p1/items?offset=50&limit=50';
  const track = (id) => ({ item: { id, name: id, album: { name: 'Album' }, artists: [] } });
  const { fetchFn } = fakeFetch(
    { body: { items: [track('t1')], next } },
    { body: { items: [track('t2')], next: null } }
  );

  const tracks = await getPlaylistItems('p1', 'token-1', fetchFn);

  assert.deepEqual(tracks.map((t) => t.id), ['t1', 't2']);
});

test('getPlaylistItems returns null when Spotify will not share the tracks', async () => {
  const { fetchFn } = fakeFetch({ status: 403 });

  assert.equal(await getPlaylistItems('p1', 'token-1', fetchFn), null);
});

test('getPlaylistItems throws on other errors', async () => {
  const { fetchFn } = fakeFetch({ status: 401 });

  await assert.rejects(getPlaylistItems('p1', 'expired', fetchFn), { status: 401 });
});
