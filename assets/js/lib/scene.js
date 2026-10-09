// Original SVG "meme scene" renderer. Input: a visualPreset descriptor. Output: SVG markup string.
// All art here is drawn from primitives — no third-party images or characters.
// Text is never injected here except the sticker, which is escaped.

export const PALETTES = {
  tomato: { bg: '#FF4D3D', alt: '#FFD23F', body: '#FFF4E0', pop: '#1FC8FF' },
  lemon: { bg: '#FFE45E', alt: '#FF6B9A', body: '#FFFFFF', pop: '#3D5AFE' },
  cyan: { bg: '#22D3EE', alt: '#FDE047', body: '#FFF7ED', pop: '#F43F5E' },
  bubblegum: { bg: '#FF8FC7', alt: '#7CF5C4', body: '#FFF1F7', pop: '#4C1D95' },
  lime: { bg: '#B6F23A', alt: '#FF5F3D', body: '#F7FFE8', pop: '#2563EB' },
  grape: { bg: '#8B5CF6', alt: '#FDE047', body: '#F5F3FF', pop: '#F97316' },
  tangerine: { bg: '#FF9F1C', alt: '#2EC4B6', body: '#FFF8EC', pop: '#E71D36' },
  mint: { bg: '#5EEAD4', alt: '#FF7AB6', body: '#F0FDFA', pop: '#7C3AED' },
  night: { bg: '#1E1B4B', alt: '#F472B6', body: '#E0E7FF', pop: '#FACC15' }
};

const INK = '#111111';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function background(kind, p, id) {
  const defs = {
    halftone: `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3.2" fill="${p.alt}" opacity=".55"/></pattern>`,
    dots: `<pattern id="${id}" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="4" fill="${p.body}" opacity=".5"/><circle cx="19" cy="19" r="2.5" fill="${p.alt}" opacity=".7"/></pattern>`,
    stripes: `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="12" height="24" fill="${p.alt}" opacity=".45"/></pattern>`,
    grid: `<pattern id="${id}" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="${INK}" stroke-opacity=".18" stroke-width="2"/></pattern>`,
    checker: `<pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${p.alt}" opacity=".4"/><rect x="20" y="20" width="20" height="20" fill="${p.alt}" opacity=".4"/></pattern>`,
    zigzag: `<pattern id="${id}" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 15 L10 5 L20 15 L30 5 L40 15" fill="none" stroke="${p.alt}" stroke-width="4" opacity=".7"/></pattern>`
  };
  if (kind === 'burst' || kind === 'rays') {
    const n = kind === 'burst' ? 18 : 12;
    let rays = '';
    for (let i = 0; i < n; i += 2) {
      const a1 = (i / n) * Math.PI * 2;
      const a2 = ((i + 1) / n) * Math.PI * 2;
      rays += `<path d="M200 160 L${200 + Math.cos(a1) * 520} ${160 + Math.sin(a1) * 520} L${200 + Math.cos(a2) * 520} ${160 + Math.sin(a2) * 520}Z" fill="${p.alt}" opacity="${kind === 'burst' ? '.6' : '.35'}"/>`;
    }
    return { defs: '', layer: `<rect width="400" height="300" fill="${p.bg}"/>${rays}` };
  }
  if (kind === 'space') {
    let stars = '';
    for (let i = 0; i < 40; i += 1) {
      const x = (i * 97) % 400;
      const y = (i * 61) % 300;
      stars += `<circle cx="${x}" cy="${y}" r="${(i % 3) + 1}" fill="#fff" opacity="${0.4 + (i % 5) / 10}"/>`;
    }
    return { defs: '', layer: `<rect width="400" height="300" fill="#140F33"/>${stars}<circle cx="345" cy="60" r="26" fill="${p.alt}" stroke="${INK}" stroke-width="4"/>` };
  }
  const def = defs[kind] ?? defs.halftone;
  return { defs: def, layer: `<rect width="400" height="300" fill="${p.bg}"/><rect width="400" height="300" fill="url(#${id})"/>` };
}

