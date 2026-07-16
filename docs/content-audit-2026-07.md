# Content Audit — 2026-07-10

Audit of all module content for outdated material. Validated against current provider
documentation and supporting sources in July 2026. **Status: Critical, High, and Medium
findings resolved on 2026-07-13.**

## 🔴 Critical — broken code students will copy-paste

1. [x] **Retired `claude-sonnet-4-20250514`.** Replaced with `claude-sonnet-5` in
   current examples. Verified sites: `modules-200.js:926`, `modules-200.js:1648`.
2. [x] **Assistant prefill taught as a Claude technique.** Rewritten around structured
   outputs with `output_config.format`. Verified section: `modules-200.js:716-746`.

## 🟠 High — factually wrong claims

3. [x] **Claude landscape two generations behind.** Current names, prices, and context
   now come from `js/landscape.js`; consumers are in `modules-100.js:85-162`.
4. [x] **PM Playbook pricing table stale.** Table now reads representative Claude
   prices from the shared landscape data at `modules-pm.js:249-251`.
5. [x] **"200K for Claude" context stale.** Replaced with current 1M guidance and a
   reminder to check the selected model at `modules-200.js:1877`.
6. [x] **Gemini 3.1 stale.** Replaced by Gemini 3.5 Pro/Flash and the 2M Pro context
   value through `js/landscape.js`.
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
   `claude-sonnet-4|claude-3|prefill|gpt-4o|Gemini 3\.[01]|Opus 4\.[0-6]|200K for Claude|\$15.*\$75|gemma-2`
- Run that pattern only against `ai-academy/js/` and Builder source/guides. Historical
   audit and session logs intentionally retain old terms. Check `budget_tokens` separately;
   the one expected match is the deprecation warning in `modules-200.js`.

## Sources

- https://platform.claude.com/docs/en/about-claude/models/overview
- https://platform.claude.com/docs/en/about-claude/pricing
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
- https://openai.com/api/pricing/
- https://devtk.ai/en/blog/openai-api-pricing-guide-2026/
- https://www.aipricing.guru/openai-pricing/
- https://meshmac.com/blog/articles/2026-google-gemini-35-pro-july-release-performance-agent-decision-guide.html
- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemma/docs/core
- https://www.anthropic.com/news/model-context-protocol
- https://mljourney.com/best-open-source-llms-in-2026-a-practical-guide-by-use-case/
- https://pockit.tools/blog/fine-tuning-llms-qlora-unsloth-complete-guide/
