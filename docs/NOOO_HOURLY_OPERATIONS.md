# NOOO Hourly Creative Engine — Operations

## What runs, and when

| Item | Value |
|---|---|
| Workflow | `.github/workflows/nooo-hourly.yml` ("NOOO Hourly Refresh") |
| Schedule | `17 * * * *` — minute 17 of every hour, **UTC** (Kuwait: hh:17, UTC+3) |
| Manual run | Actions → NOOO Hourly Refresh → **Run workflow** (option: *skip_generation* = redeploy only) |
| Cost | GitHub Actions minutes on a public repo + GitHub Pages: free. No APIs, no secrets. |
| Claude needed? | **No.** The engine is plain Node.js with zero dependencies. |

### One hourly run, step by step

1. `npm ci` (lockfile, zero dependencies) → `npm run check` on the existing content. If the repo is already broken, nothing new is added.
2. `scripts/hourly-content-generator.mjs` composes **one** new card from `content/banks/*.json`.
3. `npm run check` again: content validator + 13 tests. Any failure → stop, nothing published.
4. Commit only `data/feed/*` (any other changed file aborts the run; empty commits are refused).
5. `scripts/safe-push.sh`: plain `git push`; if someone pushed meanwhile → fetch + rebase + re-validate + retry (3×). A rebase **conflict stops the run safely** (exit 2). Never force-pushes.
6. Publish in the **same run**:
   - Pages source **"Deploy from a branch"** (current setting): the workflow calls the Pages API to request a build of the pushed commit and waits until it is `built`.
   - Pages source **"GitHub Actions"**: it builds `_site/` and deploys with `actions/deploy-pages`.
7. Fetches `https://nooo.si/data/feed/latest.json` (cache-busted) until the new card id appears (≤ 15 min). Only then the run is green and the summary says **✅ live**.

## How content stays new (no paid AI)

- Each card = one *ask* + one *reply* (or phrase/encoding, or verified language) from the banks, plus an original SVG scene descriptor (`visualPreset`), a kicker and an effect.
- **SHA-256** of `category|locale|headline|body|code` must never repeat (checked against the whole archive).
- **Similarity guard**: Jaccard similarity ≥ 0.8 against the last 400 cards → rejected.
- Diversity: lines used least, and not in the last 6 cards of the same stream, are preferred.
- Rotation: boss → friends → relationship → cat → scifi → binary → morse → office → monday → global, alternating Arabic / English per category.
- Global NO cards only use `data/languages.json` (each entry cites a published reference); the validator re-checks the word.
- Binary / Morse outputs are recomputed by the validator.
- Capacity today: **9,480** distinct combinations (`npm run generate -- --capacity`). Text streams are used once per 20 h, so the first stream runs dry after roughly 5 months; the run then falls back to other streams automatically.
- When **no** acceptable combination remains, the generator exits `3` with `CONTENT_POOL_EXHAUSTED` and nothing is published — old cards are never recycled.

### Adding more content (by hand, or a pack written with Claude/ChatGPT)

1. Add new lines to `content/banks/<category>.json` (`asks` / `replies`, both `ar` and `en`). Replies must make sense after **any** ask in that file.
2. Keep lines short, kind, original. No insults, no `<` `>`, no movie quotes or celebrity material.
3. Run `npm run check` locally, open a PR, merge. The next hourly run uses the new lines.
4. Never hand-edit `data/feed/*` — it is bot-owned and hash-checked.

## Monitoring

- **Actions tab** → *NOOO Hourly Refresh*: green = card generated **and** confirmed live. Each run's summary shows the card id, commit and verification time.
- `https://nooo.si/data/feed/state.json` → `lastRunAt`, `lastItemId`, `totalItems`.
- The site's "NEW THIS HOUR" header shows when the newest card was added (in the visitor's local time).
- GitHub e-mails the workflow owner when a scheduled run fails.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| No runs for a while | GitHub delays/skips cron runs under load | Wait, or *Run workflow* manually. Expect some drift, not second-level precision. |
| Schedule shows "disabled" | Public repos: schedules can be disabled after 60 days without repository activity | Actions → NOOO Hourly Refresh → **Enable workflow**, then *Run workflow* once. |
| `CONTENT_POOL_EXHAUSTED` | All combinations used | Add lines to `content/banks/*.json` (see above). |
| Exit 2 at "Push safely" | A human commit conflicts with `data/feed/*` | Pull, resolve `data/feed` by keeping the archive files consistent, run `npm run check`, push. Next run continues. |
| "NOT confirmed live" | DNS/HTTPS/Pages pending or Pages disabled | Settings → Pages: source must be `main` / root (or GitHub Actions), custom domain `nooo.si`. The card is committed; the next build will publish it. |
| Validation errors | Banks/feeds edited by hand | Read the `::error::` lines in the log; fix the file named there. |

## Things this workflow will never do

Change DNS / NS / MX / DNSSEC or e-mail records, change `CNAME` (the validator enforces `nooo.si`), force-push, call a paid API, or store secrets.

## Museum photo cards (every 6th card)

- **What:** a CC0 / Public-Domain-Mark museum image (cats, dogs, owls, horses, donkeys…) with a NOOO caption. Found via the free Openverse API (no key), allow-listed sources only: `met`, `rijksmuseum`, `brooklynmuseum`, `clevelandmuseum`, `smk`, `bio_diversity` (settings: `content/banks/photo.json`).
- **Stored locally:** the thumbnail (≤ 200 KB) is saved in `data/feed/img/` and credited on the card, so visitors' browsers never contact a third party.
- **Safety:** CC0/PDM only; an on-theme check (the animal must be in the title/tags); a blocklist for religious, nudity, violence, slavery and similar words (`blockedPattern`); the validator re-checks every stored photo (license, https credit links, real JPEG/PNG, size).
- **Never breaks the hour:** if Openverse is down, the image is rejected, or nothing acceptable is found, that hour simply makes a normal text card.
- **Kill switch:** set `"enabled": false` in `content/banks/photo.json`. To remove one image, delete its card from `data/feed/archive/*.json` and its file in `data/feed/img/`, then run `npm run check`.
- **Honest limit:** automatic picking cannot be perfect. Tell us on GitHub about any image that should go.
- Memes: real "meme templates" are almost always copyrighted, so they are NOT pulled automatically. Museum art + a caption is the legal, free version of the same genre.
