# nooo.si — GitHub Pages + OVHcloud (Free Tier)

## Repository

- Repo: https://github.com/Faisal488-0/nooo-si
- Branch: `main`
- Hosting: GitHub Pages, for static files
- Custom domain: `nooo.si`
- File `CNAME`: exactly `nooo.si`

This repository now contains the full NOOO! site (launched 2026-10-09; `noindex` removed). The hourly content workflow is documented in `docs/NOOO_HOURLY_OPERATIONS.md`.

## 1. Enable GitHub Pages BEFORE switching DNS

Open: https://github.com/Faisal488-0/nooo-si/settings/pages

1. Under **Build and deployment** set Source = **Deploy from a branch**.
2. Select `main` and `/(root)`, then **Save**.
3. Under **Custom domain** enter `nooo.si`, then **Save**. If the value is already set, do not change it.
4. If available, verify domain ownership using **GitHub personal account → Settings → Pages → Verify domain**. Copy the verification TXT value to OVHcloud. Use the exact verification record GitHub provides.
5. Wait for GitHub Pages to build; check the Pages deployment and DNS before enabling **Enforce HTTPS**. Certificate provisioning can take time.

**Do not repoint the DNS until the custom domain is configured on GitHub.**

## 2. OVHcloud DNS records

In OVHcloud > Domain names > nooo.si > DNS zone:

- Remove old **A** record `nooo.si` → `213.186.33.5` (the old OVH holding-page target).
- Remove old **A** record `www.nooo.si` → `213.186.33.5`.
- Add **four A** records for the apex `@` / `nooo.si`:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- Add **CNAME** for `www` / `www.nooo.si` → `Faisal488-0.github.io.` (GitHub Pages user domain, not repository path).
- Remove any **www** TXT or A record that conflicts with CNAME. The earlier screenshot showed OVH placeholder TXT `www.nooo.si` → `"3|welcome"`; this conflicts with CNAME, so remove it if present.
- The earlier screenshot also showed apex TXT `"1|www.nooo.si"`, apparently an OVH redirect placeholder. Verify its use in the OVH **Redirection** tab and remove OVH forwarding entries that would override the new GitHub Pages destination.
- Preserve the domain **NS** records and all unrelated email verification, MX, SPF, DKIM and DMARC records. If using active email/FTP, assess effects before changing related records. The earlier `ftp.nooo.si` CNAME pointed to `nooo.si`; once the apex points to GitHub Pages, this FTP name would no longer reach your old FTP server: update the FTP entry only if you actively use FTP.
- Do NOT replace nameservers or reset the whole zone.

Note: OVH UI may require using a blank subdomain field for the zone apex, rather than `@`.

## 3. Verify

Use Windows PowerShell:

```powershell
Resolve-DnsName nooo.si -Type A
Resolve-DnsName www.nooo.si -Type CNAME
```

Then test:
- https://Faisal488-0.github.io/nooo-si/
- https://nooo.si/
- https://www.nooo.si/ (should redirect to your configured canonical custom domain)

DNS changes can take up to ~24h. HTTPS may take longer to provision.
Avoid changing DNS repeatedly while waiting.

## Limits

GitHub Pages serves static HTML/CSS/JS. A dynamic backend, private database or server API requires a separate backend platform. Do not put secrets or API keys in this public repository.

References:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
