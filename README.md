# NOOO! — The Universal Language of No

**https://nooo.si** — an interactive comedy encyclopedia of every way to say no (Arabic + English), with a fresh original refusal card added automatically about once an hour.

- Giant NOOO! button with 24 reactions, synthesized sounds (no autoplay, mute + volume)
- NEW THIS HOUR feed + archive, deep links, share to WhatsApp / Telegram / X
- The Art of Saying No: 10 categories × 6 tones
- World encyclopedia of "no" (71 human languages, each with a cited source) + GALACTIC NOOO (clearly labelled fictional)
- Machines & Signals: live Binary / Hex / ASCII / Unicode / Base64 / Morse / Emoji / ASCII-art encoders
- Meme Museum + Meme Maker (original SVG art, PNG export on-device), Sound Lab, 4 mini games, Hall of NO

## Develop

```bash
npm ci            # no dependencies, just the lockfile
npm run check     # validate content + run tests
npm run serve     # http://localhost:8080
npm run generate -- --dry-run   # preview the next hourly card
```

Static site, no build step. GitHub Pages serves the repo root (`CNAME` = `nooo.si`).

Docs: [hourly operations](docs/NOOO_HOURLY_OPERATIONS.md) · [implementation report](docs/NOOO_IMPLEMENTATION_REPORT.md) · [DNS / Pages setup](DEPLOYMENT.md) · [notes for AI assistants](AGENTS.md)
