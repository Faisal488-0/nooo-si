# NOOO — UI/UX audit (2026-10-09)

Tool: `.claude/skills/ui-ux-pro-max` (design-system + `--domain ux` queries). Scope: `assets/css/main.css` only.
Identity kept: pop-art / neo-brutalist, AR + EN, RTL/LTR, no autoplay.

## Already fine
- `prefers-reduced-motion` handled (CSS + `.fx-layer` hidden).
- Visible focus ring (`:focus-visible`, 4px cyan).
- Skip link, viewport meta, mobile-first layout, SVG art (no emoji icons).

## Fixed
| Issue | Before | After |
|---|---|---|
| Tap targets (`.btn-sm`, `.tab`, `.tone`, `.chip-btn`, `.g2-tile`) | 34–42px | 44px min |
| White text on red (`.btn-pop`, `.tone.active`, `.badge`, `.live`) | ~3.5:1 | `--red-text` #D6291F, ~4.9:1 |
| Muted small text (`.card-time`, `.kicker`, `.eyebrow`) | 12px / opacity .65–.75 | 13px / opacity .8–.85 |

## Not verified
- No browser screenshots after the change. Check narrow phones (≤360px): taller chips/tabs may wrap.
- Contrast ratios computed by hand, not with a tool.

## Next candidates
- Test 375 / 768 / 1024 / 1440 widths in AR and EN.
- Check contrast of text on the space/violet dotted bands.
