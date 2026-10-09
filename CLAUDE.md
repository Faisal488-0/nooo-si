# nooo.si — instructions for Claude

Read `AGENTS.md` first (bot-owned `data/feed/*`, `npm run check` before every push, keep `CNAME` = `nooo.si`).

## UI / UX work
For any design, layout, styling, color, typography, accessibility or UX review on this site,
use the installed skill **`.claude/skills/ui-ux-pro-max`** (UI UX Pro Max v2.13.0, MIT,
from github.com/Faisal488-0/ui-ux-pro-max-skill). Run it from the repo root:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "NOOO"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
```

Keep the site's existing identity (pop-art / neo-brutalist, AR + EN, RTL/LTR, no autoplay,
reduced-motion support). Use the skill's checklists to improve it, not to replace it wholesale.
