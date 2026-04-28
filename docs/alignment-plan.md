# Alignment Plan — AI Mastery Academy → Azure Networking Academy parity

**Goal:** Bring `ai-academy/` to structural and pedagogical parity with [`../../azure-networking-academy/`](../../azure-networking-academy/), which is the more mature sibling.

**Status of this doc:** Drafted 2026-04-28. Phases 0–1 complete. Phases 2–5 pending decision.

---

## 1. Side-by-side gap analysis

| Dimension | AI Academy (today) | Networking Academy (target) | Gap |
|---|---|---|---|
| Module objects | **33** (Phase = 1 module) | **~55** (topic = 5–8 modules) | Granularity |
| Largest content file | `modules-100.js` 67 KB | `modules-200.js` 154 KB | Content depth |
| Total module JS | ~155 KB | ~510 KB | ~3.3× more depth |
| Diagrams engine | none | `diagrams.js` (110 KB) animated SVG/Canvas | Missing |
| Search palette | none | `Ctrl+K` global search | Missing |
| `estimatedTime` per module | no | yes (e.g., `'45m'`) | Missing |
| CSP / a11y polish | no | CSP meta, skip-link, ARIA, mobile nav | Missing |
| Mobile nav toggle | no | yes | Missing |
| GitHub Pages deploy | no | `.github/workflows/pages.yml` | Missing |
| `launch.bat` quality | single `python -m http.server` | python → python3 → npx fallback | Closed in [Unreleased] |
| Standard project files | none | none (it's flat) — but workspace `_template` expects them | Closed in [Unreleased] |

---

## 2. The structural pattern to copy

The networking academy treats every **topic** as a *cluster of small modules* in the sidebar. Example for "Networking Fundamentals":

```
🔌 Networking Fundamentals          ← learn (45m)
🧱 The OSI Model — 7 Layers         ← diagram + learn
🤝 TCP 3-Way Handshake              ← animated diagram
🔍 DNS Resolution                   ← animated diagram
📦 How a Packet Travels to Azure    ← animated diagram
🎯 Match the OSI Layer              ← drag-drop quiz
🧮 Subnet Calculator                ← interactive tool
🃏 Key Terms Flashcards             ← spaced-repetition cards
```

That's **8 sidebar entries from 1 topic**. AI academy currently has the equivalent of 1 entry ("Phase 0: AI Orientation") that internally bundles all of the above into Learn/Interactive/Quiz/Lab tabs of one giant module.

### Why this matters pedagogically

- **Spaced repetition by navigation** — each small module is one sitting (5–15 min), one localStorage completion tick, one dopamine hit.
- **Re-visitable atoms** — "I want to redo just the OSI quiz" is one click, not "open phase, switch to quiz tab, scroll".
- **Progress signal** — 55 ticks feels like progress; 33 phase ticks feels like a slog.
- **Easier authoring** — small files are easier to edit and review than 67 KB monoliths.

---

## 3. Proposed split for AI Academy (target shape)

Map every Phase to a topic cluster of 5–8 atomic modules.

### Phase 0 — AI Orientation → 6 modules
| New module id | Type | Source of content |
|---|---|---|
| `llm-fundamentals` | learn | "What is an LLM" + "Intern Mental Model" sections |
| `ai-stack-layers` | diagram | The AI / ML / DL / GenAI / LLM stack table → animated SVG |
| `landscape-2026` | learn | Current model landscape (GPT-5.4, Claude Opus 4.6, Gemini 3.1) |
| `roadmap-quiz` | quiz | Existing Phase 0 quiz |
| `platform-products` | drag-drop | Existing `platform-products` interactive |
| `orientation-cards` | flashcards | Existing `orientation-cards` interactive |
| `journal-lab` | lab | Existing "Build your AI learning journal" lab |

### Phase 1 — Prompt Engineering → 7 modules
| New module id | Type |
|---|---|
| `prompting-why` | learn — "Why prompt engineering matters" |
| `rtcc-framework` | learn + worked examples |
| `few-shot-cot-xml` | learn — advanced techniques |
| `prompt-evolution` | diagram — bad → great prompt animated |
| `prompt-techniques-dd` | drag-drop (existing) |
| `prompt-cards` | flashcards (existing) |
| `prompt-playground-lab` | lab (existing) |

### Phase 2 — Platform Mastery → 8 modules
| New module id | Type |
|---|---|
| `chatgpt-deep-dive` | learn |
| `claude-deep-dive` | learn |
| `gemini-deep-dive` | learn |
| `platform-comparison` | diagram — feature matrix table |
| `notebooklm-vs-projects` | learn — when to use which |
| `platform-features-dd` | drag-drop (existing) |
| `platform-cards` | flashcards (existing) |
| `three-tools-lab` | lab (existing) |

### Phases 3–12

Same pattern. Estimated final shape: **~75 modules** (vs 33 today, vs 55 in networking).

---

## 4. Diagrams to add (`js/diagrams.js`)

The networking academy ships ~15 animated diagrams. Top 10 candidates for AI academy:

1. **Tokenisation animation** — "the cat sat" → `[the][ cat][ sat]` flowing into the model
2. **Transformer attention heatmap** — words light up to show attention
3. **Next-token prediction** — top-5 candidate tokens with probabilities, sampling animation
4. **RAG pipeline** — query → embed → vector search → retrieve → augment → generate
5. **Agent loop (ReAct)** — Thought → Action → Observation → Repeat
6. **Tool/function calling handshake** — model JSON → app executes → result back
7. **MCP architecture** — client ↔ server, tools/resources/prompts surfaces
8. **Multi-agent orchestrator** — manager dispatches to specialist agents in parallel
9. **Embedding space** — 2D projection where similar concepts cluster
10. **Context window decay** — recall accuracy vs position (lost-in-the-middle)

Implement style: pure SVG + small `setInterval` animations, zero external libraries (matches networking academy convention).

---

## 5. Polish items (cheap wins)

Small additions that bring big perceived parity:

- [ ] Add `estimatedTime: '15m'` to every module object → sidebar shows time badges.
- [ ] Add CSP meta to `index.html` (copy from networking academy).
- [ ] Add `<a href="#content" class="skip-link">` and ARIA labels.
- [ ] Add mobile nav toggle button + `mobile-open` class handling.
- [ ] Add Ctrl+K search palette (copy `openSearch` / `pickSearch` block from networking `app.js`, lines ~120–190).
- [ ] Add `.github/workflows/pages.yml` (copy from networking academy).
- [ ] Add favicon variant per level if desired (currently single 🧠).

---

## 6. Execution phases

### Phase 0 — Workspace convention (✅ done 2026-04-28)
- `README.md`, `CHANGELOG.md`, `SESSION_CONTEXT.md`, `init.ps1`, `docs/`.

### Phase 1 — Launcher parity (✅ done 2026-04-28)
- `launch.bat` upgraded with python / python3 / npx / fallback chain.

### Phase 2 — Granular module split (⏸ awaiting approval)
- Refactor `modules-100/200/300.js`. Estimated impact: rewrites of all 3 files; existing module IDs preserved as the "main learn" entry of each cluster so old localStorage progress isn't lost; new sub-module IDs added.
- Recommended order: pilot on Phase 0 first (smallest), validate UX, then continue.

### Phase 3 — Diagrams engine (⏸ awaiting approval)
- New `js/diagrams.js`. Wire `diagram` module type into `app.js`.
- Ship first 3 diagrams as the pilot (tokenisation, RAG pipeline, agent loop).

### Phase 4 — Polish (⏸ awaiting approval)
- Search palette, CSP, a11y, mobile nav, estimatedTime, GitHub Pages workflow.

### Phase 5 — Content depth pass (⏸ awaiting approval)
- Optional: bring total content closer to networking academy's ~510 KB by deepening Phase 4–8 modules (RAG, agents, multi-agent are currently lighter than they should be).

---

## 7. Risks & non-goals

- **Risk: progress reset.** The granular split changes module IDs. Mitigation: keep current 33 IDs as the "main learn" module in each cluster, so existing completions still register.
- **Non-goal: a build step.** Both academies are intentionally vanilla HTML/CSS/JS. Don't introduce bundlers, frameworks, or CDNs.
- **Non-goal: account system.** Stay localStorage-only; export/import JSON is the sync story.
