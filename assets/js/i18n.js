// Interface strings. Content data (cards, languages, art-of-no) carries its own ar/en text.
// To add an interface language later: add a full dictionary here + a <link rel="alternate" hreflang>.

export const DICT = {
  ar: {
    skip: 'انتقل إلى المحتوى',
    tagline: 'NOOO! — اللغة العالمية لكلمة «لا»',
    witTitle: 'ضحك العالم — نكت وحكم وسخرية من كل الأرض',
    witIntro: 'نكت من مختلف أنحاء العالم، وأقوال علماء وحكماء وساخرين بمصادرها. اضغط «نكتة عشوائية» ثم اسمع طبلة النكتة.',
    witJokes: 'نكت العالم', witQuotes: 'حكماء وساخرون', witAll: 'كل العالم', witRegion: 'المنطقة',
    witRandom: '🎲 نكتة عشوائية', witRead: '🔊 اقرأها بصوت', witDrum: '🥁 طبلة',
    kindFolk: 'تراثية', kindOriginal: 'أصلية من NOOO', witTake: 'تعليق NOOO', witSource: 'المصدر', witOriginalAr: 'النص الأصلي عربي', witFreeTr: 'ترجمة حرّة',
    witCount: (n) => `${n} نكتة`,
    navNew: 'جديد الساعة', navArt: 'فن الرفض', navWorld: 'لا حول العالم', navMachine: 'لغة الآلات', navMemes: 'الميمز', navSound: 'الأصوات', navGames: 'الألعاب', navWit: 'ضحك العالم',
    langBtn: 'English', langBtnLabel: 'Switch to English',
    mute: 'كتم الصوت', unmute: 'تشغيل الصوت', volume: 'مستوى الصوت',
    heroKicker: 'موسوعة كوميدية تفاعلية لكل طرق الرفض',
    heroTitle: 'قلها بثقة.',
    heroBtn: 'NOOO!', heroBtnLabel: 'اضغط زر لا العملاق',
    heroHint: 'اضغط الزر. لا يوجد صوت قبل ضغطتك، ويمكنك كتمه من الأعلى.',
    heroSays: ['لا.', 'قلت لا!', 'برضو لا!', 'لاااااا!', 'لا مضروبة في ما لا نهاية.', 'لا، وبالخط العريض.', 'إنجاز: محترف رفض 🏆', 'حتى الزر تعب… لا.', 'لا. لا. لا.', 'اللا هنا أبدية.'],
    clicks: (n) => `عدد مرات الرفض: ${n}`,
    newTitle: 'NEW THIS HOUR — جديد هالساعة',
    newIntro: 'محرك آلي يضيف بطاقة رفض أصلية جديدة كل ساعة تقريبًا. كل بطاقة تركيبة جديدة من سطور كوميدية مكتوبة ومراجعة مسبقًا، ولا تتكرر.',
    badgeNew: 'جديد هالساعة', badgeLatest: 'آخر إضافة',
    addedAt: (time, ago) => `أُضيفت ${time} (${ago})`,
    ago: (m) => (m < 1 ? 'قبل لحظات' : m < 60 ? `قبل ${m} دقيقة` : m < 1440 ? `قبل ${Math.round(m / 60)} ساعة` : `قبل ${Math.round(m / 1440)} يوم`),
    nextRun: (t) => `البطاقة الجاية متوقعة حوالي ${t} — الجدولة مجانية وقد تتأخر قليلًا.`,
    totalCards: (n) => `${n} بطاقة في الأرشيف`,
    feedEmpty: 'أول بطاقة في الطريق. ارجع بعد ساعة.',
    feedError: 'تعذّر تحميل البطاقات الآن. حاول التحديث.',
    freshToast: 'وصلت «لا» طازجة! 🎉',
    archiveBtn: 'تصفّح الأرشيف', archiveMonth: 'الشهر', archiveCat: 'الفئة', allCats: 'الكل', loadMore: 'المزيد',
    cats: { boss: 'لا للمدير', friends: 'لا للأصدقاء', relationship: 'لا في العلاقات', cat: 'لا القطط', scifi: 'لا الفضائية', binary: 'لا بالثنائي', morse: 'لا بمورس', office: 'لا المكتب', monday: 'لا أول الأسبوع', global: 'لا العالمية' },
    share: 'مشاركة', copy: 'نسخ', copied: 'تم النسخ ✓', download: 'تنزيل PNG', replay: 'أعد المؤثر', copyLink: 'نسخ الرابط',
    shareText: 'قلها بثقة: NOOO! 🙅',
    verified: 'مُدقّقة', source: 'المصدر',
    artTitle: 'كيف تقول لا؟ — THE ART OF SAYING NO',
    artIntro: 'اختر الموقف، ثم اختر النبرة. كل الردود أصلية وخالية من الإهانة.',
    worldTitle: 'موسوعة «لا» حول العالم',
    worldIntro: (n) => `${n} لغة بشرية فقط — ندرج اللغة عندما نجد كلمة الرفض في مرجع منشور. لا نخترع ترجمات.`,
    search: 'ابحث عن لغة أو كلمة…', sortBy: 'الترتيب', sortName: 'الاسم', sortLen: 'أقصر كلمة', sortScript: 'غير اللاتينية أولًا',
    results: (n) => `${n} نتيجة`, dirLabel: { rtl: 'من اليمين لليسار', ltr: 'من اليسار لليمين' },
    galacticTitle: 'GALACTIC NOOO — لا الفضائية',
    galacticIntro: 'لغات خيالية موثّقة، ولغات من اختراعنا للضحك فقط — ونفرّق بينهما بوضوح. الرسومات أصلية.',
    kindDocumented: 'لغة خيالية موثّقة', kindOriginal: 'اختراع nooo.si للضحك',
    machineTitle: 'لغة الآلات والإشارات',
    machineIntro: 'هذه ليست لغات بشرية، بل طرق لتمثيل النص. اكتب أي شيء وشاهد ترميزه الحقيقي.',
    machineInput: 'النص', playMorse: '▶ شغّل مورس', stopMorse: '■ إيقاف',
    machineNotes: { binary: 'كل بايت من ترميز UTF-8 مكتوب بثمانية أرقام ثنائية.', hex: 'نفس البايتات بالنظام السداسي عشر.', ascii: 'قيم البايتات بالنظام العشري (تطابق ASCII للحروف الإنجليزية).', unicode: 'رقم كل حرف في معيار يونيكود.', base64: 'طريقة لنقل البايتات كنص آمن.', morse: 'للحروف اللاتينية والأرقام فقط؛ # = حرف غير مدعوم.', emoji: 'للمتعة فقط — ليست ترميزًا رسميًا.', asciiart: 'حروف كبيرة مرسومة بالرموز (لاتيني فقط).' },
    memesTitle: 'متحف الميمز + صانع الميمز',
    memesIntro: 'كل الميمز هنا مرسومة بالكامل داخل الموقع (SVG أصلي) — بدون صور محمية.',
    randomMeme: '🎲 ميم عشوائي', memeSearch: 'ابحث في الميمز…', noMemes: 'لا توجد ميمز مطابقة.',
    makerTitle: 'اصنع ميمك', makerChar: 'الشخصية', makerExpr: 'التعبير', makerBg: 'الخلفية', makerPalette: 'الألوان',
    makerTop: 'النص العلوي', makerBottom: 'النص السفلي', makerPos: 'موضع النص', posBoth: 'أعلى وأسفل', posTop: 'أعلى', posBottom: 'أسفل', makerSticker: 'الملصق',
    makerDefaultTop: 'لما أحد يقول «طلب صغير»', makerDefaultBottom: 'لااااا', makerShuffle: '🔀 عشوائي',
    chars: { cat: 'قطوة', robot: 'روبوت', alien: 'كائن فضائي', boss: 'مدير', mug: 'كوب قهوة', phone: 'جوال', alarm: 'منبه', printer: 'طابعة', ghost: 'شبح', cactus: 'صبار', toaster: 'محمصة', heart: 'قلب', ufo: 'صحن طائر', planet: 'كوكب', laptop: 'لابتوب', bed: 'سرير' },
    exprs: { shocked: 'مصدوم', smug: 'واثق', angry: 'معصب', sleepy: 'نعسان', dramatic: 'درامي', unbothered: 'ما يهمه' },
    bgs: { halftone: 'نقاط بوب', burst: 'انفجار', stripes: 'خطوط', grid: 'شبكة', dots: 'دوائر', rays: 'أشعة', checker: 'مربعات', space: 'فضاء', zigzag: 'متعرج' },
    soundTitle: 'NOOO SOUND LAB — مختبر الأصوات',
    soundIntro: 'أصوات مُولّدة داخل متصفحك، وبعضها بصوت بشري حقيقي من جهازك — صوت واحد في كل مرة، ولا يعمل شيء تلقائيًا.',
    stop: '■ إيقاف',
    sounds: { dramatic: 'درامي', robot: 'روبوت', cat: 'قطوة', alien: 'فضائي', bit8: '8-بت', whisper: 'همس', echo: 'صدى', alarm: 'إنذار كرتوني', morse: 'مورس', kazoo: 'كازو', human: 'صوت بشري', deep: 'صوت عميق', tiny: 'صوت مضحك', announcer: 'المذيع', rimshot: 'طبلة النكتة', trombone: 'ترومبون حزين', buzzer: 'جرس الخطأ', airhorn: 'بوق الهواء', boing: 'بوينغ', gong: 'قونغ' },
    gamesTitle: 'ألعاب الرفض', gameStart: 'ابدأ', gameAgain: 'مرة ثانية',
    g1Title: "Don't Press NO", g1Desc: 'لا تضغط الزر لمدة ١٠ ثوانٍ. الزر سيحاول إقناعك.', g1Btn: 'لا تضغطني', g1Win: 'صمدت! أنت أقوى من الزر. 🏆', g1Lose: (s) => `ضغطته بعد ${s} ثانية. طبعًا ضغطته.`,
    g1Taunts: ['ضغطة صغيرة بس؟', 'محد بيدري…', 'أنا زر لطيف 🥺', 'تخيل الصوت!', 'يا رجل، ضغطة وحدة', 'آخر فرصة!'],
    g1Left: (s) => `باقي ${s} ثانية`,
    g2Title: 'Find the NO', g2Desc: 'لاقِ كلمة NO الوحيدة بين المزيفين. ٥ جولات.', g2Round: (r) => `الجولة ${r} من ٥`, g2Done: (t) => `خلصت في ${t} ثانية! 🔎`,
    g3Title: 'NO Reaction Test', g3Desc: 'انتظر حتى تتحول المنطقة إلى «NO!» ثم اضغط بأسرع ما يمكن.', g3Wait: 'انتظر…', g3Go: 'NO! اضغط!', g3Early: 'بدري! انتظر الإشارة.', g3Result: (ms) => `سرعة رفضك: ${ms} ملي ثانية`, g3Tap: 'اضغط للبدء',
    g4Title: 'NOOO Typing Race', g4Desc: 'اكتب جملة الرفض بأسرع ما يمكن.', g4Placeholder: 'اكتب هنا…', g4Result: (s, acc) => `الوقت: ${s} ث — الدقة: ${acc}%`,
    hallTitle: 'HALL OF NO — جدار الرفض', hallShuffle: '🔀 خلط',
    walls: { corporate: 'لا المؤسسية', robot: 'لا الآلية', cat: 'لا القطط', galactic: 'لا المجرية', monday: 'لا أول الأسبوع' },
    footerAbout: 'nooo.si موقع ترفيهي مستقل. المحتوى أصلي، والرسومات والأصوات مُولّدة داخل الموقع.',
    footerEngine: 'البطاقات الجديدة تتجدد تلقائيًا كل ساعة — بدون ذكاء اصطناعي مدفوع وبدون جمع بيانات.',
    footerHonest: 'كلمات اللغات منقولة من مراجع منشورة مذكورة بجانب كل لغة. إن وجدت خطأ، أخبرنا عبر GitHub.',
    footerRepo: 'الكود على GitHub',
    reduced: 'تم تقليل الحركة احترامًا لإعدادات جهازك.'
  },
  en: {
    skip: 'Skip to content',
    tagline: 'NOOO! — The Universal Language of No',
    witTitle: 'THE WORLD LAUGHS — jokes, wisdom and satire from everywhere',
    witIntro: 'Jokes from around the world plus quotes from scholars, sages and satirists, with sources. Hit "Random joke", then bring the rimshot.',
    witJokes: 'World jokes', witQuotes: 'Sages & satirists', witAll: 'Whole world', witRegion: 'Region',
    witRandom: '🎲 Random joke', witRead: '🔊 Read aloud', witDrum: '🥁 Rimshot',
    kindFolk: 'Folk tale', kindOriginal: 'NOOO original', witTake: 'NOOO take', witSource: 'Source', witOriginalAr: 'Original text is Arabic', witFreeTr: 'Free translation',
    witCount: (n) => `${n} jokes`,
    navNew: 'New this hour', navArt: 'Art of No', navWorld: 'World', navMachine: 'Machines', navMemes: 'Memes', navSound: 'Sounds', navGames: 'Games', navWit: 'World laughs',
    langBtn: 'عربي', langBtnLabel: 'التبديل إلى العربية',
    mute: 'Mute', unmute: 'Unmute', volume: 'Volume',
    heroKicker: 'An interactive comedy encyclopedia of every way to say no',
    heroTitle: 'Say it with confidence.',
    heroBtn: 'NOOO!', heroBtnLabel: 'Press the giant NO button',
    heroHint: 'Press the button. No sound plays before you do, and you can mute it up top.',
    heroSays: ['NO.', 'I SAID NO!', 'STILL NO!', 'NOOOOO!', 'NO times infinity.', 'No, in bold.', 'Achievement: Professional Refuser 🏆', 'Even the button is tired… no.', 'No. No. No.', 'The no here is eternal.'],
    clicks: (n) => `Refusals so far: ${n}`,
    newTitle: 'NEW THIS HOUR',
    newIntro: 'An automatic engine adds a fresh, original refusal card about once an hour. Each card is a new combination of pre-written, reviewed comedy lines — never a repeat.',
    badgeNew: 'New this hour', badgeLatest: 'Latest',
    addedAt: (time, ago) => `Added ${time} (${ago})`,
    ago: (m) => (m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`),
    nextRun: (t) => `Next card expected around ${t} — free scheduling can run a little late.`,
    totalCards: (n) => `${n} cards in the archive`,
    feedEmpty: 'The first card is on its way. Come back next hour.',
    feedError: "Couldn't load the cards right now. Try refreshing.",
    freshToast: 'A fresh NO just landed! 🎉',
    archiveBtn: 'Browse the archive', archiveMonth: 'Month', archiveCat: 'Category', allCats: 'All', loadMore: 'Load more',
    cats: { boss: 'Boss NO', friends: 'Friends NO', relationship: 'Relationship NO', cat: 'Cat NO', scifi: 'Sci-Fi NO', binary: 'Binary NO', morse: 'Morse NO', office: 'Office NO', monday: 'Monday NO', global: 'Global NO' },
    share: 'Share', copy: 'Copy', copied: 'Copied ✓', download: 'Download PNG', replay: 'Replay effect', copyLink: 'Copy link',
    shareText: 'Say it with confidence: NOOO! 🙅',
    verified: 'Verified', source: 'Source',
    artTitle: 'THE ART OF SAYING NO',
    artIntro: 'Pick a situation, then pick a tone. Every reply is original and insult-free.',
    worldTitle: 'The World Encyclopedia of No',
    worldIntro: (n) => `${n} human languages only — a language is listed once we find its refusal word in a published reference. We don't invent translations.`,
    search: 'Search a language or word…', sortBy: 'Sort', sortName: 'Name', sortLen: 'Shortest word', sortScript: 'Non-Latin first',
    results: (n) => `${n} results`, dirLabel: { rtl: 'Right-to-left', ltr: 'Left-to-right' },
    galacticTitle: 'GALACTIC NOOO',
    galacticIntro: 'Documented fictional languages, plus a few we invented just for laughs — always clearly labelled. All art is original.',
    kindDocumented: 'Documented fictional language', kindOriginal: 'Invented by nooo.si, for fun',
    machineTitle: 'Machines & Signals',
    machineIntro: "These aren't human languages — they are ways to represent text. Type anything and see its real encoding.",
    machineInput: 'Text', playMorse: '▶ Play Morse', stopMorse: '■ Stop',
    machineNotes: { binary: 'Each UTF-8 byte written as eight binary digits.', hex: 'The same bytes in hexadecimal.', ascii: 'Byte values in decimal (matches ASCII for English letters).', unicode: 'Each character’s number in the Unicode standard.', base64: 'A way to carry bytes as safe text.', morse: 'Latin letters and digits only; # = unsupported character.', emoji: 'Just for fun — not an official encoding.', asciiart: 'Big letters drawn with symbols (Latin only).' },
    memesTitle: 'MEME MUSEUM + MEME MAKER',
    memesIntro: 'Every meme here is drawn inside the site (original SVG) — no protected images.',
    randomMeme: '🎲 Random meme', memeSearch: 'Search memes…', noMemes: 'No matching memes.',
    makerTitle: 'Make your meme', makerChar: 'Character', makerExpr: 'Expression', makerBg: 'Background', makerPalette: 'Colors',
    makerTop: 'Top text', makerBottom: 'Bottom text', makerPos: 'Text position', posBoth: 'Top & bottom', posTop: 'Top', posBottom: 'Bottom', makerSticker: 'Sticker',
    makerDefaultTop: 'When someone says "quick favor"', makerDefaultBottom: 'NOOOOO', makerShuffle: '🔀 Shuffle',
    chars: { cat: 'Cat', robot: 'Robot', alien: 'Alien', boss: 'Boss', mug: 'Coffee mug', phone: 'Phone', alarm: 'Alarm clock', printer: 'Printer', ghost: 'Ghost', cactus: 'Cactus', toaster: 'Toaster', heart: 'Heart', ufo: 'UFO', planet: 'Planet', laptop: 'Laptop', bed: 'Bed' },
    exprs: { shocked: 'Shocked', smug: 'Smug', angry: 'Angry', sleepy: 'Sleepy', dramatic: 'Dramatic', unbothered: 'Unbothered' },
    bgs: { halftone: 'Pop dots', burst: 'Burst', stripes: 'Stripes', grid: 'Grid', dots: 'Circles', rays: 'Rays', checker: 'Checker', space: 'Space', zigzag: 'Zigzag' },
    soundTitle: 'NOOO SOUND LAB',
    soundIntro: 'Sounds made in your browser, some with a real human voice from your device — one at a time, nothing plays automatically.',
    stop: '■ Stop',
    sounds: { dramatic: 'Dramatic', robot: 'Robot', cat: 'Cat', alien: 'Alien', bit8: '8-bit', whisper: 'Whisper', echo: 'Echo', alarm: 'Cartoon alarm', morse: 'Morse', kazoo: 'Kazoo', human: 'Human voice', deep: 'Deep voice', tiny: 'Squeaky voice', announcer: 'Announcer', rimshot: 'Rimshot', trombone: 'Sad trombone', buzzer: 'Wrong buzzer', airhorn: 'Air horn', boing: 'Boing', gong: 'Gong' },
    gamesTitle: 'NO Games', gameStart: 'Start', gameAgain: 'Again',
    g1Title: "Don't Press NO", g1Desc: "Don't press the button for 10 seconds. It will try to convince you.", g1Btn: "DON'T PRESS", g1Win: 'You survived! Stronger than a button. 🏆', g1Lose: (s) => `You pressed it after ${s}s. Of course you did.`,
    g1Taunts: ['Just a tiny press?', 'Nobody will know…', "I'm a cute button 🥺", 'Imagine the sound!', 'Come on, one press', 'Last chance!'],
    g1Left: (s) => `${s}s left`,
    g2Title: 'Find the NO', g2Desc: 'Find the one real NO among the fakes. 5 rounds.', g2Round: (r) => `Round ${r} of 5`, g2Done: (t) => `Done in ${t}s! 🔎`,
    g3Title: 'NO Reaction Test', g3Desc: 'Wait for the box to shout “NO!”, then click as fast as you can.', g3Wait: 'Wait…', g3Go: 'NO! Click!', g3Early: 'Too early! Wait for it.', g3Result: (ms) => `Your refusal reflex: ${ms} ms`, g3Tap: 'Click to start',
    g4Title: 'NOOO Typing Race', g4Desc: 'Type the refusal as fast as you can.', g4Placeholder: 'Type here…', g4Result: (s, acc) => `Time: ${s}s — Accuracy: ${acc}%`,
    hallTitle: 'HALL OF NO', hallShuffle: '🔀 Shuffle',
    walls: { corporate: 'Corporate NO', robot: 'Robot NO', cat: 'Cat NO', galactic: 'Galactic NO', monday: 'Monday NO' },
    footerAbout: 'nooo.si is an independent comedy site. Content is original; art and sounds are generated inside the site.',
    footerEngine: 'New cards appear automatically every hour — no paid AI, no tracking.',
    footerHonest: 'Language words come from the published references linked next to each language. Found a mistake? Tell us on GitHub.',
    footerRepo: 'Code on GitHub',
    reduced: 'Motion reduced to respect your device settings.'
  }
};

const KEY = 'nooo.lang';
let current = 'ar';
const listeners = new Set();

export function detectLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'ar' || q === 'en') return q;
    const saved = localStorage.getItem(KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch { /* storage unavailable */ }
  return (navigator.language || 'ar').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export const lang = () => current;
export const t = (key) => DICT[current][key] ?? DICT.en[key] ?? key;

export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = t(el.dataset.i18n);
    if (typeof v === 'string') el.textContent = v;
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      const v = t(key);
      if (typeof v === 'string') el.setAttribute(attr, v);
    });
  });
}

export function setLang(next, { persist = true } = {}) {
  current = next === 'en' ? 'en' : 'ar';
  document.documentElement.lang = current;
  document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
  if (persist) { try { localStorage.setItem(KEY, current); } catch { /* ignore */ } }
  applyStatic();
  listeners.forEach((fn) => fn(current));
}

export const onLangChange = (fn) => listeners.add(fn);
