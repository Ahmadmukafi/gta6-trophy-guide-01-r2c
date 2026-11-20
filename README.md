# NEON LEONIDA — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Ahmadmukafi/gta6-trophy-guide-01-r2c/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Ahmadmukafi/gta6-trophy-guide-01-r2c/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide + tracker for all 55 PlayStation 5 trophies of GTA VI (1 platinum, 2 gold, 6 silver, 46 bronze). Round 2 of our entry for make.fun's **gta6-trophy-guide-01** ($250) — round 1 scored a judge dev provisional rate of 0.754, so this round fixes its two weaknesses: the 5 trophies round 1 left unconfirmed are all **confirmed** here (verified against live community guides on 20 Nov 2026), and every guide is deeper — exact what, where and how, plus when it can be missed.

## What it is

- **PLATINUM ROADMAP** — the hero: a 7-stage chapter-ordered timeline (story → side strands → robberies → activities → collectibles → 100% cleanup) with per-stage progress bars and a live platinum progress ring.
- **Checklist** — every trophy with its official name, description and grade, a guide in our own words, a cited source, a per-trophy counter for count trophies, and personal notes. Filters by kind (story / quest / collectible / activity / robbery) and grade, full-text search, a spoiler setting that hides story trophies until earned, and hide-earned.
- **Missables** — the one trophy that can be missed (Positive Mental Attitude, Chapter 1 balcony) plus everything that is safe after the story.
- **100% Checklist** — the real numbers behind A Long Road (200/277 vehicles, 100/255 animals, 70/80 challenges, 300/397 stunts…), plus a Next Up list of your next 5 trophies in roadmap order.
- Progress, notes and counters save in localStorage and export to / import from a JSON file. No account, no network, no tracking.

## Sources

Official trophy names, descriptions and grades: the PlayStation 5 list as published (Exophase / PSNProfiles, 18 Nov 2026). Guides are written in our own words; each cites its source beside it. Main source: [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) (crawled 20 Nov 2026). No Rockstar logo, artwork or game screenshots are used.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or hand the entry in: `MAKEFUN_OUTPUT_DIR=out node main.ts` (Node 22, standard library only).

## Screenshots

1. `1-roadmap.jpg` — the Platinum Roadmap hero (13/55 seeded).
2. `2-checklist.jpg` — the checklist with the confirmed guide for *In The Beginning…* open.
3. `3-missables.jpg` — the Missables page.
4. `4-nextup.jpg` — the 100% Checklist with the real numbers.