function face(cx, cy, s, expr) {
  const k = (n) => (n * s).toFixed(1);
  const ew = 9 * s;
  const L = cx - 16 * s;
  const R = cx + 16 * s;
  const st = `stroke="${INK}" stroke-width="${k(3.5)}" stroke-linecap="round" fill="none"`;
  switch (expr) {
    case 'shocked':
      return `<circle cx="${L}" cy="${cy}" r="${ew}" fill="#fff" stroke="${INK}" stroke-width="${k(3)}"/><circle cx="${R}" cy="${cy}" r="${ew}" fill="#fff" stroke="${INK}" stroke-width="${k(3)}"/><circle cx="${L}" cy="${cy}" r="${k(2.6)}" fill="${INK}"/><circle cx="${R}" cy="${cy}" r="${k(2.6)}" fill="${INK}"/><ellipse cx="${cx}" cy="${cy + 22 * s}" rx="${k(7)}" ry="${k(10)}" fill="${INK}"/>`;
    case 'smug':
      return `<path d="M${L - ew} ${cy} q${ew} ${-6 * s} ${ew * 2} 0" ${st}/><path d="M${R - ew} ${cy} q${ew} ${-6 * s} ${ew * 2} 0" ${st}/><path d="M${cx - 12 * s} ${cy + 20 * s} q${14 * s} ${8 * s} ${24 * s} ${-6 * s}" ${st}/>`;
    case 'angry':
      return `<path d="M${L - ew} ${cy - 12 * s} L${L + ew} ${cy - 5 * s}" ${st}/><path d="M${R + ew} ${cy - 12 * s} L${R - ew} ${cy - 5 * s}" ${st}/><circle cx="${L}" cy="${cy + 3 * s}" r="${k(4)}" fill="${INK}"/><circle cx="${R}" cy="${cy + 3 * s}" r="${k(4)}" fill="${INK}"/><path d="M${cx - 14 * s} ${cy + 25 * s} q${14 * s} ${-10 * s} ${28 * s} 0" ${st}/>`;
    case 'sleepy':
      return `<path d="M${L - ew} ${cy} q${ew} ${7 * s} ${ew * 2} 0" ${st}/><path d="M${R - ew} ${cy} q${ew} ${7 * s} ${ew * 2} 0" ${st}/><ellipse cx="${cx}" cy="${cy + 21 * s}" rx="${k(5)}" ry="${k(4)}" fill="${INK}"/><text x="${cx + 34 * s}" y="${cy - 18 * s}" font-family="Bungee, sans-serif" font-size="${k(20)}" fill="${INK}">z</text><text x="${cx + 48 * s}" y="${cy - 34 * s}" font-family="Bungee, sans-serif" font-size="${k(14)}" fill="${INK}">z</text>`;
    case 'dramatic':
      return `<circle cx="${L}" cy="${cy}" r="${ew}" fill="#fff" stroke="${INK}" stroke-width="${k(3)}"/><circle cx="${R}" cy="${cy}" r="${ew}" fill="#fff" stroke="${INK}" stroke-width="${k(3)}"/><circle cx="${L}" cy="${cy + 2 * s}" r="${k(4.5)}" fill="${INK}"/><circle cx="${R}" cy="${cy + 2 * s}" r="${k(4.5)}" fill="${INK}"/><path d="M${L + 2 * s} ${cy + ew + 2 * s} q${-4 * s} ${10 * s} 0 ${14 * s} q${4 * s} ${-4 * s} 0 ${-14 * s}" fill="#4FC3F7" stroke="${INK}" stroke-width="${k(1.5)}"/><path d="M${cx - 16 * s} ${cy + 16 * s} q${16 * s} ${26 * s} ${32 * s} 0 Z" fill="${INK}"/>`;
    default: // unbothered — sunglasses
      return `<path d="M${L - ew - 3 * s} ${cy - 6 * s} h${(R - L) + ew * 2 + 6 * s}" ${st}/><rect x="${L - ew}" y="${cy - 6 * s}" width="${ew * 2}" height="${k(11)}" rx="${k(4)}" fill="${INK}"/><rect x="${R - ew}" y="${cy - 6 * s}" width="${ew * 2}" height="${k(11)}" rx="${k(4)}" fill="${INK}"/><path d="M${cx - 10 * s} ${cy + 22 * s} h${20 * s}" ${st}/>`;
  }
}

const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;

