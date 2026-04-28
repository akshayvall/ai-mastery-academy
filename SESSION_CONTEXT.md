# Session Context — AI Mastery Academy

Running log of AI-assisted work on this sub-project. Append newest entries at the top.
Use this to give future chats fast context without re-explaining.

Parent project context: [`../SESSION_CONTEXT.md`](../SESSION_CONTEXT.md).

---

## Entry template

```
## YYYY-MM-DD — <short title>
**Goal:**
**Outcome:**
**Decisions:**
  - <decision> — <why>
**Open threads:**
  - [ ] <follow-up>
**Files touched:** path/one, path/two
```

---

## Log

## 2026-04-28 — PM Playbook (8 modules) added
**Goal:** Address the gap that the engineering Phases 0–12 leave for PMs working on AI products in 2026 — evals, unit economics, build/buy/wait, discovery, trust & safety, analytics, roadmap, exec comms.
**Outcome:**
- New `js/modules-pm.js` (~50 KB) with 8 cross-cutting PM modules sized 15–25 minutes each (~160 minutes total of PM-specific learning).
  - A: AI Evaluations (full lab)
  - B: AI Unit Economics (full lab)
  - C: Build vs Buy vs Wait
  - D: Discovery → Ship
  - E: Trust, Safety & Risk Register
  - F: AI Product Analytics & Observability
  - G: Roadmap Under Model Uncertainty
  - H: Communicating AI to Execs
- 5 surgical "For PMs" callouts injected into existing phase modules (Phase 0 orientation, Phase 4 RAG, Phase 5 tool use, Phase 6 agents, Phase 10 deploy, Phase 11 SaaS) cross-linking to the matching PM Playbook module.
- Sidebar density: 23 → **31 modules**.
- All JS passes `node --check`.
**Decisions:**
  - PM modules placed at L200/L300 (4 + 3 + 1) so they sit next to the engineering modules they augment, not in a separate "PM" tier. This forces the cross-pollination.
  - Two PM modules ship with full 4-step labs (Evals, Unit Economics) because they produce real artefacts (eval suite + unit-economics worksheet) you would actually use at work. The other six are concept-heavy with quizzes + flashcards.
  - Did NOT touch the engineering Learn HTML beyond the 5 callouts — those modules are deep enough; the real gap was PM craft, not engineering depth.
**Open threads:**
  - [ ] Optional: build a "PM Playbook capstone" lab where you take ONE feature through all 8 modules end-to-end (eval suite + unit econ + risk register + dashboard + roadmap brief + exec deck).
  - [ ] Optional: add MODULES_PM-style references blocks linking out to Hamel Husain, Eugene Yan, Latent Space, Anthropic/OpenAI changelogs.
**Files touched:** js/modules-pm.js (new), js/app.js, index.html, js/modules-100.js, js/modules-200.js, js/modules-300.js, README.md, CHANGELOG.md

## 2026-04-28 — Diagrams engine + alignment phase 2/3/4 shipped
**Goal:** Execute the full alignment plan: SVG diagrams, granular sidebar entries, search palette, mobile nav, CSP, GitHub Pages workflow.
**Outcome:**
- New `js/diagrams.js` (33 KB) with 10 SVG diagram builders covering the core AI concepts: AI stack, tokenisation, next-token sampling, RAG pipeline, ReAct agent loop, function calling sequence, MCP architecture, multi-agent orchestrator, embedding space, lost-in-the-middle.
- New `js/modules-extras.js` (10 standalone diagram modules) — sidebar density jumps from 13 phase rows to **23 rows** (matches the `azure-networking-academy` pattern of one-topic-per-sidebar-entry).
- All 13 phase modules now ship a `📊 Diagrams` tab + `estimatedTime` badge.
- Added Ctrl+K search palette, mobile nav toggle, skip-link, ARIA, strict CSP, `.github/workflows/pages.yml`.
- All JS files pass `node --check`; HTTP server smoke-test confirmed every asset returns 200.
**Decisions:**
  - Kept original 13 phase IDs unchanged so existing localStorage progress is preserved. New extras get fresh IDs.
  - Diagrams are co-located on the phase module AND surfaced as standalone modules — same content reachable two ways without duplication of underlying SVG (the builder runs against either container).
  - Did not attempt a full content depth pass (Phase 5 of alignment plan). The phase modules' Learn tabs are still ~155 KB, vs the networking academy's ~510 KB. That's a content-writing pass, not an engineering one.
**Open threads:**
  - [ ] Optional: write deeper Learn HTML for phases 4–8 (RAG, tool use, agents, Claude Code, multi-agent) which are noticeably lighter than phases 0–3.
  - [ ] Optional: add a `📚 References` block to each module (the networking academy uses `mod.references` — engine-side already supports the convention; just needs data).
  - [ ] Decide whether to publish to a public GitHub repo so `pages.yml` can actually deploy.
**Files touched:** index.html, css/styles.css, js/app.js, js/diagrams.js (new), js/modules-extras.js (new), js/modules-100.js, js/modules-200.js, js/modules-300.js, .github/workflows/pages.yml (new), CHANGELOG.md

## 2026-04-28 — Adopted workspace convention + drafted alignment plan
**Goal:** Bring `ai-academy/` under the standard `_template/` layout and articulate how to mirror `azure-networking-academy/`'s learning structure.
**Outcome:**
- Added `README.md`, `CHANGELOG.md`, this file, `init.ps1`, and `docs/alignment-plan.md`.
- Upgraded `launch.bat` to mirror the networking academy's python/python3/node fallback launcher.
- Documented the gap analysis: AI academy currently has **33 monolithic phase-modules**; networking academy has **~55 atomic modules** (a topic = learn + diagrams + drag-drop + flashcards as separate sidebar entries).
**Decisions:**
  - Do **not** refactor the 155 KB of module content yet — the granular split is a large change that needs explicit approval (see `docs/alignment-plan.md` Phase 2).
  - Keep `launch.bat` (not just `init.ps1`) because the networking academy's pattern is to launch via `.bat` and it's the lower-friction option.
**Open threads:**
  - [ ] Decide whether to execute the granular module split (Phase 2 in the alignment plan).
  - [ ] Decide whether to add `diagrams.js` and which 5–10 visualisations to ship first.
  - [ ] Decide whether to publish to GitHub Pages (would need a public repo and `.github/workflows/pages.yml`).
**Files touched:** README.md, CHANGELOG.md, SESSION_CONTEXT.md, init.ps1, launch.bat, docs/alignment-plan.md
