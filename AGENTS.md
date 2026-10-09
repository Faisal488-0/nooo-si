# Notes for AI assistants (ChatGPT, Claude, others) working on this repo

Short and simple, so we don't conflict:

- **`data/feed/*` is written by a bot every hour** (`.github/workflows/nooo-hourly.yml`). Do not edit it by hand — commits there will conflict with the hourly run.
- To add funny lines: edit `content/banks/*.json` (both `ar` and `en`). To add languages: `data/languages.json`, **only** with a published source.
- Always run `npm run check` before pushing. It validates content and runs all tests.
- Keep `CNAME` = `nooo.si`. Never touch DNS, e-mail records, or add paid APIs / secrets.
- The site is plain static HTML/CSS/JS (no build step). Art = SVG drawn in `assets/js/lib/scene.js`; sounds = Web Audio in `assets/js/sound.js`.
- UI/UX: a design skill is installed at `.claude/skills/ui-ux-pro-max` (works for Claude, and its `scripts/search.py` runs anywhere with Python 3). Use it for design or UX changes.
- Ops guide: `docs/NOOO_HOURLY_OPERATIONS.md`. Last implementation report: `docs/NOOO_IMPLEMENTATION_REPORT.md`.

Change log for assistants:
- 2026-10-09 — Claude built the full site, the hourly engine, tests and the workflow (see the implementation report).
- 2026-10-09 — Claude installed the UI UX Pro Max skill in `.claude/skills/ui-ux-pro-max` and added `CLAUDE.md`. No change to the site or the hourly engine.
- 2026-10-09 — Claude ran the UI UX Pro Max audit: all tap targets now ≥44px, white-on-red text uses `--red-text` (4.5:1), small muted text opacity raised. CSS only.
- 2026-10-09 — Claude added the WORLD LAUGHS section (`data/wit.json`: 28 jokes from 22 regions + 11 sourced quotes; `assets/js/sections/wit.js`), real human-voice pads (browser speech) + rimshot/trombone/buzzer/etc. in `sound.js`, and removed the GitHub Actions mention from the footer. Add new jokes/quotes in `data/wit.json` only with a published source for quotes.
- 2026-10-09 — Claude added museum photo cards: `scripts/lib/photos.mjs`, `content/banks/photo.json` (settings + captions), images in `data/feed/img/` (bot-owned like the rest of data/feed). CC0/PD only. Kill switch: `enabled:false`. Tests use a fake fetch (never the network).
- 2026-10-09 — Claude added the NOOO NEWS ticker (`assets/js/ticker.js`, `data/no-history.json`: 21 sourced events × 9 languages). Direction follows the language's writing system (RTL languages scroll right→left, LTR languages left→right; flip via `MOTION` in ticker.js). Add events with a real https source and all 9 translations.
