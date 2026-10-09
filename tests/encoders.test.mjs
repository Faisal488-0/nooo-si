import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toBinary, toHex, toMorse, fromMorse, toBase64, toUnicode, toDecimalBytes, toAsciiArt, morseSupported } from '../assets/js/lib/encoders.js';

test('NOOO in binary matches the spec', () => {
  assert.equal(toBinary('NOOO'), '01001110 01001111 01001111 01001111');
});

test('NOOO in Morse matches the spec and round-trips', () => {
  assert.equal(toMorse('NOOO'), '-. --- --- ---');
  assert.equal(fromMorse(toMorse('NOT TODAY')), 'NOT TODAY');
});

test('Arabic "لا" is encoded as real UTF-8', () => {
  assert.equal(toHex('لا'), 'D9 84 D8 A7');
  assert.equal(toUnicode('لا'), 'U+0644 U+0627');
  assert.equal(toBase64('لا'), '2YTYpw==');
  assert.equal(toDecimalBytes('NO'), '78 79');
});

test('Morse support detection', () => {
  assert.equal(morseSupported('NO WAY'), true);
  assert.equal(morseSupported('لا'), false);
});

test('ASCII art has 5 rows', () => {
  assert.equal(toAsciiArt('NO').split('\n').length, 5);
});