function character(kind, expr, p) {
  switch (kind) {
    case 'cat':
      return `<path d="M128 132 L140 70 L178 110 Z" fill="${p.body}" ${S}/><path d="M272 132 L260 70 L222 110 Z" fill="${p.body}" ${S}/><path d="M146 98 L150 84 L164 104Z" fill="${p.alt}"/><path d="M254 98 L250 84 L236 104Z" fill="${p.alt}"/><ellipse cx="200" cy="160" rx="82" ry="68" fill="${p.body}" ${S}/>${face(200, 150, 1.15, expr)}<path d="M132 168 h-34 M132 178 h-30 M268 168 h34 M268 178 h30" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M194 168 l6 6 l6 -6 z" fill="${p.pop}" stroke="${INK}" stroke-width="2"/>`;
    case 'robot':
      return `<path d="M200 78 V52" ${S}/><circle cx="200" cy="46" r="9" fill="${p.pop}" ${S}/><rect x="120" y="78" width="160" height="128" rx="22" fill="#C9D3E0" ${S}/><rect x="138" y="96" width="124" height="88" rx="14" fill="${p.body}" stroke="${INK}" stroke-width="4"/>${face(200, 132, 1, expr)}<rect x="104" y="118" width="16" height="40" rx="6" fill="${p.alt}" ${S}/><rect x="280" y="118" width="16" height="40" rx="6" fill="${p.alt}" ${S}/>`;
    case 'alien': case 'horned': case 'tall': case 'rider': case 'winged': case 'pointy': case 'blob': case 'cyclops': case 'catstronaut': {
      const green = '#7CF56A';
      const extra = {
        horned: `<path d="M150 92 L132 50 L170 82Z M250 92 L268 50 L230 82Z" fill="${p.alt}" ${S}/>`,
        tall: `<path d="M200 70 V24" ${S}/><circle cx="200" cy="20" r="8" fill="${p.pop}" ${S}/>`,
        winged: `<path d="M118 150 q-60 -40 -50 20 q30 -10 50 10Z M282 150 q60 -40 50 20 q-30 -10 -50 10Z" fill="${p.alt}" ${S}/>`,
        pointy: `<path d="M124 150 L76 118 L128 170Z M276 150 L324 118 L272 170Z" fill="${green}" ${S}/>`,
        catstronaut: `<circle cx="200" cy="150" r="98" fill="#fff" fill-opacity=".35" ${S}/><path d="M146 92 L152 62 L176 86Z M254 92 L248 62 L224 86Z" fill="${green}" ${S}/>`,
        rider: `<path d="M110 220 q90 -40 180 0" fill="none" stroke="${p.alt}" stroke-width="14" stroke-linecap="round"/>`
      }[kind] ?? `<path d="M168 88 Q150 50 136 46 M232 88 Q250 50 264 46" fill="none" ${S}/><circle cx="136" cy="44" r="8" fill="${p.pop}" ${S}/><circle cx="264" cy="44" r="8" fill="${p.pop}" ${S}/>`;
      const head = kind === 'blob'
        ? `<path d="M110 200 Q100 90 200 84 Q300 90 290 200 Q250 230 200 214 Q150 230 110 200Z" fill="${green}" ${S}/>`
        : `<ellipse cx="200" cy="150" rx="${kind === 'tall' ? 66 : 80}" ry="${kind === 'tall' ? 84 : 72}" fill="${green}" ${S}/>`;
      const f = kind === 'cyclops'
        ? `<circle cx="200" cy="140" r="26" fill="#fff" ${S}/><circle cx="200" cy="142" r="10" fill="${INK}"/><path d="M180 186 q20 ${expr === 'angry' ? -10 : 12} 40 0" fill="none" ${S}/>`
        : face(200, 145, 1.2, expr);
      return `${extra}${head}${f}`;
    }
    case 'boss':
      return `<path d="M120 270 Q120 190 200 186 Q280 190 280 270Z" fill="#334155" ${S}/><path d="M188 192 L200 250 L212 192Z" fill="${p.pop}" ${S}/><circle cx="200" cy="128" r="62" fill="${p.body}" ${S}/><path d="M146 96 q54 -40 108 0" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>${face(200, 126, 1, expr)}`;
    case 'mug':
      return `<path d="M168 72 q-10 -16 0 -30 M200 72 q-10 -16 0 -30 M232 72 q-10 -16 0 -30" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M276 120 q52 0 46 44 q-6 40 -50 36" fill="none" stroke="${INK}" stroke-width="14"/><path d="M276 120 q52 0 46 44 q-6 40 -50 36" fill="none" stroke="${p.alt}" stroke-width="6"/><path d="M124 86 h156 l-14 160 q-2 16 -18 16 h-92 q-16 0 -18 -16Z" fill="${p.body}" ${S}/>${face(202, 160, 1.15, expr)}`;
    case 'phone':
      return `<rect x="138" y="44" width="124" height="232" rx="26" fill="${INK}"/><rect x="148" y="56" width="104" height="208" rx="18" fill="${p.body}"/><rect x="182" y="62" width="36" height="8" rx="4" fill="${INK}"/>${face(200, 150, 1, expr)}<circle cx="248" cy="74" r="12" fill="#EF4444" ${S}/><text x="248" y="79" text-anchor="middle" font-family="Bungee, sans-serif" font-size="12" fill="#fff">99</text>`;
    case 'alarm':
      return `<circle cx="140" cy="78" r="26" fill="${p.alt}" ${S}/><circle cx="260" cy="78" r="26" fill="${p.alt}" ${S}/><path d="M150 236 l-20 30 M250 236 l20 30" ${S}/><circle cx="200" cy="156" r="90" fill="${p.body}" ${S}/>${face(200, 150, 1.2, expr)}<path d="M200 82 v12 M200 218 v12 M126 156 h12 M262 156 h12" stroke="${INK}" stroke-width="4"/>`;
    case 'printer':
      return `<rect x="150" y="40" width="100" height="70" fill="#fff" ${S}/><text x="200" y="88" text-anchor="middle" font-family="Bungee, sans-serif" font-size="30" fill="${p.pop}">NO</text><rect x="104" y="100" width="192" height="120" rx="16" fill="#CBD5E1" ${S}/><rect x="140" y="200" width="120" height="44" fill="#fff" ${S}/>${face(200, 148, 1, expr)}<circle cx="276" cy="120" r="6" fill="#22C55E" stroke="${INK}" stroke-width="2"/>`;
    case 'ghost':
      return `<path d="M120 270 V150 Q120 70 200 70 Q280 70 280 150 V270 l-26 -20 l-27 20 l-27 -20 l-27 20 l-27 -20Z" fill="#fff" ${S}/>${face(200, 145, 1.2, expr)}`;
    case 'cactus':
      return `<path d="M150 262 h100 l-10 30 h-80Z" fill="#E07A5F" ${S}/><path d="M168 262 V96 q0 -36 32 -36 q32 0 32 36 V262Z" fill="#5BBF4A" ${S}/><path d="M168 170 h-30 q-14 0 -14 -16 v-40 q0 -12 12 -12 q12 0 12 12 v30 h20" fill="#5BBF4A" ${S}/><path d="M232 150 h30 q14 0 14 -16 v-24 q0 -12 -12 -12 q-12 0 -12 12 v14 h-20" fill="#5BBF4A" ${S}/>${face(200, 132, 0.85, expr)}`;
    case 'toaster':
      return `<rect x="150" y="52" width="46" height="70" rx="10" fill="#E9B872" ${S}/><rect x="206" y="62" width="46" height="60" rx="10" fill="#E9B872" ${S}/><rect x="110" y="100" width="180" height="140" rx="30" fill="#D1D5DB" ${S}/><rect x="296" y="150" width="14" height="40" rx="6" fill="${p.pop}" ${S}/>${face(200, 170, 1.1, expr)}`;
    case 'heart':
      return `<path d="M200 262 C80 190 92 82 160 82 C186 82 200 104 200 104 C200 104 214 82 240 82 C308 82 320 190 200 262Z" fill="#FF5C8A" ${S}/>${face(200, 150, 1.1, expr)}`;
    case 'ufo':
      return `<path d="M170 210 L120 296 H280 L230 210Z" fill="${p.alt}" opacity=".45"/><ellipse cx="200" cy="130" rx="60" ry="56" fill="#BAE6FD" fill-opacity=".85" ${S}/>${face(200, 122, 0.85, expr)}<ellipse cx="200" cy="176" rx="130" ry="38" fill="#94A3B8" ${S}/><circle cx="140" cy="180" r="7" fill="${p.pop}"/><circle cx="200" cy="190" r="7" fill="${p.pop}"/><circle cx="260" cy="180" r="7" fill="${p.pop}"/>`;
    case 'planet':
      return `<ellipse cx="200" cy="160" rx="150" ry="34" fill="none" stroke="${INK}" stroke-width="14" transform="rotate(-14 200 160)"/><circle cx="200" cy="155" r="84" fill="${p.alt}" ${S}/><ellipse cx="200" cy="160" rx="150" ry="34" fill="none" stroke="${p.pop}" stroke-width="6" stroke-dasharray="230 700" stroke-dashoffset="-120" transform="rotate(-14 200 160)"/>${face(200, 148, 1.2, expr)}`;
    case 'laptop':
      return `<rect x="110" y="60" width="180" height="128" rx="12" fill="${INK}"/><rect x="122" y="72" width="156" height="104" rx="6" fill="${p.body}"/>${face(200, 118, 1, expr)}<path d="M80 200 h240 l-20 34 h-200Z" fill="#CBD5E1" ${S}/>`;
    case 'bed':
      return `<rect x="70" y="170" width="260" height="70" rx="10" fill="#8D5A3B" ${S}/><rect x="70" y="120" width="30" height="140" rx="8" fill="#8D5A3B" ${S}/><rect x="104" y="128" width="80" height="50" rx="20" fill="#fff" ${S}/><path d="M150 176 Q160 130 230 128 Q320 126 324 176Z" fill="${p.alt}" ${S}/>${face(144, 150, 0.7, expr)}`;
    default:
      return `<circle cx="200" cy="150" r="80" fill="${p.body}" ${S}/>${face(200, 150, 1.2, expr)}`;
  }
}

