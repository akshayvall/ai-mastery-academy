# PRD: Builder Track production parity and content refresh

**Date:** 2026-07-14
**Owner:** Akshay
**Status:** Release ready, awaiting owner approval
**Target:** AI Mastery Academy production site

## 1. Decision

Make AI Mastery Academy the only maintained learner experience for the seven AI
engineering builds. The archived AI Builder Academy remains a historical showcase,
but its content, learning interactions, and progress behavior must be represented in
the Mastery Academy Builder Track before the next production release.

## 2. User and outcome

The primary user is an aspiring AI engineer who learns the concepts in Levels 100-300
and then applies them through portfolio-grade builds. The desired outcome is one
continuous experience where the learner can understand, build, verify, and track each
project without switching sites or losing functionality.

## 3. Problem

The Builder Track is generated from a separate source project. That lowers duplication,
but it creates three release risks:

1. Generated academy content can drift from the Builder source.
2. Site-level capabilities can be missed because the converter handles module data,
   not application behavior.
3. Model names, APIs, package versions, and platform guidance can become stale even
   when source and generated output match exactly.

The July 2026 academy audit fixed known Critical, High, and Medium findings. This PRD
adds a release-grade parity check across every Builder module and the learning engine.

## 4. Goals

- Prove that all seven Builder modules are present in AI Mastery Academy.
- Prove field-level parity for Learn content, diagrams, labs, quizzes, and metadata.
- Confirm that Builder learning features work in the academy, including per-step lab
  persistence, undo, quiz scoring, module completion, streaks, and progress export/import.
- Review externally volatile technical claims against current primary documentation.
- Remove or correct stale, broken, insecure, or misleading instructions.
- Produce a repeatable validation command and an evidence-backed ship decision.

## 5. Non-goals

- Redesigning the academy or changing its visual identity.
- Adding an application backend, authentication, cloud progress sync, or code execution.
- Auto-grading the learner's local build output.
- Expanding beyond the existing seven builds.
- Updating the archived standalone deployment after parity is established.

## 6. Source-of-truth architecture

| Asset | Source of truth | Release handling |
|---|---|---|
| Builder module data | `AI_Engineer_Builds/site/js/modules.js` | Edit here first |
| Long-form build guides | `AI_Engineer_Builds/guides/` | Keep aligned with module instructions |
| Academy Builder data | `ai-academy/js/modules-builder.js` | Generated; never hand-edit |
| Converter | `AI_Engineer_Builds/site/tools/export-academy.js` | Regenerate academy data |
| Academy learning engine | `ai-academy/js/` | Validate shared behavior in place |
| Volatile landscape facts | `ai-academy/js/landscape.js` | Centralize when shared across tracks |

## 7. Functional requirements

### FR1: Module inventory parity

The academy must contain exactly these seven builds, in this order:

1. MCP-Powered AI Assistant
2. Multi-Agent Orchestration System
3. AI Evaluation Pipeline
4. RAG System with Security Guardrails
5. AI Agent with Audit Logs
6. Fine-tune an Open-Source Model
7. Knowledge Graph-Powered AI

Each generated module must preserve its source title, tagline, icon, duration, Learn
content, diagrams, quiz, and lab. Academy-only transformations are limited to the
`builder-` module ID, Level 400 metadata, display title, and `b-` diagram prefixes.

### FR2: Learning feature parity

For every Builder module, the academy must provide:

- A Learn view with all source content.
- Every source diagram, with render, play, step, and reset behavior where configured.
- A lab with the same phases, code, verification instructions, and acceptance criteria.
- A quiz with the same questions, choices, answers, and explanations.
- Persistent lab steps and quiz results after reload.
- Module completion, streak, reset, and JSON progress export/import behavior.

### FR3: Current and safe technical guidance

Each build must be reviewed against primary documentation for:

- Current SDK/package names and supported usage patterns.
- Current model families or model-selection guidance without fragile hard-coded claims.
- API dates, protocol behavior, and platform prerequisites.
- Security controls for prompt injection, secrets, data access, and audit logs.
- Reproducible setup, cleanup, verification, and failure guidance.

When a precise model or price changes frequently, the curriculum should teach a
selection rule and link to the provider's current documentation instead of presenting
the value as permanent.

### FR4: Production readiness

- All JavaScript files pass syntax validation.
- The converter is deterministic apart from its generated-date banner.
- A fresh conversion produces no content drift.
- The production page loads without console errors at desktop and mobile widths.
- The dashboard and all seven Builder routes render.
- Existing Levels 100-300 remain accessible.
- GitHub Pages deployment configuration remains valid.

