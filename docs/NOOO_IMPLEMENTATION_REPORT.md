# NOOO.SI — Implementation Report

Date: 2026-10-09 · Author: Claude (session `session_01D3uaZeYAKSCzGkdEDbMz5q`)
Status codes: **VERIFIED** (tested with evidence) · **FIXED** · **PARTIAL** · **BLOCKED** · **UNTESTED**

| Item | Status | Details |
|---|---|---|
| Repository & HEAD | VERIFIED | `Faisal488-0/nooo-si`, branch `main`. Build commit `23e85e2`; bot commits `f6ab807` (manual run) and `f47cf87` (first scheduled run). |
| Site | VERIFIED (from GitHub runners) / PARTIAL (from Claude) | The workflow's "Verify the new card is live on nooo.si" step only succeeds when `https://nooo.si/data/feed/latest.json` (or `http://` fallback) returns the new card id — it passed in both runs. Claude's own fetch tool refuses the domain (robots check) and the owner's in-app browser could not open nooo.si at check time, so a visual check of the live page was not possible from this session. Local rendering was checked in headless Chromium (desktop + 390 px mobile, AR + EN): no console errors, no horizontal scroll. |
| Visual design | VERIFIED (local) | Pop-art / neo-brutalist bilingual page: giant NOOO! button with **24** reactions and an escalating NO. → I SAID NO! → STILL NO! → NOOOOO! line; NEW THIS HOUR; Art of Saying No (10 categories × 6 tones); world encyclopedia; GALACTIC NOOO; Machines & Signals; Meme Museum + Maker; Sound Lab; 4 games; Hall of NO; share dialog; 404 page; OG image. |
| Hourly engine | VERIFIED | `scripts/hourly-content-generator.mjs` + `scripts/lib/engine.mjs`: composes an ask + reply (or phrase + real encoding, or a sourced language) + an original SVG scene descriptor. SHA-256 dedup, Jaccard similarity guard (≥ 0.8 rejected), recency/usage scoring, `CONTENT_POOL_EXHAUSTED` (exit 3) instead of recycling. Zero dependencies, no network, no API. |
| Content added | VERIFIED | Banks: 7 comedy categories × AR/EN + binary/morse/global banks → **9,480** unique combinations. 20 Art-of-No situations × 6 tones × 2 languages. 71 human languages (each sourced), 5 documented fictional + 4 clearly labelled site originals. Feed: 12 cards so far (10 seeded at launch by the same engine, 2 by the workflow). |
| Scheduling | VERIFIED | `.github/workflows/nooo-hourly.yml` "NOOO Hourly Refresh", `cron: '17 * * * *'` + `workflow_dispatch`, state **active**. Manual run #3 ✅; first scheduled run fired 07:24 UTC ✅ (GitHub took ~6 h to start firing a newly added schedule, which is normal). |
| Deployment | VERIFIED | Pages source is currently **Deploy from a branch** (`main` / root). The workflow requests a Pages build of the pushed commit via API and waits for `built`, then checks the live site. If the source is ever switched to **GitHub Actions**, the same workflow builds `_site/` and deploys with `actions/deploy-pages` instead. One of the two parallel "pages build and deployment" runs shows *cancelled* each hour — that is GitHub merging the push-triggered and the requested build; the other succeeds. |
| Tests | VERIFIED | `npm run check` → validator + 13 tests, all pass locally and in CI: spec encodings (NOOO binary/Morse), Arabic UTF-8; two consecutive runs differ; 500 simulated hours with no duplicate/near-duplicate; pool exhaustion fails without writing; tampered hash / duplicate / wrong encoding / insult / markup injection / missing field / changed CNAME all rejected; human push during a run → rebased and kept; conflicting human push → bot stops, remote untouched. |
| Free tier | VERIFIED | GitHub Actions (public repo) + GitHub Pages + Google Fonts. No paid API, no secrets, no tracking, no database. ~1 min of Actions time per hour. |
| Domain & email safety | VERIFIED | No DNS/NS/MX/DNSSEC changes. `CNAME` stays `nooo.si` and the validator fails the run if it ever changes. |
| Limitations | — | GitHub cron can be delayed or skipped; public-repo schedules are disabled after 60 days without repository activity (the hourly commits count as activity). Language list is limited to words found in the cited references (Gujarati, Kannada, Malayalam, Marathi, Sinhala and Telugu are not listed yet). |
| Next action | — | Open https://nooo.si in a normal browser to eyeball the launch. If it does not load on your network, check Settings → Pages that the custom domain is `nooo.si` and HTTPS is issued (see `DEPLOYMENT.md`). |

## Key files

```
.github/workflows/nooo-hourly.yml   hourly + manual run, CI on push/PR
scripts/hourly-content-generator.mjs, scripts/lib/{engine,store}.mjs
scripts/validate-content.mjs, scripts/safe-push.sh, scripts/build-site.mjs
content/banks/*.json                original comedy banks (AR/EN)
data/languages.json, data/galactic.json, data/art-of-no.json
data/feed/{latest,index,state}.json, data/feed/archive/YYYY-MM.json   (bot-owned)
index.html, assets/css/main.css, assets/js/**   (static site, SVG art, Web Audio)
tests/*.test.mjs
docs/NOOO_HOURLY_OPERATIONS.md      monitoring, recovery, adding content
AGENTS.md                           notes for ChatGPT / other assistants
```
