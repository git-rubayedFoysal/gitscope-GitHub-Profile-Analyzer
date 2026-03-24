# gitscope — GitHub Profile Analyzer

> Analyze any GitHub profile and its repositories in seconds.

**Live Demo → [gitscope-analyzer.vercel.app](https://gitscope-analyzer.vercel.app/)**


---

## Features

- 🔍 **Profile Overview** — avatar, bio, location, followers, following, repo count, and join year
- ⭐ **Repository Stats** — total stars, total forks, and top-starred repo at a glance
- 🌐 **Language Breakdown** — top 5 languages used across all repos, displayed as progress bars
- 📋 **Repository List** — all public repos sorted by stars with descriptions and metadata
- 📊 **Contribution Graph** — activity chart powered by [github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)
- 🌙 **Dark / Light Theme** — toggle with persistence via `localStorage`
- 📱 **Fully Responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 semantic elements |
| Styling | Vanilla CSS — custom properties, CSS Grid, Flexbox |
| Logic | Vanilla JavaScript (ES2022) — async/await, Fetch API, `<template>` elements |
| Icons | Font Awesome 6 |
| Fonts | Space Grotesk + Space Mono (Google Fonts) |
| APIs | GitHub REST API v3 (unauthenticated) |
| Hosting | Vercel |

---

## Getting Started

No build tools or dependencies required — this is plain HTML/CSS/JS.

```bash
# Clone the repository
git clone https://github.com/git-rubayedFoysal/gitscope-GitHub-Profile-Analyzer.git

# Open in browser
cd gitscope-GitHub-Profile-Analyzer
open index.html
```

Or just visit the **[live demo](https://gitscope-analyzer.vercel.app/)** directly.

---

## How It Works

1. Enter any GitHub username in the search bar
2. The app calls two GitHub API endpoints in parallel:
   - `GET /users/{username}` — profile data
   - `GET /users/{username}/repos?sort=stars&per_page=100` — repository data
3. Results are rendered into the DOM using `<template>` elements and `DocumentFragment` for performance
4. The contribution graph is fetched from an external graph service and themed to match the active color scheme

---

## Project Structure

```
gitscope/
├── index.html        # Markup and template elements
├── style.css         # All styles — tokens, layout, responsive breakpoints
├── script.js         # API calls, DOM rendering, theme logic
└── icon/             # SVG icons — favicon, brand logo, theme toggle icons
```

---

## API Usage

This app uses the **GitHub REST API without authentication**. The unauthenticated rate limit is **60 requests per hour per IP**, which is sufficient for normal use.

No API key is required. No server-side code. No environment variables.

---

## What I Learned

- Handling multiple async API calls in parallel with `Promise.all()`
- Using HTML `<template>` elements with `cloneNode` for efficient DOM rendering
- CSS custom properties for seamless dark/light theming
- Managing `localStorage` for theme persistence across sessions
- Responsive layout techniques: CSS Grid, `clamp()`, `flex-wrap`, and mobile-first breakpoints
- Git history rewriting and GitHub push protection for exposed secrets

---

## Author

[![GitHub](https://img.shields.io/badge/GitHub-git--rubayedFoysal-181717?logo=github)](https://github.com/git-rubayedFoysal)

---

## License

This project is open source and available under the [MIT License](LICENSE).