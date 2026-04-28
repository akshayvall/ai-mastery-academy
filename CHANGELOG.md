# Changelog — AI Mastery Academy

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).

## [Unreleased]
### Added
- Standard project scaffolding to match workspace convention: `README.md`, `CHANGELOG.md`, `SESSION_CONTEXT.md`, `init.ps1`, `docs/`.
- `docs/alignment-plan.md` — gap analysis vs `azure-networking-academy` and step-by-step roadmap.
- **`js/diagrams.js`** — new SVG diagram engine with 10 builders: `ai-stack`, `tokenisation`, `next-token`, `rag-pipeline`, `agent-loop`, `tool-calling`, `mcp-architecture`, `multi-agent`, `embedding-space`, `context-decay`. Supports Step / Play / Reset controls, step highlighting, animated flow lines, legends.
- **`js/modules-extras.js`** — 10 standalone "atomic" modules, one per diagram. Lets the sidebar surface each visualisation as its own clickable entry (matches the `azure-networking-academy` pattern).
- **Diagrams** added to all 13 phase modules so the new `📊 Diagrams` tab is populated for every phase.
- **Search palette** — `Ctrl+K` global module search with arrow-key navigation.
- **Mobile nav toggle** + slide-out sidebar for `<= 768px` viewports.
- **Time badges** in the sidebar (`⏱ 45m`, `⏱ 5m`, …) and the module header progress indicator.
- **Accessibility**: skip-link, ARIA labels on toolbar buttons, `role="status"` on toast, `role="dialog"` on search palette.
- **Security**: strict Content-Security-Policy + `referrer` meta in `index.html`.
- `.github/workflows/pages.yml` — auto-deploy to GitHub Pages on push to `main`.

### Changed
- `launch.bat` upgraded to detect Python / Python3 / Node and fall back to opening `index.html` directly (mirrors `azure-networking-academy/launch.bat`).
- `index.html` gained a `📊 Diagrams` tab between Learn and Interactive.
- `app.js` now merges `MODULES_EXTRAS` into the level groups, renders diagrams via `DiagramEngine`, surfaces `estimatedTime` in nav and module header, handles search palette + mobile nav, and exposes `escapeHtml` for the search results.
- `css/styles.css` extended with diagram engine styles, search-palette styles, mobile nav styles, sidebar time badges, skip-link, print rules. Total CSS is now ~30 KB (was ~24 KB).

## [0.1.0] - 2026-04-21
### Added
- Initial app: 33 modules across Phases 0–12 covering AI orientation through expert layer.
- Engines: `app.js`, `progress.js`, `quiz-engine.js`, `lab-engine.js` (v2 with structured steps), `interactive.js`.
- Per-module tabs: Learn / Interactive / Quiz / Lab.
- localStorage progress with export/import.
