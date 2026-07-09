# PRD — Builder Track: integrate AI_Engineer_Builds into AI Mastery Academy

**Date:** 2026-07-08 · **Author:** Akshay · **Status:** draft

## Problem

The Academy (33 modules, Learn/Interactive/Quiz/Lab per module) teaches concepts, but its
labs are copy/paste exercises. Meanwhile `personal/AI_Engineer_Builds/` now holds 7
portfolio-grade build guides (MCP, orchestration, evals, RAG guardrails, audit logs,
fine-tuning, knowledge graphs) that exist only as markdown, invisible to the Academy's
progress tracking and curriculum flow. Two learning surfaces, no bridge.

## Decision & user

Akshay (sole user) wants one place to go from *reading about* a concept to *shipping* it.
Decision: add a **Builder Track** level to the Academy that renders the 7 guides as
lab-first modules — rather than duplicating content or building a new site.

## Solution (recommended)

A new `modules-builder.js` (sidebar level "⬡ Builder Track") with 7 modules, one per guide:

- **Learn tab** = concept + architecture diagram (from guide intro).
- **Lab tab** = the phased steps, rendered with the existing `lab-engine.js` step format;
  acceptance criteria become the lab's completion checklist (tracked in `progress.js`).
- **Quiz tab** = 5–8 questions per build via existing `quiz-engine.js` (e.g. "why MERGE
  not CREATE?", "why pin the judge model?").
- **Source of truth stays in `AI_Engineer_Builds/guides/`** — a small converter script
  (`tools/import-guides.ps1`) regenerates module JS from the markdown, so guides don't fork.
  (Site is no-build/no-CDN, so content must be baked into JS, not fetched cross-folder.)

Curriculum mapping: builds slot after their concept modules — Build 1↔Phase 5 (tool use)/MCP,
Build 2↔Phase 6 (agents), Build 3↔evals content, Build 4↔Phase 4 (RAG), Build 5↔agents,
Builds 6–7 sit at Level 300 depth.

## Alternatives rejected

- Rewrite guides directly as modules — forks content, guides go stale.
- Link out to markdown files — breaks progress tracking, feels bolted-on.
- New standalone site — third surface, worse.

## Success metric & gate

- All 7 builds visible with working Learn/Lab/Quiz tabs; lab checklists persist in
  localStorage; converter re-run produces zero manual diffs.
- **Review gate:** after Build 1's module is done end-to-end (converter + module + quiz),
  decide whether to batch the remaining 6 or simplify the converter.

## Out of scope

- Auto-grading actual code, backend anything, redesign of existing 33 modules.

## Risks / assumptions

- `modules-200.js` is already 270 KB — keep builder modules lean (~15 KB each) or lazy-load.
- Assumes lab-engine v2 step format can express multi-phase builds (verify at gate).
- Site last touched 2026-05-26; smoke-test existing modules before adding a level.

## Effort

~3 sessions: (1) converter + Build 1 module, (2) remaining modules, (3) quizzes + sidebar/progress wiring.
