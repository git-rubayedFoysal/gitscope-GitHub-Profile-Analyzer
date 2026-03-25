# gitscope — GitHub Profile Analyzer

> Analyze any GitHub profile and its repositories in seconds.

**Live Demo → [gitscope-analyzer.vercel.app](https://gitscope-analyzer.vercel.app/)**

---

## Features

- 🔍 **Profile Overview** — avatar, bio, location, followers, following, repo count, and join year
- ⭐ **Repository Stats** — total stars, total forks, and top repo at a glance
- 🌐 **Language Breakdown** — top 5 languages across all repos displayed as animated progress bars, with dynamic color-coded dots per language
- 📋 **Repository List** — all public repos sorted by stars with descriptions and metadata
- 📊 **Contribution Graph** — activity chart powered by [github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph), themed to match dark/light mode
- 🧠 **Developer Insights** — auto-generated tags based on real data: language focus, activity level, portfolio size, community presence, open-source contribution, and language diversity
- 🏆 **Profile Score** — animated circular progress score (0–100) calculated from bio, avatar, repos, stars, activity, location, and blog — rated Excellent / Good / Average / Needs Improvement
- ⏳ **Skeleton Loader** — shimmer placeholder animation shown during API fetch for a polished loading experience
- 🌙 **Dark / Light Theme** — toggle with persistence via `localStorage`
- 📱 **Fully Responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 semantic elements + `<template>` |
| Styling | Vanilla CSS — custom properties, CSS Grid, Flexbox, `clamp()` |
| Logic | Vanilla JavaScript (ES2022) — async/await, Fetch API, `DocumentFragment` |
| Icons | Font Awesome 6 |
| Fonts | Space Grotesk + Space Mono (Google Fonts) |
| APIs | GitHub REST API v3 (unauthenticated) |
| Analytics | Vercel Web Analytics |
| Hosting | Vercel |

---

## Getting Started

No build tools or dependencies required — plain HTML/CSS/JS.

```bash
# Clone the repository
git clone https://github.com/git-rubayedFoysal/gitscope-GitHub-Profile-Analyzer.git

# Open in browser
cd gitscope-GitHub-Profile-Analyzer
open index.html
```

Or visit the **[live demo](https://gitscope-analyzer.vercel.app/)** directly.

---

## How It Works

1. Enter any GitHub username in the search bar
2. A skeleton loader appears immediately while data is being fetched
3. The app calls two GitHub API endpoints in parallel:
   - `GET /users/{username}` — profile data
   - `GET /users/{username}/repos?sort=pushed&per_page=100` — repository data
4. Results are rendered into the DOM using `<template>` elements and `DocumentFragment` for performance
5. Developer insights and a profile score are calculated from the fetched data
6. The contribution graph is fetched from an external service and themed to match the active color scheme

---

## Profile Score Breakdown

The score (0–100) is calculated from the following criteria:

| Criteria | Max Points |
|---|---|
| Has a bio | 10 |
| Has an avatar | 10 |
| Has a display name | 5 |
| Repo count (5 → 50+) | 5–20 |
| Total stars (10 → 1000+) | 5–20 |
| Recent activity (last 7 → 30 days) | 5–20 |
| Has a location | 5 |
| Has a blog / website | 5 |

**Score ratings:** `≥ 80` Excellent · `≥ 60` Good · `≥ 40` Average · `< 40` Needs Improvement

---

## Developer Insights

Insights are generated dynamically — not hardcoded. Each one is based on actual API data:

| Insight | Condition |
|---|---|
| 💻 Language-focused developer | Top language by repo count |
| ⭐ Highly popular repositories | 100+ total stars or 5+ avg per repo |
| 🔥 Very active contributor | 5+ repos pushed in last 90 days |
| 📁 Extensive project portfolio | 30+ public repos |
| 👥 Well-known in the community | 100+ followers |
| 🔀 Active open-source contributor | 5+ forked repos |
| 🌐 Polyglot developer | 5+ languages used across repos |

---

## Project Structure

```
gitscope/
├── index.html        # Markup and template elements
├── style.css         # All styles — tokens, layout, responsive breakpoints, animations
├── script.js         # API calls, DOM rendering, insights, score, theme logic
└── icon/             # SVG icons — favicon, brand logo, theme toggle icons
```

---

## API Usage

This app uses the **GitHub REST API without authentication**. The unauthenticated rate limit is **60 requests per hour per IP**.

No API key required. No server-side code. No environment variables.

Error handling covers:
- `404` — user not found, with a clear message
- `403` — rate limit reached, with a wait-time hint
- Other errors — generic fallback message

---

## What I Learned

- Parallel async API calls with `Promise.all()` for faster data fetching
- HTML `<template>` elements with `cloneNode` and `DocumentFragment` for efficient DOM rendering
- CSS custom properties for seamless dark/light theming across the entire UI
- `localStorage` for theme persistence across sessions
- Skeleton loader pattern using CSS `@keyframes` shimmer animation
- Dynamic score calculation and animated circular progress with `conic-gradient`
- Responsive layout techniques: CSS Grid, `clamp()`, `flex-wrap`, and mobile-first breakpoints
- Accurate "last active" date using `pushed_at` on repos instead of `updated_at` on the user object
- Git history rewriting and GitHub push protection for exposed secrets

---

## Author

[![GitHub](https://img.shields.io/badge/GitHub-git--rubayedFoysal-181717?logo=github)](https://github.com/git-rubayedFoysal)

---

## License

This project is open source and available under the [MIT License](LICENSE).