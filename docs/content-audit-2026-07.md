# Content Audit — 2026-07-10

Audit of all module content for outdated material. Validated against Anthropic's current
API reference and web sources (July 2026). **Status: findings recorded, fixes NOT yet applied.**

## 🔴 Critical — broken code students will copy-paste

1. **`claude-sonnet-4-20250514` retired 2026-06-15.** Now 404s.
   Sites: `modules-200.js:919`, `modules-200.js:1634`. Fix: `claude-sonnet-5`.
2. **Prefill taught as a Claude technique (12 refs in modules-200.js).** Assistant-turn
   prefill returns 400 on all current Claude models (Opus 4.6+/Sonnet 4.6+/Fable 5).
   Replacement: structured outputs (`output_config.format`). Needs section rewrite.

## 🟠 High — factually wrong claims

3. **Claude landscape 2 generations behind** (Opus 4.6 shown as frontier). Current:
   Fable 5 ($10/$50 per MTok, 1M ctx), Opus 4.8 ($5/$25), Sonnet 5 ($3/$15), Haiku 4.5
   ($1/$5). ~13 spots in modules-100 tables/quizzes/flashcards.
4. **PM Playbook pricing table** (`modules-pm.js:249-251`): "Frontier $15/$75" is Opus
   4.1-era (now $5/$25); "Cheap $0.25/$1.25" is Haiku 3-era (now $1/$5). Off 3-5×.
5. **"200K for Claude" context** (`modules-200.js:1863`) — current models are 1M.
6. **Gemini 3.1 stale** — 3.5 Flash shipped May 2026; 3.5 Pro (2M ctx) GA July 2026.
7. **Extended thinking mechanics changed** — `budget_tokens` removed (400 on Opus
   4.7+/Sonnet 5); current = adaptive thinking + `effort` parameter.

## 🟡 Medium — outdated defaults that still work

8. **Level 300 capstone stack = `gpt-4o-mini` + `text-embedding-3-small`** (~8 sites in
   modules-300.js). Current equivalents: GPT-5.4 mini/nano. GPT-5.4 pricing ($2.50/$15)
   still accurate but GPT-5.6 family (Sol $5/$30, Terra $2.50/$15, Luna $1/$6) is newest.
9. **`temperature=0` taught as THE determinism lever** (~10 spots). Newest Claude models
   (Fable 5, Opus 4.8/4.7, Sonnet 5) reject sampling params. Add scoping callout;
   keep for OpenAI/open-source.
10. **Builder Track**: `gemma-2-2b-it` → Gemma 3 (`modules-builder.js:2127` — fix in
    SOURCE: `AI_Engineer_Builds/site/js/modules.js` + guide 06, then re-run converter);
    Build 1 learn says "MCP is Anthropic's 2026 standard" → launched Nov 2024.
    Everything else validated current (claude-sonnet-5 ✓, claude-haiku-4-5-20251001 ✓,
    Llama 3.2 + Unsloth/QLoRA still standard ✓).

## Fix workflow

- Builder Track fixes → edit `AI_Engineer_Builds/site/js/modules.js` → run
  `node AI_Engineer_Builds/site/tools/export-academy.js` → commit/push this repo.
- Academy fixes → edit modules-100/200/300/pm directly.
- Estimated: ~40-50 edit sites; Critical+High ≈ 2h.

## Structural recommendations

- Add `Last verified: YYYY-MM` stamp to each module's Learn header.
- Extract model names/pricing/context-window claims into ONE data file
  (e.g. `js/landscape.js`) so drift has a single place to fix.
- Quarterly re-audit. Greppable patterns:
  `claude-sonnet-4|claude-3|prefill|budget_tokens|gpt-4o|Gemini 3\.[01]|Opus 4\.[0-6]|200K for Claude|\$15.*\$75|gemma-2`

## Sources

- Anthropic current model/pricing/API reference (claude-api skill, 2026-07)
- https://devtk.ai/en/blog/openai-api-pricing-guide-2026/
- https://www.aipricing.guru/openai-pricing/
- https://meshmac.com/blog/articles/2026-google-gemini-35-pro-july-release-performance-agent-decision-guide.html
- https://ai.google.dev/gemini-api/docs/models
- https://mljourney.com/best-open-source-llms-in-2026-a-practical-guide-by-use-case/
- https://pockit.tools/blog/fine-tuning-llms-qlora-unsloth-complete-guide/
