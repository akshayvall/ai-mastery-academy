# 🧠 AI Mastery Academy

> An interactive, self-paced learning platform that takes you from **AI user** to **AI builder** — across ChatGPT, Claude, Gemini, agents, MCP, and full-stack AI deployment.

**Status:** 🟢 Active
**Owner:** Akshay
**Scope:** personal
**Created:** 2026-04-21
**Sibling project:** [`../azure-networking-academy`](../azure-networking-academy/) — same engine, different domain.
**Live site:** https://akshayvall.github.io/ai-mastery-academy/

---

## 📖 What is this?

A pure-HTML / CSS / JavaScript study site (no build step, no frameworks, no CDNs) that teaches modern AI tooling end-to-end. Every module combines a **Learn** lesson, **Interactive** drills (drag‑drop, flashcards), a **Quiz**, and a hands-on **Lab** with copy/paste-ready commands.

Progress is saved in your browser's `localStorage` and can be exported / imported as JSON.

## September learning release

Release `2026-09-learning-1` includes the changes below. GitHub Pages publishes `main` only after the Node and browser gates pass; see the [deployment runs](https://github.com/akshayvall/ai-mastery-academy/actions/workflows/pages.yml).

- Today, Learn, Practice, Build, and More have distinct task views. Learning path and 10/25/60-minute session choices guide recommendations without blocking reference access.
- All 31 real modules support guided/browse mode, worked cases, predictions, changed tasks, illustrative evidence, downloadable worksheets, and subscription-free case practice. The 10 visual-review activities remain separate.
- Quiz answer positions vary with stable identities and explicit critical-question policy. Failed due reviews are recorded. Evidence labels distinguish self-assessment and self-reported reviewer input from external verification.
- Progress backups identify their academy and format. Failed saves retain recoverable work; invalid imports and corrupt storage cannot silently replace existing progress. Drafts and lesson tab/section links survive navigation.
- Model facts are source-checked for September 14. Supported older lab models remain pinned; provider and cloud execution are not implied by source review.

The deployment gate runs locally with:

```powershell
node --test tests/*.test.js
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser_smoke.py
```

The browser runner starts and stops its own local server. It uses disposable browser storage and does not execute course lab commands. Manual screen-reader review, actual provider integration, and measured learning outcomes remain separate checks.

---

## 🗺️ Curriculum

13 phases across 3 levels + a cross-cutting **PM Playbook** (8 modules), a 2026 landscape flagship, a Zero to Claude companion module, and the 7-module Builder Track. The mastery system tracks **31 real modules**. Ten standalone diagram drills remain searchable review activities and no longer inflate mastery progress.

### ⬡ Level 100 — Foundations (Phases 0–3)
| # | Module | Covers |
|---|---|---|
| 1 | Phase 0 — AI Orientation | What LLMs really are, the AI stack, 2026 landscape, learning roadmap |
| 2 | Phase 1 — Prompt Engineering | RTCC framework, few-shot, chain-of-thought, XML, meta-prompting |
| 3 | Phase 2 — Platform Mastery | ChatGPT (GPTs/Canvas/Codex), Claude (Projects/Artifacts), Gemini (NotebookLM/AI Studio) |
| 4 | Phase 3 — Calling AI from Code | OpenAI / Anthropic / Gemini SDKs, building a CLI assistant |
| 5 | Flagship — 2026 AI Systems Landscape | Runtime architecture view: model routing, context engineering, managed agents, multimodal operations, and migration literacy |
| 6 | Companion Track — Zero to Claude Code | 14-level external syllabus for terminal, Git, APIs, Claude Code, MCP, context, and ship-ready developer habits |

### ⬡ Level 200 — Intermediate (Phases 4–8 + PM Playbook)
| # | Module | Covers |
|---|---|---|
| 1 | Phase 4 — Memory & RAG | Embeddings, vector DBs, retrieval pipelines |
| 2 | Phase 5 — Tool Use & Function Calling | Schemas, tool loops, JSON mode |
| 3 | Phase 6 — AI Agents | ReAct, planning, self-correction |
| 4 | Phase 7 — Claude Code & `.claude/` Mastery | Folder layout, hooks, skills, MCP, GitHub integration |
| 5 | Phase 8 — Multi-Agent Systems | Orchestrator/worker, debate, hand-off patterns |
| 🎯 | **PM Playbook (4 modules)** | Evaluations, Unit Economics, Build vs Buy vs Wait, Discovery → Ship, Communicating AI to Execs |

### ⬡ Level 300 — Advanced (Phases 9–12 + PM Playbook)
| # | Module | Covers |
|---|---|---|
| 1 | Phase 9 — MCP & Tool Ecosystems | Building MCP servers, tool composition |
| 2 | Phase 10 — Full-Stack AI + Deploy | Frontend + backend + LLM, deployment patterns |
| 3 | Phase 11 — AI SaaS Product | Productising: auth, billing, evals, observability |
| 4 | Phase 12 — Expert Layer | Scaling, security, cost optimisation |
| 🎯 | **PM Playbook (3 modules)** | Trust/Safety/Risk Register, AI Product Analytics, Roadmap Under Model Uncertainty |

> Full module list: [js/modules-100.js](js/modules-100.js), [js/modules-200.js](js/modules-200.js), [js/modules-300.js](js/modules-300.js), [js/modules-extras.js](js/modules-extras.js), [js/modules-pm.js](js/modules-pm.js).

---

## 🎯 For PMs — the dedicated Playbook track

The engineering Phases (0–12) teach you how AI features are built. The **PM Playbook** teaches the cross-cutting competencies that decide whether they ship and survive. The 8 modules cover the gaps that engineering content alone cannot fill:

| # | Module | Why it matters in 2026 |
|---|---|---|
| A | **AI Evaluations** | The new "QA for LLMs". The single most important AI PM skill. Without evals you cannot answer "is it good enough to ship?" |
| B | **AI Unit Economics** | Token math, model selection, gross margin per plan. Owe this to your CFO before launch. |
| C | **Build vs Buy vs Wait** | What to build, what to wrap, what the platform will ship for free next quarter. |
| D | **Discovery → Ship** | Find JTBD → 30-min prototype → Wizard-of-Oz → evals → shadow mode → soft launch. |
| E | **Trust, Safety & Risk Register** | Hallucinations, prompt injection, PII, fallbacks, governance — with the artefact (the register) you can defend in audit. |
| F | **AI Product Analytics** | What to log, drift detection, the 5-chart standard PM dashboard. |
| G | **Roadmap Under Model Uncertainty** | Capability cliffs, model-agnostic architecture, the quarterly AI review. |
| H | **Communicating AI to Execs** | Vocabulary, mental models, demo etiquette, saying no gracefully. |

Each module: rich Learn HTML (3–5 KB), 6–8 quiz questions with explanations, drag-drop or flashcards, and (for Evals & Unit Economics) a full 4-step lab.

---

## 🚀 Running locally

No build step. Serve the folder over HTTP (browsers restrict some features on `file://`).

### Windows — one click
```cmd
launch.bat
```
Auto-detects Python or Node, serves on http://localhost:8080.

### Manual
```bash
python -m http.server 8080
# or
npx http-server -p 8080 -c-1
```

Then open http://localhost:8080.

---

## ✨ Features

- **Learn / Interactive / Quiz / Lab tabs** per module
- **Drag-drop matching** and **flashcards** for retention
- **Multi-step labs** with copy-ready commands and verification checkpoints
- **Progress tracking** — per module, per level, overall %, day streak
- **Export / Import** progress as JSON
- **Installable and offline after first load** — service-worker-cached app shell, no external CDNs, no trackers
- **Honest mastery states** — Learned → Practiced → Demonstrated → Durable, with 80% retrieval checks, lab evidence, transfer rubrics, and spaced review
- **Diagnostic learning route** — ten questions recommend the earliest competency worth practicing
- **Today workspace** — one deterministic next action, due evidence, and the next three milestones
- **Mobile study shell** — five-item bottom navigation plus an accessible, focus-managed module drawer
- **Guided Memory & RAG prototype** — guided/browse modes, exact-section resume, compact evidence, and an inline core visual

---

## 📁 Project structure

```
index.html              # Single-page app shell
launch.bat              # Local-server launcher (python/node fallback)
init.ps1                # Project bootstrap (idempotent)
css/
  styles.css            # All styling, level-coloured tokens
js/
  app.js                # Router, view management, progress wiring
  progress.js           # localStorage-backed progress
  ui-state.js           # separate versioned navigation and resume state
  today-engine.js       # deterministic daily action selection
  mastery-content.js    # Outcomes, diagnostics, transfer challenges, rubrics
  mastery-engine.js     # Mastery dashboard, evidence flow, review queue
  quiz-engine.js        # Quiz rendering & scoring
  lab-engine.js         # Step-by-step lab runner (v2)
  interactive.js        # Drag-drop, flashcards
  diagrams.js           # SVG diagram engine (10 builders)
  modules-100.js        # L100 content (Phases 0–3)
  modules-200.js        # L200 content (Phases 4–8)
  modules-300.js        # L300 content (Phases 9–12)
  modules-extras.js     # 10 standalone diagram modules
  modules-pm.js         # 8 PM Playbook modules (cross-cutting)
manifest.webmanifest    # Install metadata
sw.js                   # Offline app-shell cache
tests/                  # Node test contracts for curriculum, mastery, platform
docs/
  alignment-plan.md     # Roadmap to mirror azure-networking-academy structure
```

---

## ✅ Validation

```bash
node --test tests/*.test.js
for file in js/*.js sw.js; do node --check "$file"; done
```

The diagram contract also verifies builder coverage, unique IDs, step parity, deterministic SVG output, geometry regressions, keyboard access, mobile readability, current MCP transports, and release-cache coherence. See [docs/diagram-audit-2026-07.md](docs/diagram-audit-2026-07.md).

GitHub Pages runs the same Node validation before deployment. The July 2026 browser matrix additionally rendered all 39 diagrams at desktop, tablet, and mobile widths. The next product milestone is external review of capstone artifacts and calibration of the self-assessment rubric, not another module-count expansion.

---

## 🔗 Related

- Sibling: [`../azure-networking-academy`](../azure-networking-academy/) — same engine pattern, real-world Azure networking focus.
- Parent project: [`../`](../README.md) (`Idea_Gen`).
- Workspace conventions: [`../../../.ai/instructions.md`](../../../.ai/instructions.md).