## 8. Content review matrix

| Build | Review focus | Required evidence | Status |
|---|---|---|---|
| 1. MCP Assistant | MCP lifecycle, SDK/API examples, tool safety | Source/generated parity plus primary MCP docs | Pass |
| 2. Orchestration | Agent boundaries, failure handling, model routing | Parity plus current SDK guidance | Pass |
| 3. Eval Pipeline | Dataset design, judge bias, thresholds, CI use | Parity plus current eval guidance | Pass |
| 4. RAG Guardrails | Injection defense, retrieval boundaries, sanitization | Parity plus security review | Pass |
| 5. Audit Logs | Event schema, redaction, traceability, retention | Parity plus privacy/security review | Pass |
| 6. Fine-tuning | Model family, QLoRA stack, GPU assumptions, evaluation | Parity plus current framework/model docs | Pass |
| 7. Knowledge Graph | Neo4j driver/API, schema, idempotency, Cypher safety | Parity plus current Neo4j guidance | Pass |

## 9. Acceptance criteria

- [x] Exactly seven source modules and seven generated academy modules exist.
- [x] Stable module IDs are unique and the source-to-generated mapping is complete.
- [x] Field-level comparison reports no missing Learn, diagram, lab, or quiz content.
- [x] All diagrams referenced by Builder modules have registered academy renderers.
- [x] All seven Builder modules render in the academy without browser console errors.
- [x] Lab state survives reload and undo changes only the intended step.
- [x] Quiz answers, pass threshold, completion, reset, export, and import work.
- [x] Every externally volatile claim has been reviewed and corrected or dated.
- [x] Source guides and module content have no material contradictions.
- [x] JavaScript syntax and repository validation checks pass.
- [x] Production smoke checks pass on desktop and mobile.
- [x] The audit records evidence, residual risks, and a ship/no-ship recommendation.

## 10. Release plan

1. Inventory source modules, generated modules, diagrams, labs, and quizzes.
2. Run deterministic source-to-generated parity checks.
3. Review each build's technical claims against current primary documentation.
4. Apply fixes only in the owning source and regenerate derived output.
5. Run syntax, stale-pattern, behavior, and browser smoke checks.
6. Review the final diff and classify any residual risk.
7. Commit and push the academy repository to trigger GitHub Pages only after approval.
8. Verify the deployed URL and retain the prior commit as the rollback point.

## 11. Rollback

If deployment validation fails, revert the academy repository to the last known-good
commit and allow GitHub Pages to redeploy it. Do not repair the generated Builder file
directly; fix the Builder source or converter, regenerate, and repeat validation.

## 12. Success metrics

- Parity audit: 100% of source modules and required fields represented.
- Browser smoke test: 7/7 Builder modules and all required interactions pass.
- Content audit: zero unresolved Critical or High findings.
- Maintenance: one source edit plus one converter run produces the release artifact.

## 13. Review gate

Akshay reviews the completed findings, residual risks, and production evidence. The
release ships only when all Must-have acceptance criteria pass and no Critical or High
content issue remains. Medium findings may be deferred only when documented with an
owner and target date.

## 14. Findings and release decision

**Recommendation:** Ship after Akshay reviews the release scope and explicitly approves
the production push. No production action has been taken.

### Evidence

- Deterministic parity gate: `7 modules, 14 diagrams, 40 quiz questions, 36 lab phases`.
- JavaScript syntax checks and editor diagnostics passed.
- All seven Builder routes and all 14 diagrams rendered without browser console errors.
- Diagram play, step, and reset controls passed.
- Deep-link reload restored the selected Builder module.
- Lab step save, reload, restore, and undo passed.
- Build 1 quiz completed at 5/5 and the score persisted after reload.
- Progress export, reset, and import completed as a round trip. Malformed imports were
  rejected without overwriting saved progress.
- Desktop at 1440x900 and mobile at 390x844 had no page-level horizontal overflow.
  The mobile tab strip scrolls horizontally and keyboard controls have a visible focus ring.
- The GitHub Pages workflow remains valid. Production deployment was not triggered.

### Residual risks

- Browser progress is local to one browser profile unless the learner exports it.
- Provider APIs, package names, and model catalogs remain volatile. Re-run the content
  audit before a major release or when a referenced dependency changes.
- The academy worktree contains changes beyond this Builder audit. Review the final
  release diff before committing so unrelated work is not deployed accidentally.