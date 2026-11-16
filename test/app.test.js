import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';

const redirectUri = 'http://127.0.0.1:8888/callback';

// Answers the token request with the given response and records the call
const fakeTokenFetch = ({ status = 200, body = {} } = {}) => {
  const calls = [];
  const fetchFn = async (url, options) => {
    calls.push({ url, options });
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  return { fetchFn, calls };
};

// Starts the app on a free port; redirects are returned, not followed
const start = async (t, fetchFn) => {
  t.mock.method(console, 'error', () => {});
  const app = createApp({ clientId: 'id', clientSecret: 'secret', redirectUri, fetch: fetchFn });
  const server = app.listen(0);
  await once(server, 'listening');
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return (path, cookie) => fetch(base + path, { redirect: 'manual', headers: cookie ? { cookie } : {} });
};

const stateCookie = (response) => response.headers.getSetCookie()
  .find((cookie) => cookie.startsWith('spotify_auth_state='))
  .split(';')[0];

for (const [path, showDialog] of [['/login', 'false'], ['/logout', 'true']]) {
  test(`${path} redirects to Spotify with a state that matches the cookie`, async (t) => {
    const request = await start(t);

    const response = await request(path);

    const location = new URL(response.headers.get('location'));
    assert.equal(response.status, 302);
    assert.equal(location.origin + location.pathname, 'https://accounts.spotify.com/authorize');
    assert.equal(location.searchParams.get('client_id'), 'id');
    assert.equal(location.searchParams.get('redirect_uri'), redirectUri);
    assert.equal(location.searchParams.get('response_type'), 'code');
    assert.equal(location.searchParams.get('show_dialog'), showDialog);
    assert.equal(stateCookie(response), `spotify_auth_state=${location.searchParams.get('state')}`);
  });
}

test('/callback without a code redirects to the start page', async (t) => {
  const { fetchFn, calls } = fakeTokenFetch();
  const request = await start(t, fetchFn);

  const response = await request('/callback?state=abc', 'spotify_auth_state=abc');

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/');
  assert.equal(calls.length, 0);
});

test('/callback with a state that does not match the cookie redirects to the start page', async (t) => {
  const { fetchFn, calls } = fakeTokenFetch();
  const request = await start(t, fetchFn);

  const mismatch = await request('/callback?code=c&state=abc', 'spotify_auth_state=other');
  const noCookie = await request('/callback?code=c&state=abc');
  const noState = await request('/callback?code=c');

  for (const response of [mismatch, noCookie, noState]) {
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/');
  }
  assert.equal(calls.length, 0);
});

test('/callback swaps the code for a token and passes it to the browser', async (t) => {
  const { fetchFn, calls } = fakeTokenFetch({ body: { access_token: 'tok-1' } });
  const request = await start(t, fetchFn);

  const response = await request('/callback?code=c-1&state=abc', 'spotify_auth_state=abc');

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/#access_token=tok-1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://accounts.spotify.com/api/token');
  assert.equal(calls[0].options.headers.Authorization, 'Basic ' + Buffer.from('id:secret').toString('base64'));
  assert.equal(
    calls[0].options.body.toString(),
    'grant_type=authorization_code&code=c-1&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback'
  );
});

test('/callback redirects to the start page when Spotify refuses the code', async (t) => {
  const { fetchFn } = fakeTokenFetch({ status: 400 });
  const request = await start(t, fetchFn);

  const response = await request('/callback?code=bad&state=abc', 'spotify_auth_state=abc');

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/');
});