/**
 * @param {object} preset visualPreset descriptor
 * @param {object} [opts] { sticker: boolean, idSuffix: string, title: string }
 */
export function renderScene(preset = {}, opts = {}) {
  const p = PALETTES[preset.palette] ?? PALETTES.tomato;
  const id = `bg${String(opts.idSuffix ?? preset.seed ?? Math.floor(Math.random() * 1e6)).replace(/[^\w-]/g, '')}`;
  const bg = background(preset.background ?? 'halftone', p, id);
  const shift = preset.layout === 'left' ? -60 : preset.layout === 'right' ? 60 : 0;
  const ch = character(preset.character ?? 'cat', preset.expression ?? 'shocked', p);
  const sticker = opts.sticker === false || !preset.sticker ? '' : (() => {
    const txt = esc(preset.sticker);
    const x = preset.layout === 'left' ? 300 : preset.layout === 'right' ? 100 : 316;
    const w = Math.max(84, Array.from(txt).length * 15 + 34);
    return `<g transform="translate(${x} 60) rotate(${preset.layout === 'right' ? -10 : 10})"><rect x="${-w / 2}" y="-24" width="${w}" height="48" rx="8" fill="${p.pop}" stroke="${INK}" stroke-width="5"/><text x="0" y="9" text-anchor="middle" font-family="Bungee, Lalezar, sans-serif" font-size="24" fill="#fff" stroke="${INK}" stroke-width="1.2" paint-order="stroke">${txt}</text></g>`;
  })();
  const title = opts.title ? `<title>${esc(opts.title)}</title>` : '';
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" class="scene anim-${esc(preset.animation ?? 'none')}">${title}<defs>${bg.defs}</defs>${bg.layer}<g class="scene-char" transform="translate(${shift} 0)">${ch}</g>${sticker}<rect x="2.5" y="2.5" width="395" height="295" fill="none" stroke="${INK}" stroke-width="5"/></svg>`;
}

export const CHARACTERS = ['cat', 'robot', 'alien', 'boss', 'mug', 'phone', 'alarm', 'printer', 'ghost', 'cactus', 'toaster', 'heart', 'ufo', 'planet', 'laptop', 'bed'];
export const EXPRESSIONS = ['shocked', 'smug', 'angry', 'sleepy', 'dramatic', 'unbothered'];
export const BACKGROUNDS = ['halftone', 'burst', 'stripes', 'grid', 'dots', 'rays', 'checker', 'space', 'zigzag'];
