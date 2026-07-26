# Content Audit — July 2026

Audit of all module content for outdated material. Validated against current provider
documentation in July 2026. **Status: Initial Critical, High, and Medium findings resolved
on 2026-07-13; model-catalog, SDK, pricing, and advanced-curriculum corrections verified
and completed on 2026-07-26.**

## 2026-07-26 corrective pass

- [x] Updated `js/landscape.js` with dated first-party sources, exact model IDs,
   model-specific context limits, and July pricing while preserving existing consumer keys.
- [x] Corrected the OpenAI lineup to GPT-5.6 Sol, Terra, and Luna, each with a 1.05M
   context window and its verified input/output price.
- [x] Corrected the Anthropic lineup to Claude Fable 5, Opus 5, Sonnet 5, and Haiku 4.5.
   Sonnet 5 is $2/$10 per million tokens through 2026-08-31 and $3/$15 afterward;
   Haiku 4.5 has a 200K context window while the other listed current models have 1M.
- [x] Corrected Google to stable Gemini 3.6 Flash and Gemini 3.5 Flash, current preview
   `gemini-3.1-pro-preview`, and 1,048,576-token input limits. Gemini 2.5 remains supported.
- [x] Migrated copyable Google examples from `google-generativeai` to `google-genai`,
   removed unsupported generic model aliases, and labeled incomplete integrations conceptual.
- [x] Added production competencies to Phases 9–12: MCP trust and authorization,
   deployment identity and rollback, SaaS tenant controls and eval gates, and expert
   architecture/reliability/security/cost/migration reviews.

## 🔴 Critical — broken code students will copy-paste

1. [x] **Retired `claude-sonnet-4-20250514`.** Replaced with `claude-sonnet-5` in
   current examples. Verified sites: `modules-200.js:926`, `modules-200.js:1648`.
2. [x] **Assistant prefill taught as a Claude technique.** Rewritten around structured
   outputs with `output_config.format`. Verified section: `modules-200.js:716-746`.

## 🟠 High — factually wrong claims

3. [x] **Claude landscape two generations behind.** Corrected again on 2026-07-26:
   current names, exact IDs, prices, promotional dates, and model-specific context limits
   now come from `js/landscape.js`.
4. [x] **PM Playbook pricing table stale.** Table now reads representative Claude
   prices from shared landscape data and models both Sonnet 5's introductory and standard
   rates in its worked examples.
5. [x] **Provider-wide Claude context claim.** Replaced with model-specific guidance:
   Fable 5, Opus 5, and Sonnet 5 use 1M; Haiku 4.5 uses 200K.
6. [x] **Gemini catalog stale.** Corrected to stable Gemini 3.6 Flash and Gemini 3.5
   Flash plus preview Gemini 3.1 Pro. Removed the unsupported "Gemini 3.5 Pro" and 2M
   claims while retaining Gemini 2.5 as supported.
7. [x] **Extended thinking mechanics changed.** Curriculum now teaches adaptive
   thinking plus `effort`; `budget_tokens` appears only in a deprecation warning at
   `modules-200.js:808`. Current example: `modules-200.js:1231-1257`.

## 🟡 Medium — outdated defaults that still work

8. [x] **Level 300 capstone used `gpt-4o-mini`.** Replaced with `gpt-5.4-mini` at
   configuration, evaluator, deployment, and lab sites. `text-embedding-3-small` remains
   because the audit found no retirement or required migration.
9. [x] **Temperature taught as a determinism guarantee.** Guidance now scopes the
   parameter to models that expose it and states that low values reduce variance but do
   not guarantee identical output. Main sites: `modules-100.js:108,263`,
   `modules-300.js:1410,1805,1946`, and `diagrams.js:383`.
10. [x] **Builder Track used Gemma 2 and misstated the MCP date.** Fixed in source at
    `AI_Engineer_Builds/site/js/modules.js:85,826` and `guides/06...md:22`; converter
    rerun and generated `modules-builder.js` validated.

## Fix workflow

- Builder Track fixes → edit `personal/AI_Engineer_Builds/site/js/modules.js` → run
   `node personal/AI_Engineer_Builds/site/tools/export-academy.js` from the workspace root.
- Academy fixes → edit modules-100/200/300/pm directly.
- Never hand-edit generated `js/modules-builder.js`.

## Structural recommendations

- [x] Add `Last verified: YYYY-MM` to each Learn view. Implemented centrally in
   `js/app.js`; current date comes from `js/landscape.js`.
- [x] Extract volatile model names, pricing, and context-window claims into
   `js/landscape.js`. Curriculum prose stays in its owning module.
- Quarterly re-audit. Greppable patterns:
   `gemini-pro|Gemini 3\.5 Pro|["']claude-sonnet["']|Opus 4\.8|google-generativeai|google\.generativeai|text-embedding-004`
- Run that pattern only against `ai-academy/js/` and Builder source/guides. Historical
   audit and session logs intentionally retain old terms. Check `budget_tokens` separately;
   the one expected match is the deprecation warning in `modules-200.js`.

## Sources

- https://platform.claude.com/docs/en/about-claude/models/overview
- https://platform.claude.com/docs/en/about-claude/pricing
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
- https://developers.openai.com/api/docs/models
- https://openai.com/index/gpt-5-6/
- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/quickstart
- https://ai.google.dev/gemini-api/docs/migrate
- https://ai.google.dev/gemini-api/docs/embeddings
- https://ai.google.dev/gemini-api/docs/function-calling
- https://ai.google.dev/gemma/docs/core
- https://www.anthropic.com/news/model-context-protocol
