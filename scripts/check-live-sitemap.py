#!/usr/bin/env python3
"""Read-only production sitemap/robots checks for NOOO's GitHub Actions runner."""
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from xml.etree import ElementTree as ET
import sys
import time

BASE = "https://nooo.si"
USER_AGENTS = {
    "standard": "NOOO-Sitemap-Health/1.0",
    "crawler-like": "Googlebot/2.1 (+http://www.google.com/bot.html)",
}

def fetch(path, agent):
    url = BASE + path
    last = None
    for attempt in range(4):
        try:
            req = Request(url, headers={"User-Agent": agent, "Accept": "*/*"})
            with urlopen(req, timeout=25) as resp:
                code = resp.status
                final = resp.url
                kind = resp.headers.get("Content-Type", "")
                data = resp.read(2_000_000)
            if code != 200 or final != url:
                raise ValueError(f"Unexpected status/redirect: {code} {final}")
            if len(data) == 0:
                raise ValueError("Empty response")
            if path.endswith(".xml") and "html" in kind.lower():
                raise ValueError(f"XML served as HTML: {kind}")
            return data
        except (OSError, ValueError, URLError, HTTPError) as exc:
            last = exc
            if attempt < 3:
                time.sleep(12)
    raise RuntimeError(f"Cannot load {url}: {last}")

def validate():
    for label, agent in USER_AGENTS.items():
        print(f"Checking URLs with {label} user-agent.", flush=True)
        home = fetch("/", agent).decode("utf-8", errors="replace")
        robots = fetch("/robots.txt", agent).decode("utf-8")
        xml = fetch("/sitemap.xml", agent)
        plain = fetch("/sitemap.txt", agent).decode("utf-8")
        if "https://nooo.si/sitemap.xml" not in robots or "https://nooo.si/sitemap.txt" not in robots:
            raise ValueError("robots.txt has missing sitemap references")
        if '<link rel="canonical" href="https://nooo.si/">' not in home:
            raise ValueError("Homepage has no expected canonical link")
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        root = ET.fromstring(xml)
        urls = [node.text for node in root.findall("s:url/s:loc", ns)]
        if urls != ["https://nooo.si/"]:
            raise ValueError(f"XML sitemap has unexpected URLs: {urls}")
        if plain.strip() != "https://nooo.si/":
            raise ValueError("Text sitemap differs from XML canonical URL")
        print(f"OK ({label}): homepage, robots, XML, TXT. Googlebot access itself is not verified.", flush=True)

if __name__ == "__main__":
    try:
        validate()
    except Exception as err:
        print(f"ERROR: {err}", file=sys.stderr)
        sys.exit(1)
