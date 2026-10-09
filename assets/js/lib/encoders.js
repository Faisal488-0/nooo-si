// Pure, dependency-free encoders shared by the browser UI and the hourly engine.
// None of these are "languages" — they are ways of representing text.

const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
  6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', "'": '.----.',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  '=': '-...-', '+': '.-.-.', '-': '-....-', '"': '.-..-.', '@': '.--.-.'
};
const MORSE_REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

const utf8 = (text) => new TextEncoder().encode(String(text));

export function toBinary(text) {
  return Array.from(utf8(text), (b) => b.toString(2).padStart(8, '0')).join(' ');
}

export function toHex(text) {
  return Array.from(utf8(text), (b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

export function toDecimalBytes(text) {
  return Array.from(utf8(text), (b) => String(b)).join(' ');
}

export function toUnicode(text) {
  return Array.from(String(text), (ch) => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

export function toBase64(text) {
  const bytes = utf8(text);
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

/** Morse for Latin letters, digits and common punctuation. Unsupported chars become '#'. */
export function toMorse(text) {
  return String(text)
    .toUpperCase()
    .trim()
    .split(/\s+/)
    .map((word) => Array.from(word, (ch) => MORSE[ch] ?? '#').join(' '))
    .join(' / ');
}

export function fromMorse(code) {
  return String(code)
    .trim()
    .split(/\s*\/\s*/)
    .map((word) => word.split(/\s+/).map((sym) => MORSE_REVERSE[sym] ?? '').join(''))
    .join(' ');
}

export function morseSupported(text) {
  return Array.from(String(text).toUpperCase()).every((ch) => ch === ' ' || ch in MORSE);
}

export function toEmoji(text) {
  const map = { N: '🅽', O: '🅾️', A: '🅰️', B: '🅱️', E: '🅴', S: '🆂', T: '🆃', Y: '🆈', P: '🅿️', M: '🅼' };
  return Array.from(String(text).toUpperCase(), (ch) => map[ch] ?? ch).join('') + ' 🙅';
}

// Tiny 5-row block font for ASCII art (Latin letters + a few symbols).
const BLOCK = {
  A: [' ### ', '#   #', '#####', '#   #', '#   #'], B: ['#### ', '#   #', '#### ', '#   #', '#### '],
  C: [' ####', '#    ', '#    ', '#    ', ' ####'], D: ['#### ', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '#### ', '#    ', '#####'], F: ['#####', '#    ', '#### ', '#    ', '#    '],
  G: [' ####', '#    ', '#  ##', '#   #', ' ####'], H: ['#   #', '#   #', '#####', '#   #', '#   #'],
  I: ['#####', '  #  ', '  #  ', '  #  ', '#####'], J: ['#####', '   # ', '   # ', '#  # ', ' ##  '],
  K: ['#   #', '#  # ', '###  ', '#  # ', '#   #'], L: ['#    ', '#    ', '#    ', '#    ', '#####'],
  M: ['#   #', '## ##', '# # #', '#   #', '#   #'], N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  O: [' ### ', '#   #', '#   #', '#   #', ' ### '], P: ['#### ', '#   #', '#### ', '#    ', '#    '],
  Q: [' ### ', '#   #', '# # #', '#  # ', ' ## #'], R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
  S: [' ####', '#    ', ' ### ', '    #', '#### '], T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', ' ### '], V: ['#   #', '#   #', '#   #', ' # # ', '  #  '],
  W: ['#   #', '#   #', '# # #', '## ##', '#   #'], X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '], Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
  '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  '], '.': ['     ', '     ', '     ', '     ', '  #  '],
  '?': [' ### ', '#   #', '  ## ', '     ', '  #  '], ' ': ['   ', '   ', '   ', '   ', '   ']
};

export function toAsciiArt(text, maxChars = 10) {
  const chars = Array.from(String(text).toUpperCase().slice(0, maxChars)).map((c) => BLOCK[c] ?? BLOCK['?']);
  const rows = [0, 1, 2, 3, 4].map((r) => chars.map((g) => g[r]).join(' ').replace(/\s+$/, ''));
  return rows.join('\n');
}

export const ENCODERS = [
  { id: 'binary', label: { en: 'Binary (UTF-8 bytes)', ar: 'ثنائي (بايتات UTF-8)' }, fn: toBinary },
  { id: 'hex', label: { en: 'Hex (UTF-8 bytes)', ar: 'سداسي عشري (UTF-8)' }, fn: toHex },
  { id: 'ascii', label: { en: 'ASCII / UTF-8 decimal', ar: 'ASCII / UTF-8 عشري' }, fn: toDecimalBytes },
  { id: 'unicode', label: { en: 'Unicode code points', ar: 'نقاط يونيكود' }, fn: toUnicode },
  { id: 'base64', label: { en: 'Base64', ar: 'Base64' }, fn: toBase64 },
  { id: 'morse', label: { en: 'Morse code', ar: 'شفرة مورس' }, fn: toMorse },
  { id: 'emoji', label: { en: 'Emoji', ar: 'إيموجي' }, fn: toEmoji },
  { id: 'asciiart', label: { en: 'ASCII art', ar: 'فن ASCII' }, fn: toAsciiArt }
];
