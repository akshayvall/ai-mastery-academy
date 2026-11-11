# Changelog — AI Mastery Academy

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).

## [Unreleased]
### Publication authorization - November 11, 2026
- User explicitly authorized committing and pushing this release to `main` and deploying it to the existing GitHub Pages site. Release `2026-11-learning-2`; the Pages workflow remains the validation and publication gate.

### Full November learning rollout - local only
- Expanded the short-course experience to 62 core units across all 31 modules and eight optional specialties; original pilot content is preserved.
- Upgraded all 39 diagram instances with compact cause/consequence models, keyboard step controls, accessible text and optional full SVG detail. Generated-source discrepancies remain visibly flagged.
- Added integrated PM/Builder evidence dossiers, required assistance provenance, safe Markdown export and a dated editorial queue that cannot turn local review notes into verified facts.
- Added optional modern Responses, interoperability, Foundry and migration references; tightened transfer assessment to require every essential criterion >=3 while retaining old evidence.
- Integrated release `2026-11-learning-2` and full Edge validation. User approved broader rollout; Builder-source editing and archive packaging are still blocked by runtime enforcement. Not committed or published.

### November beginner pilot - local only
- Added six executable offline Node labs with fixtures, behavior tests, CLI examples and learner guide; linked from Lab. Archive creation is permission-blocked, so source-only setup is explicit and no ZIP download is advertised.
- Added twelve authored Learn/Try/Check units across six modules, a no-account start, Path/Lab/Progress navigation, compact trace visuals and changed-condition checks with saved self-review explanations.
- Added exact unit/stage resume, version-change rechecks, legacy-backup compatibility and recoverable unit drafts in existing progress storage; no new mastery credit from short-lesson checks.
- Corrected academy-owned prompting, grounding, temperature, evaluation, telemetry, orchestration and diagram claims; refreshed dated provider catalogue/lifecycle facts while separating source review from execution.
- Added Microsoft Edge pilot/recovery/route/offline gates and release `2026-11-pilot-1`. Generated Builder content remains unchanged because access to its separate source project was denied.
- Not published. Full-core migration, specialist expansion and real-learner outcomes remain behind the approved review gates.

### Documentation - November 2026
- Added an approval-stage education audit and modernization PRD, including current provider-source findings, all-module and diagram dispositions, learning requirements, metrics, and phased delivery gates. No application behavior or curriculum content changed.

### September learning release
- Added distinct learner destinations, selected-path/session recommendations, guided coaching for all 31 modules, local case analysis, predictions, evidence examples, and downloadable worksheets/reports.
- Fixed save/import failure reporting, corrupt-storage protection, draft recovery, quiz focus and answer-position cues, missing rubric validation, and failed/duplicate review handling. Evidence provenance is explicit.
- Updated sourced model/pricing facts and MCP setup instructions, removed unsafe workplace-input directions, and aligned mock API tests and plan limits.
- Added self-contained browser CI gates and release `2026-09-learning-1` with scoped, coherent offline caching. All 184 Node tests and 19 browser tests passed again on September 16; publication was approved that day. Provider/cloud labs remain unexecuted.

### Added
- Versioned mastery progress (`schemaVersion: 2`) with Learned, Practiced, Demonstrated, and Durable states; existing completion data migrates as legacy evidence pending revalidation.
- Ten-question diagnostic that recommends the earliest competency worth practicing.
- Observable outcomes, prerequisites, independent transfer challenges, and four-part rubrics for all 31 real modules in `js/mastery-content.js`.
- Local spaced-review scheduling at 1, 3, 7, 21, and 60 days, plus a dashboard review queue.
- Installable PWA assets (`manifest.webmanifest`, `sw.js`, same-origin icon) with offline navigation after the first successful load.
- Zero-dependency Node test suite and a GitHub Pages validation gate.
- Exhaustive diagram contracts and `docs/diagram-audit-2026-07.md`, covering all 39 diagram instances.
- Capstone architecture and phase-mapping diagrams, plus restored Claude Code and full-stack deployment visuals.
- Deterministic Today workspace, separate `ai-academy-ui-state:v1` navigation state, and exact-section resume.
- Accessible five-item mobile navigation with a focus-managed secondary drawer.
- Model Lab Notebook identity and a guided Memory and RAG vertical slice with compact evidence and an inline core visual.

### Changed
- Mastery progress now excludes the 10 diagram-only review activities from the 31-module denominator.
- Quiz passing now requires 80% and the critical concept question; due quiz retakes advance spaced review.
- Keyboard and screen-reader support improved across quizzes, flashcards, matching exercises, diagrams, labs, sidebar navigation, and mobile layouts.
- Current OpenAI, Anthropic, and Google catalogs, IDs, pricing notes, SDK patterns, and first-party source metadata were refreshed for July 26, 2026.
- Deployment, SaaS, MCP, expert-review, and PM modules now include stronger production, security, reliability, cost, and evaluation guidance.
- CSP now blocks inline scripts; runtime controls use delegated event handlers.
- Mobile diagrams preserve readable text in a keyboard-focusable local scroll region instead of shrinking the SVG to fit.
- Tokenization, embedding, context-window, and MCP transport language now favors durable, model-specific verification over fixed generalizations.
- Diagram and curriculum assets use one release token with a new offline cache generation.
- Dashboard delivery now prioritizes one next action, due work, and three path milestones instead of a marketing hero and empty summary cards.

### Fixed
- Removed diagram fallback placeholders, step mismatches, embedding-label collisions, and nondeterministic RAG decoration.
- Corrected the capstone phase mapping and aligned every declared visual step with a rendered state.
- Completed the July 2026 content audit: replaced retired model IDs, rewrote obsolete Claude prefill guidance around structured outputs, refreshed model/pricing/context claims, updated adaptive-thinking guidance, and corrected temperature determinism claims.
- Updated the Level 300 capstone from `gpt-4o-mini` to `gpt-5.4-mini` and regenerated the Builder Track after correcting the MCP date and Gemma 3 prerequisite in its source project.
- `js/modules-100.js` parse error (`Unexpected token ']'`) caused by a missing `const MODULES_100 = [` declaration and an orphaned top-level `subtitle` line after curriculum merge.
- Re-validated syntax with `node --check` for both `js/modules-100.js` and `js/modules-200.js`.
- Removed the fixed-offset mobile drawer overlap and restored focus after Escape or backdrop dismissal.
- Synchronized browser Back and Forward navigation with dashboard and module hash routes.
- Rebuilt the mobile curriculum drawer with readable 48px module rows, a visible close control, wider title space, hidden time clutter, and collapsed Visual review groups.

### Added (earlier work)
- `js/landscape.js` as the single source for volatile model names, prices, context limits, and the curriculum verification date.
- A centrally rendered `Last verified: YYYY-MM` stamp on every Learn view.
- `docs/curriculum-refresh-2026.md` - strategic curriculum brief to shift the academy from prompt-centric learning to AI systems architecture.
- **New Level 100 flagship module**: `2026 Landscape: AI Systems, Not Just Prompts` with release-driven guidance across OpenAI, Anthropic, and Google.
- **Zero to Claude companion module** in Level 100 — a curated 14-level syllabus map for `zero2claude.dev`, including lesson-count overview, phase mapping, quiz, flashcards, and a companion study-plan lab.
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
- Level 100 foundations card now reflects 6 modules (including 2026 landscape + Zero to Claude companion).
- Level 200 curriculum framing updated toward context engineering, schema-first tool use, managed-agent-aware operations, and multi-agent orchestration.
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
