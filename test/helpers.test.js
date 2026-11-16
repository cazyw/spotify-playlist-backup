import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, toCsv } from '../public/js/helpers.js';

test('escapeHtml turns markup into text', () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('1')"> & more`),
    '&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt; &amp; more'
  );
});

test('escapeHtml leaves plain text alone and accepts numbers', () => {
  assert.equal(escapeHtml('Chill Vibes 2024'), 'Chill Vibes 2024');
  assert.equal(escapeHtml(42), '42');
});

test('toCsv quotes every field so commas, quotes, newlines and # stay in one cell', () => {
  const csv = toCsv([
    ['Name', 'Album'],
    ['Hello, Goodbye', 'The "Best" Of'],
    ['Line\nbreak', '#1 Hits']
  ]);

  assert.equal(csv, '"Name","Album"\n"Hello, Goodbye","The ""Best"" Of"\n"Line\nbreak","#1 Hits"\n');
});

test('toCsv stops a field from running as a spreadsheet formula', () => {
  const csv = toCsv([['=HYPERLINK("http://evil")', '+1', '-1', '@SUM(A1)', 'a=b']]);

  assert.equal(csv, `"'=HYPERLINK(""http://evil"")","'+1","'-1","'@SUM(A1)","a=b"\n`);
});
