# Notes for AI assistants (ChatGPT, Claude, others) working on this repo

Short and simple, so we don't conflict:

- **`data/feed/*` is written by a bot every hour** (`.github/workflows/nooo-hourly.yml`). Do not edit it by hand — commits there will conflict with the hourly run.
- To add funny lines: edit `content/banks/*.json` (both `ar` and `en`). To add languages: `data/languages.json`, **only** with a published source.
- Always run `npm run check` before pushing. It validates content and runs all tests.
- Keep `CNAME` = `nooo.si`. Never touch DNS, e-mail records, or add paid APIs / secrets.
- The site is plain static HTML/CSS/JS (no build step). Art = SVG drawn in `assets/js/lib/scene.js`; sounds = Web Audio in `assets/js/sound.js`.
- Ops guide: `docs/NOOO_HOURLY_OPERATIONS.md`. Last implementation report: `docs/NOOO_IMPLEMENTATION_REPORT.md`.

Change log for assistants:
- 2026-10-09 — Claude built the full site, the hourly engine, tests and the workflow (see the implementation report).
