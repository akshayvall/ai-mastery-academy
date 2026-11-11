# AI Mastery Academy: education-quality audit and modernization PRD

**Version:** 1.1

**Audit reference date:** 2026-11-10

**Status:** Rollout implemented except runtime-blocked Builder-source corrections and archive packaging. Publication authorized November 11; see sections 24-25 and the Pages workflow for delivery status.

**Product owner and approver:** Akshay

**Product:** [AI Mastery Academy](https://akshayvall.github.io/ai-mastery-academy/)

**Audited code baseline:** `e4587c4`, September 16 learning release

**Scope:** Personal learning product; public/synthetic examples only

## 1. Executive recommendation

**Keep the academy. Redesign its teaching sequence before expanding its catalogue.**

The academy has an unusually useful foundation for an independent learning product: 31 substantive modules, eight PM modules, seven Builder projects, a capstone, local progress recovery, spaced review, offline delivery, and guided casework. It is not an empty prototype. Replacing it with another framework, a chatbot, or a larger collection of links would discard value without fixing the main problem.

The current product is closer to **a capable technical reference library with a learning layer** than a coherent zero-to-professional education. Its introductory lesson starts with a multi-part case, prediction, and transfer task before explaining what a language model is. Some later lessons contain thousands of words while deployment gets only a short overview. Several assessments reward memorizing oversimplified rules rather than making defensible decisions. The September technology registry is overdue for review.

The recommended product promise is:

> Start without coding knowledge. Learn to explain AI, judge when it is useful, build a bounded system, test it, and defend its quality, cost, and risks.

This is deliberately narrower and more testable than "beginner to expert." Research-level model training remains an optional specialization, not a condition for becoming a capable AI product builder.

### The six changes that matter most

| Priority | Change | Why it matters |
|---|---|---|
| P0 | Correct misleading teaching claims and reconcile current provider facts | A polished lesson that teaches a false rule creates confident mistakes |
| P0 | Teach concepts before cases; provide a genuinely beginner-safe first hour | The learner needs an understandable first success, not an assessment dashboard |
| P1 | Replace long phase pages with small authored units and a clear Path / Lab / Progress structure | Reduces the effort spent navigating rather than learning |
| P1 | Turn labs into reproducible, inspectable learning experiences | Asking a coding agent to build an application does not establish that the learner understands it |
| P1 | Replace slogan quizzes with diagnosis, prediction, explanation, and changed-condition tasks | Tests transferable competence instead of recognition |
| P1/P2 | Refresh AI systems coverage and introduce maintained specialization tracks | Covers modern AI without turning every release into another compulsory module |

**Recommended delivery strategy:** approve a six-module vertical slice first, evaluate it with real beginners, then migrate the remaining curriculum. The full roadmap below is specified now; that does not make an all-at-once rewrite the best execution plan.

**Definition of world-class for this product:** accurate and maintained content, a calm beginner experience, reproducible practice, accessible explanations, meaningful assessment, and evidence of retained competence. Prestige, animation volume, model-name coverage, and completion counts are not substitutes.

## 2. What was audited, and what the evidence establishes

### 2.1 Direct evidence

| Surface | Coverage and result |
|---|---|
| Project understanding | Read academy and parent README, session history, changelog, September PRD, model registry, learning/mastery definitions, relevant runtime and test code |
| Networking precedent | Retrieved the Azure networking academy audit conversation, including beginner requirements, complaints about worked cases and navigation, and subsequent simplification direction |
| Curriculum inventory | Inspected the runtime inventory of all 41 entries: 31 real modules and 10 visual-review activities |
| Learning metadata | Reviewed the path structure, outcome/prerequisite system, casework pattern, and transfer/rubric model |
| Lesson depth | Measured approximate Learn-text word counts after stripping HTML; these include code text and exclude separate coaching and labs |
| Assessments | Deep-reviewed prompting, tool use, multi-agent, expert, deployment, and all eight PM quiz sets; sampled additional quiz/lab content |
| Diagrams | Inventoried 39 instances across 20 renderer types; reviewed one narrative per type and rendered all instances at 390px and 1440px |
| Browser experience | Opened all 41 entries at both widths in fresh Microsoft Edge contexts; inspected representative desktop/mobile screenshots |
| Existing checks | 184 Node checks passed; all 19 existing browser checks passed using Microsoft Edge rather than the runner's default bundled browser |
| Live-site relationship | Public site returned HTTP 200; 12 selected local/live assets matched after normalizing line endings |
| Current technology | Checked first-party model, lifecycle, API, protocol, coding-agent, and Microsoft Foundry documentation |
| Education benchmarks | Checked official curricula from Anthropic, Hugging Face, Stanford, Full Stack Deep Learning, and DeepLearning.AI |

The 12 parity comparisons cover the shell, app controller, registry, coaching engine/content, principal curriculum files, Builder output, diagrams, and service worker. This is **sampled asset parity**, not a byte-for-byte certification of the entire deployment.

Evidence files:

- [Browser observations and live/local comparison](audit-evidence-2026-11-10/browser-evidence.json)
- [Fresh mobile home](audit-evidence-2026-11-10/home-390.png)
- [Desktop introductory lesson](audit-evidence-2026-11-10/orientation-1440.png)
- [Mobile introductory lesson](audit-evidence-2026-11-10/orientation-390.png)
- [Mobile diagram](audit-evidence-2026-11-10/diagram-390.png)
- [Navigation computed styles](audit-evidence-2026-11-10/navigation-styles.json)

### 2.2 Limits

This is a full **product and curriculum-design audit**, not a factual certification of every sentence or every animation frame. Structural coverage is exhaustive across the inventory; detailed content checking is targeted. The distinction matters.

No paid model calls, cloud provisioning, learner accounts, production progress changes, provider SDK lab execution, penetration testing, or publication occurred. The review did not establish screen-reader conformance, learning gains, completion rates, field performance, or independently verified mastery.

All diagrams rendered, but that does not prove that every edge, label, and animation is semantically correct. Section 12 gives the required diagram review contract and the specific issues identified.

A search-generated provider summary contradicted current provider pages. It was not used as authority for the lifecycle findings below. Where documentation describes a family, alias, preview, or platform-specific schedule, that distinction is retained rather than extrapolated.

### 2.3 Product assessment

These are qualitative judgments, not validated education scores.

| Dimension | Assessment | Basis |
|---|---|---|
| Breadth | Strong | Foundations, RAG, tools, agents, PM craft, production, Builder projects |
| Beginner sequencing | Needs substantial redesign | Casework precedes explanation; diagnostic and seven-step lesson chrome dominate entry |
| Teaching consistency | Uneven | Short production summaries coexist with 4,000-5,000-word intermediate lessons |
| Factual reliability | Mixed | Good uncertainty language in coaching; contradicted by absolute claims in older lesson/quiz/diagram content |
| Practical learning | Promising, not demonstrated | Strong artifact goals; many labs remain prompts to a coding assistant or paper cases |
| Assessment validity | Needs substantial work | Existing engine reliability does not ensure the questions measure judgment |
| Technical delivery | Solid baseline | Existing contracts/browser checks pass; offline/progress features are already implemented |
| Mobile visual learning | Functional but cumbersome | No whole-page overflow observed; important diagrams require large local horizontal scroll |
| Learning effectiveness | Unknown | No learner study or delayed-transfer baseline available |
| Maintenance | Mechanism exists, operation overdue | Registry has source ownership and dates, but its October review date has passed |

## 3. What to carry forward from the networking audit chat

The networking conversation provides a product brief, not permission to copy its code or assume all its changes are deployed.

| Networking lesson | AI Academy application |
|---|---|
| Begin from zero without making the learner feel incapable | Add first-use lessons that require neither terminal skills nor a paid subscription |
| Do not put an unfamiliar worked case before the underlying concept | Explain one idea, show a small example, then ask for prediction and transfer |
| Navigation must describe useful destinations | Consolidate the visible learning route into Path, Lab, and Progress; keep search/reference available |
| A simpler label is not enough if the destination remains confusing | Each destination needs a real primary task, useful empty state, and reliable resume behavior |
| Short authored units beat a long page with extra controls | Split by concept and misconception, not mechanically every fixed number of words |
| Diagrams should explain behavior, not decorate the page | Use trace, comparison, state, sequence, and data-flow visuals appropriate to the concept |
| Continue must return to unfinished work | Resume the actual unit and step, including an incomplete exercise/check, rather than skipping after reading |
| Beginner clarity and technical depth must coexist | Keep a clear main route with optional technical detail and an expert reference mode |

Important difference: the AI Academy's September Learn, Practice, and Build destinations are implemented. They should **not** be reported as empty just because that was an earlier networking complaint. The current issue is competing navigation layers and teaching order.

**Design principle:** reduce the number of decisions a novice makes while preserving the number of useful things an experienced learner can do.

## 4. Findings and required treatment

Priority meanings: P0 = correct before promoting the revised beginner experience; P1 = required for the professional learning release; P2 = subsequent specialization or operational maturity. These are product priorities, not vulnerability severities.

| ID | Priority | Finding and evidence | Required treatment |
|---|---|---|---|
| F01 | P0 | `js/learning-engine.js:173-181` prepends coaching. At both audited widths, Orientation's first headings are Worked case, Predict the result, Changed-task brief, then What is an LLM. | Put the explanatory concept first. Introduce a short worked example after it; defer transfer until practice is complete. |
| F02 | P1 | Fresh home prioritizes a ten-question diagnostic. Lessons expose seven steps plus Guided/Browse, an outline, global navigation, and evidence state. See screenshots and `js/today-engine.js:94-98`. | Offer "Start here" as the primary novice action; make placement optional. Use three learning steps with secondary evidence details. |
| F03 | P0 | `js/modules-100.js:399-404` claims prompt quality produces 80% of AI value, 10x quality, and reliable results every time. No supporting measurement accompanies these statements. | Replace unsupported numbers and promises with task-specific examples and evaluation methods. |
| F04 | P0 | `js/modules-100.js:445-446` and its quiz generalize step-by-step prompting. `js/modules-200.js:1082` describes temperature zero as deterministic. | Teach model-specific reasoning controls; avoid requesting hidden reasoning. Distinguish greedy sampling from reproducible system behavior. [S05] |
| F05 | P0 | `js/modules-100.js:608` equates source grounding with absence of hallucination. | Teach that retrieval, interpretation, attribution, and citation correctness can each fail. Add an unsupported-answer case. |
| F06 | P0 | `js/landscape.js:3-9` remains September-reviewed with an October 14 next-review date. Current provider catalogues/lifecycle notices differ. | Refresh affected facts and label supported older choices separately from current catalogue recommendations. [S01-S04, S06] |
| F07 | P1 | Phase 5 is titled Tool Use, but much of its roughly 4,579-word Learn body teaches prompting; its quiz largely tests tool vocabulary. `js/modules-200.js:650-700`. | Separate prompting/context material from tool contracts; align each outcome, lesson, practice, and check. |
| F08 | P1 | Learn-text estimates range from 252 words for Platform Mastery and 293 for Full-Stack Deploy to 5,124 for Multi-Agent and 6,452 for the capstone. | Redesign unit scope and prerequisite coverage. Word count is a diagnostic of unevenness, not a target for padding. |
| F09 | P0 | PM eval teaching says cheap models make terrible judges; its quiz presents about 80% agreement and 100-500 examples as broadly sufficient. `js/modules-pm.js:127,170-172`. | Teach calibration by task, failure severity, class balance, disagreement, and uncertainty. Remove a universal sample-size ceiling and model-price proxy. |
| F10 | P0 | `js/modules-pm.js:514,596` tells learners to "log everything" in shadow mode. | Require purpose-limited telemetry, redaction, access controls, retention, and approved data use. Shadow execution can still expose data or incur cost. |
| F11 | P1 | Multi-agent quiz implies specialized roles inherently improve results; economics/strategy questions prescribe universal defaults. The richer transfer tasks are more nuanced. | Assess a decision against evidence and constraints; accept a well-supported single-agent/no-AI choice. |
| F12 | P1 | Many executable labs start by asking Claude Code to generate most of the solution; the deployment lab illustrates this at `js/modules-300.js:224-252`. | Add starter fixtures, inspectable expected outputs, one manual change, one injected failure, and a short unaided defense. |
| F13 | P1 | Local case practice is correctly labeled as non-executed, but the path can still conflate reading, paper analysis, implementation, and operating a system. | Give each mode explicit capabilities and separate evidence. Mock/tabletop completion must not imply a deployed, provider-tested system. |
| F14 | P1 | Mobile Orientation diagram has a 332px viewport and 848px scroll width. `css/styles.css:558` deliberately preserves a wide SVG canvas. | Preserve readable text, but add a compact mobile concept view and focused stages. Keep the full topology as an optional view. |
| F15 | P0 | `js/modules-builder.js:1879-1880` implies training loss shape alone establishes generalization or memorization. | Show training and held-out validation behavior together. A decreasing training loss is not evidence of good performance on unseen data. [S18] |
| F16 | P1 | Diagram narratives overgeneralize token vocabulary, context-position effects, MCP interoperability, and routing economics. Examples: `js/modules-100.js:385-392`, `modules-builder.js:578`. | Use labeled illustrative values, actual capability negotiation, uncertainty, and measured comparisons. Audit prose and quizzes with diagrams, not separately. |
| F17 | P1 | A2A and multimodal/realtime are mentioned, but have no dedicated assessed competency in the inventory. No Foundry-specific teaching was found in the scanned curriculum files. | Introduce bounded modern-AI units and an optional public Azure/Foundry specialization; do not call these topics wholly absent when they already have mentions. |
| F18 | P1 | Tests verify many content shapes and rendering contracts, but passing tests coexist with F03-F16. `tests/mastery-content.test.js` checks coverage/length/rubric presence. | Add semantic review and learner testing alongside automated checks. Schema validity cannot certify educational truth. |
| F19 | P1 | Builder content is generated from a separate source project; direct output edits would be lost. `js/modules-builder.js` header and July session record. | Correct the source, regenerate, and test rendered output; preserve provenance and cross-project approval boundaries. |
| F20 | P2 | `css/styles.css:29,354,437,550` uses broad `transition: all`. Sidebar headings can display encoded entities because extraction strips tags but does not decode entities before escaping, `js/app.js:68-76,107`. | Tighten transitions and render clean heading text during UX hardening. Do not let cosmetic repairs displace teaching corrections. |

The computed navigation styles did **not** establish a contrast failure; no such failure is claimed from a transient screenshot. Accessibility conformance remains a separate release gate.

### Preserve explicitly

Keep stable module IDs, separate academy storage, backups, visible persistence errors, existing scheduled-review behavior, keyboard support, reduced-motion handling, offline delivery, and honest self-assessment labels. Keep the PM Playbook, Builder Track, and capstone; improve them rather than creating duplicate replacements.

## 5. Technology modernization: verified changes versus proposed additions

### 5.1 Current provider facts

These are documentation observations, not live API or account-entitlement tests. Check them again when implementation starts.

| Area | November documentation observation | Curriculum decision |
|---|---|---|
| OpenAI catalogue | The current guide recommends GPT-6 Astra for complex reasoning/coding, GPT-6.1 Sol for a balance, and GPT-6 Luna for high-volume cost-sensitive work. [S01] | Update the current-landscape comparison. Do not silently relabel an older lab as newly executed. |
| OpenAI API direction | Responses is recommended for new projects; Chat Completions remains supported. [S02] | Teach one Responses-based reference client, tool-item lifecycle, structured output validation, and an explicit compatibility appendix. Do not falsely call Chat Completions retired. |
| OpenAI lifecycle | The October 14 notice names specific GPT-4o/4.1 snapshots for January 14, 2027 removal. Other families have separate notices. [S03] | Add a lifecycle exercise using exact IDs and platform notices, rather than a blanket "GPT-4 is broken" assertion. |
| Anthropic catalogue | The overview lists Fable 5.2, Opus 5.5, Sonnet 5.5, and Haiku 5.5, including model-specific IDs, pricing and effort/context information. [S04] | Refresh comparison cards; use the least costly model that meets the selected lab's measured requirements, not a prestige default. |
| Anthropic support | `claude-sonnet-5` remains active in the checked lifecycle table. Sonnet 4.5 has a November 30 retirement notice. [S06] | Existing Sonnet 5 examples are not automatically broken. Distinguish supported older pins from current recommendations. |
| Gemini lifecycle | Gemini 2.5 Pro/Flash access is restricted; the notice specifies December 1 API rerouting and changed billing. Flash-Lite has a separate status. [S07] | Replace the blanket "Gemini 2.5 remains supported" statement with exact model/platform guidance. Teach that an alias can change behavior and cost without an application-code change. |
| Gemini multimodal | Official lifecycle documentation lists Live and TTS models and November 17 dates for particular previews. [S07] | Build a versioned voice/realtime elective. Never generalize one preview's schedule to every audio model. |
| Coding-agent skills | Claude Code documents skills and custom-command convergence, the open Agent Skills format, and client-specific extensions. [S08-S09] | Teach portable procedural knowledge separately from a client's configuration and permission model. |
| MCP | The reviewed specification describes capability negotiation, tools/resources/prompts, client features, and consent boundaries. [S10] | Go beyond "JSON-RPC over a transport." Pin the taught revision; verify the latest stable revision at implementation time. |
| A2A | Official material distinguishes agent interoperability from MCP's tool/data integration. [S11] | Replace the brief acronym treatment with a contract/decision exercise, optional until the learner understands a single bounded agent. |
| Microsoft Foundry | Current documentation describes managed agent development, tracing, evaluation, identity, publishing, and monitoring. [S12] | Add an optional managed-runtime path using public/synthetic data. Explain prompt/hosted/voice distinctions and verify feature/platform status per lab. |

**Price policy:** do not scatter a new price list throughout the curriculum. Store dated price assumptions once and reference them in calculations. Include input/output, cached tokens, tool costs, reasoning usage where applicable, retries, storage, hosting, support, currency, and pricing tier. "Newest" is not equivalent to "best for this exercise."

### 5.2 Modern capabilities that need teachable outcomes

| Capability | Current treatment | Required learner evidence | Placement |
|---|---|---|---|
| Context engineering | Substantial but spread across prompting, RAG, agents | Allocate a context budget; choose what to retrieve, summarize, retain, and discard; test missing/conflicting evidence | Core |
| Evaluation engineering | Strong intent, weak universal heuristics | Versioned cases, holdout separation, per-slice results, calibrated graders, repeated trials, release decision | Core before autonomous agents |
| Durable agent execution | Loops/governance exist | Pause/resume, cancellation, timeout, checkpoint, idempotency, retry safety, approval expiry | Builder/production |
| Coding-agent supervision | Claude-heavy detail | Scope a change, inspect diff, run independent checks, catch a planted bug, explain code without assistant help | Core builder; vendor adapters |
| Multimodal document understanding | Mentions, no dedicated assessed path | Compare OCR/text extraction and image understanding; detect missing pages/tables; cite source regions | Specialization |
| Voice/realtime | Mentions | Reason about interruption, streaming, latency, consent, transcript errors, failure fallback | Specialization |
| Computer/browser agents | Not a dedicated competency | Separate observation from action; define approval boundaries; recover from changed UI in a sandbox | Advanced elective |
| Retrieval quality and authorization | RAG content exists | Compare lexical/vector/hybrid retrieval, reranking, freshness, permission filters, attribution, abstention | Core builder |
| Open-weight/local deployment | Fine-tuning build exists | Make a hardware/privacy/license/quality decision; measure latency and memory rather than assume local is cheaper | Specialization |
| Model adaptation | Builder fine-tuning exists | Separate prompt/RAG/SFT/LoRA objectives; avoid dataset leakage; judge on held-out tasks | Specialization |
| Agent interoperability | MCP strong, A2A brief | Choose API versus MCP versus A2A versus skill; demonstrate denied operation and schema/version mismatch | Intermediate/advanced |
| AI PM judgment | Eight modules exist | One connected product dossier with discovery, task success, economics, safety, rollout and operating review | Core PM path |
| Classical ML/data literacy | Not a coherent route | Explain classification versus generation, splits, precision/recall, leakage and uncertainty | Small shared bridge |
| Image/video generation | Landscape mentions | Evaluate provenance, consent, editing fidelity, rights and failure modes using supplied examples | Optional creative-AI overview |

Do not add all of these as large mandatory modules. The main route needs durable concepts. Tool-specific implementation and frontier topics belong in maintained adapters and electives.

## 6. Benchmark: what the best-fit external programs contribute

"Best" here means **best fit for a particular learning job**, not a claim that one course has proven superior outcomes. Public course descriptions establish scope and format; they do not prove completion, retention, or instructional effectiveness.

| Benchmark | Why it belongs in the comparison | Borrow | Do not copy |
|---|---|---|---|
| Anthropic AI Fluency [S13] | Accessible AI interaction with an assessment/certificate path | Judgment and safe use before platform mechanics; explicit exit check | Vendor-specific framing as the entire field; certificate language that implies independent competence |
| Hugging Face Agents Course [S14] | Foundations, frameworks, use-case assignments, evaluated final challenge, stated Python/LLM prerequisites | Clear onboarding and prerequisites; tangible final challenge; peer/community support | Leaderboard optimization as the only definition of agent quality; requiring Python on day one |
| Hugging Face LLM Course [S15] | Structured progression through Transformers, datasets, tokenizers, model adaptation and reasoning | A serious optional depth path; data work before training claims | Its Python/deep-learning prerequisites as beginner requirements for this academy |
| Stanford CS336, current offering [S16] | Implementation-heavy tokenizer/model/systems/data/alignment assignments with explicit prerequisites | Artifact rigor, experiments, profiling, held-out evidence, honest workload | Calling an API-building course equivalent to a research-model-building course; mandatory GPU costs |
| Full Stack Deep Learning LLM Bootcamp, Spring 2023 [S17] | Product-to-deployment perspective, LLMOps and language-interface UX | End-to-end systems thinking and product design | Treating a 2023 technology snapshot as current API guidance |
| DeepLearning.AI: Evaluating AI Agents [S19] | Component and end-to-end evaluation, tracing, code/model/human graders and experiments | A concrete trace-to-diagnosis-to-improvement learning loop | Merely watching an evaluation tutorial as proof of skill |
| Microsoft Learn / Foundry [S12] | Current managed-platform lifecycle and production controls | Public enterprise deployment, identity, traces, evals and release exercises | Letting portal instructions substitute for architecture understanding |
| IES learning practice guide [S20] | Evidence-informed retrieval, representation, study and explanation guidance | Retrieval practice, concrete/abstract connections, delayed checks, self-explanation | Claiming a particular unit length or review schedule is universally optimal |

### Selection policy for external resources

Every recommended link must have a role: prerequisite, alternate explanation, primary reference, exercise, or specialization. Give one primary and at most two alternatives per unit, with level, expected effort, access/cost limitations, last review, and the reason it is recommended.

Prefer primary technical documentation for API contracts, official course material for course structure, and empirical education research for learning claims. Do not reproduce third-party lessons. Link, summarize, attribute, and create original exercises.

**Recommended blend:** AI Fluency for entry, the academy's PM Playbook for decisions, Hugging Face/DeepLearning.AI for applied depth, Foundry for an optional managed deployment, and CS336 as a separate research-engineering ladder.

## 7. Users, outcomes, and non-goals

### 7.1 Primary persona

A technically curious PM/TPM or professional who uses AI but cannot yet confidently explain its behavior, build a small system, or distinguish a convincing demo from a dependable product.

Assumptions to validate:

- A short, concrete success is more motivating than a placement test at first entry.
- The learner wants both product judgment and hands-on capability, but not every advanced topic.
- The existing personal/offline architecture remains sufficient for the next release.
- Public visitors are secondary; there is no evidence yet for paid cohorts, institutional learning management, or enterprise identity.

### 7.2 Exit capabilities

| Stage | Learner can do independently |
|---|---|
| AI-literate | Explain a model's limits, provide context, identify unsupported claims, and choose a safe use case |
| AI product practitioner | Define a user problem, compare a non-AI baseline, create an evaluation, estimate cost per successful task, and recommend ship/hold |
| AI application builder | Build and test a small client/RAG/tool workflow, handle failures, and explain its data and permission boundaries |
| Production-minded builder | Instrument a system, run regression checks, plan/execute an approved staged release, and diagnose a failure |
| Specialist | Demonstrate a bounded skill in agents, multimodal, local models, adaptation, or managed deployment |

### 7.3 Out of scope

- An accredited degree or externally verified certification.
- Training a frontier model or requiring GPUs to finish the core.
- A mandatory paid subscription, API key, Azure subscription, or cloud account for foundational learning.
- A new hosted learning backend, social network, billing system, or AI tutor in the first release.
- Copying the networking application's files wholesale.
- Migrating all existing learner progress into new mastery claims.
- Automatically changing curriculum when a provider releases a model.
- Using workplace documents, customer records, or confidential project data.
- Implementing or publishing changes under this PRD without a separate approval.

## 8. Proposed learning architecture

### 8.1 A common spine with two outcomes

Use the existing public/synthetic MapleDesk example as a recurring system. Introduce only one ticket and one policy at first; add retrieval, tools, evaluation and production constraints as the learner becomes ready. Use a second fictional domain for transfer so the learner cannot pass by memorizing the story.

| Stage | Suggested content | Completion evidence | Planning estimate |
|---|---|---|---|
| Start here | What AI does, context versus memory, useful task versus risky task, verify an answer | Explain one unsupported answer and revise the request | 45-60 minutes |
| Foundations | Models/tokens, clear task contracts, data literacy, platform selection, basic evaluation | A task brief and a five-case comparison against a manual baseline | 5-7 hours |
| Product judgment | Discovery, evaluations, economics, risks, analytics, rollout and communication | One integrated product decision dossier | 8-12 additional hours |
| Builder bridge | Files, terminal, Python/JSON/HTTP, environment variables, Git, tests | A small local mock client with a failing/passing test | 6-10 additional hours for beginners |
| AI systems | Retrieval, tools, bounded workflows, context, agent supervision | A functioning synthetic assistant with evaluated failure paths | 12-18 additional hours |
| Production and capstone | Observability, reliability, deployment planning, migration, defense | Reproducible artifact, failure drill and changed requirement | 10-16 additional hours |
| Specializations | Multi-agent, MCP/A2A, multimodal, voice, local models, adaptation, Foundry | One bounded specialist project | 4-10 hours each; validate per project |

These are **planning hypotheses**, not measured course durations. Pilot timings must replace them. The PM and Builder paths share foundations; the PM path must not force a full coding setup before teaching basic evaluation. Advanced technical lessons may still require that bridge.

### 8.2 Sequencing rules

1. Establish a useful task and a baseline before choosing models or agents.
2. Introduce evaluation before adding autonomy.
3. Teach a deterministic workflow before an agent and a single agent before orchestration.
4. Teach retrieval failure and permission filtering before advanced RAG patterns.
5. Teach tool contracts and approval boundaries before MCP interoperability.
6. Teach dataset splits and held-out evaluation before fine-tuning.
7. Teach operations and uncertainty before claiming production readiness.

The learner can browse any reference page. Prerequisites inform recommendations and warnings, not arbitrary content locks.

## 9. Disposition of every current substantive module

Keep IDs for compatibility. Split the teaching beneath them into stable units; do not equate adding units with adding new mastery achievements.

Approximate word counts below describe existing Learn HTML only, including code text, not total learning effort.

| Existing ID | Words | Disposition | Required change or exit evidence |
|---|---:|---|---|
| `phase0-orientation` | 1,536 | Rebuild entry, preserve reference | Three beginner units; distinguish model/application/memory; remove model catalogue overload from first session |
| `phase1-prompting` | 554 | Rewrite | Testable instructions, ambiguity, examples, validation; replace guarantees and generic CoT advice |
| `phase2-platforms` | 252 | Expand selectively | Workflow scorecard; consumer product versus API versus managed runtime; data terms and access |
| `phase3-ai-from-code` | 955 | Split after bridge | Mock transport, request/response contract, current provider adapter, error/retry/usage test |
| `landscape-2026-ai-systems` | 506 | Convert to dated reference | Capability map with lifecycle and source state; not a mandatory obstacle before a first success |
| `zero-to-claude-companion` | 603 | Reposition | Optional external companion; add a self-contained tool-neutral developer bridge |
| `phase4-memory-rag` | 3,817 | Split into focused units | Ingest, lexical/vector/hybrid, chunking, retrieval evaluation, citations, authorization, abstention |
| `phase5-tool-use` | 4,579 | Restructure | Move repeated prompting material; teach schemas, validation, denied writes, idempotency and error states |
| `phase6-agents` | 4,760 | Split and bound | Workflow versus agent experiment; budgets, stops, permission, checkpoint and trace |
| `phase7-claude-code` | 5,042 | Core method plus adapter | Tool-neutral supervision first; maintained Claude-specific appendix; learner reviews a planted defect |
| `phase8-multi-agent` | 5,124 | Move to advanced elective | Single-agent baseline, typed handoffs, dependency graph, failure recovery, measured benefit |
| `phase9-mcp-skills` | 446 | Expand into distinct concepts | API/MCP/A2A/skill decision; capability/auth boundary; local read tool and denied action |
| `phase10-fullstack` | 293 | Expand substantially | Traceable request path, identity, budgets, timeouts, streaming/cancellation, rollout/rollback exercise |
| `phase11-product` | 383 | Connect to PM dossier | Tenancy, entitlements, consent, cost controls, support ownership, no-AI fallback |
| `phase12-expert` | 341 | Replace summary with review clinic | Diagnose unfamiliar designs; distinguish measured findings, assumptions and unresolved risks |
| `phase13-capstone` | 6,452 | Retain, stage by milestones | Local mock baseline, retrieval, evals, bounded tools, operations, changed task and defense |
| `pm-evals` | 869 | Correct and deepen | Task slices, holdout, class imbalance, calibration, uncertainty, false approvals and release gates |
| `pm-unit-economics` | 833 | Retain, remove universal defaults | Cost per successful task; sensitivity to retries, quality, human review, caches and infra |
| `pm-build-buy-wait` | 624 | Convert to decision case | Evidence for differentiation, reversibility, procurement/data boundaries; accept no-AI/wait |
| `pm-discovery-ship` | 729 | Connect to longitudinal project | User evidence, baseline, prototype, safe shadow mode, release gates; remove fixed timelines |
| `pm-trust-safety` | 905 | Strengthen operational boundary | Threat/abuse scenarios, residual risks, named controls, change-triggered review |
| `pm-analytics` | 581 | Retain with privacy and validity | Events map to a decision; distinguish edits from correctness; bias/consent/retention |
| `pm-roadmap` | 593 | Retain as scenario exercise | Capability uncertainty, reversible investment, explicit review triggers and kill criteria |
| `pm-comms` | 771 | Add assessed defense | Short recommendation with denominator, uncertainty, alternatives, cost/risk and decision request |
| `builder-mcp-assistant` | 429 | Preserve advanced build | Safe discovery, authorization, denied write, timeout, reproducible trace |
| `builder-multi-agent` | 372 | Preserve elective | Compare against single-agent baseline; remove fixed role/model superiority claims |
| `builder-eval-pipeline` | 388 | Promote shared core project | Keep planted-regression exercise; add locked holdout, judge calibration and repeated trials |
| `builder-rag-guardrails` | 397 | Preserve, clarify limits | Distinguish instruction formatting from authorization; test false acceptance and false refusal |
| `builder-audit-agent` | 353 | Preserve elective | Minimal/redacted audit events; record concise rationale, never hidden reasoning or raw sensitive content |
| `builder-finetune` | 376 | Preserve specialist path | Correct loss interpretation; held-out evaluation, dataset licensing, leakage, GPU cost and comparison baseline |
| `builder-knowledge-graph` | 332 | Preserve specialist path | Compare graph query versus search/RAG; test entity resolution, provenance and extraction errors |

The 10 diagram-only entries remain review/reference activities, excluded from the mastery denominator. Each should link to the lesson that teaches it and avoid duplicating a second, conflicting explanation.

## 10. Learning experience and visual design requirements

### 10.1 Primary navigation

| Destination | Primary job | First-use state |
|---|---|---|
| Path | Start or resume the next appropriate unit | "Start with what AI can and cannot do"; optional placement and path choice |
| Lab | Practice a concept or continue a project | One recommended no-account exercise with a clear result |
| Progress | See learned capabilities, saved work and due review | Explain what evidence will appear; no intimidating wall of zeros |

Search, sources, settings and backup remain available as secondary utilities. Practice becomes a useful section of Lab and scheduled review remains visible on Path. Preserve old URLs through explicit routing aliases.

Desktop may show a collapsible curriculum tree; mobile should not open a 41-entry menu as the default next action. Use one dominant action in the learning area, with optional reference access.

### 10.2 Lesson contract

The visible sequence is **Learn -> Try -> Check**.

- **Learn:** one question, plain-language explanation, concrete example, one helpful visual, optional technical detail.
- **Try:** predict or change one thing, see the result, receive misconception-specific feedback.
- **Check:** answer a changed-condition question and explain why; then show the next unit and optional practice.

Transfer projects and review stay real, but do not need to be permanent competing tabs on the first lesson. The backend evidence distinctions must remain intact when the UI is simplified.

### 10.3 Professional visual direction

Evolve the existing Model Lab Notebook rather than adding a fashionable theme. Use a quiet reading surface, consistent system typography, clear heading hierarchy, restrained accent color, and illustrations that belong to the concept.

Acceptance requirements:

- Beginner prose uses a readable 16px-or-larger default and comfortable line spacing; cap reading line length around 65-80 characters where practical.
- Labels and glossary definitions explain jargon when first needed, not in a distant reference page.
- Show outcomes in learner language: "Explain why this answer needs a source," not a multi-clause competency statement.
- Prefer topic titles over Phase 0 / L100 / L200 as the dominant heading; retain level metadata secondarily.
- One outline, not competing sidebar and in-lesson outlines by default.
- Read/try/check state is visible without a large evidence dashboard before the lesson.
- A keyboard-visible focus indicator is intentional, not mistaken for visual noise.
- Text does not render literal `&amp;` in navigation.
- No added decorative autoplay; animations must explain a transition.
- Preserve fonts unless learner testing shows a reason to change them.

### 10.4 Resume and recovery

Resume is a contract, not simply "open the last module."

Required state: path, module, unit, step, current attempt, draft, pending review and relevant content version. If reading is complete but Try is not, Continue returns to Try. Changing path does not erase the other path's progress.

Test interruption after reading, mid-exercise, after a failed check, during a draft, after a storage rejection, and after an offline update. Back/Forward, deep links, and reload must agree with the visible state.

## 11. Authored unit standard and an example

### 11.1 Required authoring fields

Each unit needs:

- Stable ID, parent module, prerequisites and estimated time labeled as an estimate.
- One observable outcome and the misconception it targets.
- Plain-language explanation; a concrete example; optional deeper reference.
- A visual with a specific explanatory purpose and an accessible text equivalent.
- A prediction or manipulation, expected result and reason.
- At least one changed-condition check, not a paraphrase of the example.
- Feedback for each plausible misconception.
- A teach-back prompt and a concise scoring guide.
- Source/provenance, content version, review owner and review date.
- Lab mode, prerequisites, data boundary, cost category and cleanup when relevant.

Aim initially for 8-12 minutes per unit, but split only when the concept supports it. A useful explanation is not improved by forcing exactly three units into every module.

### 11.2 Example: "Why did my assistant answer without evidence?"

**Outcome:** identify whether the first failure was missing retrieval evidence or unsupported generation.

**Learn:** a model receives a question plus whatever context the application supplies. A retrieval system searches documents and passes selected passages into that context. A correct-looking sentence is not proof the right passage was retrieved.

**Concrete example:** a fictional library allows a 14-day loan. The system retrieves a page about opening hours and confidently says books can be kept for 30 days.

**Visual:** Question -> Search -> Selected passage -> Answer. Show document IDs beside passages. Highlight the first incorrect stage, not just the final answer.

**Try:** choose between improving retrieval, changing answer formatting, or adding more agent roles. Reveal the retrieved passage before scoring. The best first action is to repair evidence selection; explain why formatting does not repair missing evidence.

**Changed condition:** now the correct 14-day passage is retrieved but the answer still says 30. The learner must move the diagnosis to generation/grounding, not repeat the prior answer.

**Teach back:** "What evidence would you inspect before changing the model?"

**Check rubric:** correctly distinguishes the two failures, cites the inspected evidence, proposes a relevant test, and names one remaining uncertainty.

**Lab extension:** run a supplied local retrieval fixture; alter one document and explain why a stale index gives the old answer.

This unit teaches a reusable diagnostic model. It is more valuable than adding another list of RAG acronyms.

## 12. Diagram and animation upgrade specification

### 12.1 Observed state

All 39 instances rendered at both audited widths without page-level overflow or browser page errors. Existing contracts cover builders, IDs, step parity, deterministic output and selected geometry. These are valuable.

The mobile design preserves text by retaining a wide canvas. In the first diagram, the learner sees only part of the nested stack and must scroll horizontally to find important labels. That is a usability tradeoff, not evidence that the rendering is broken.

### 12.2 Treatment for every renderer type

| Type | Required semantic/presentation change |
|---|---|
| `ai-stack` | Label as a simplified map, not a universal taxonomy. Avoid implying all generative models are deep neural networks or all language models are only text-capable. Use a compact mobile tree. |
| `tokenisation` | Name a tokenizer or mark tokens illustrative. Explain that characters-per-token varies by language, content and model; do not present invented IDs as measured output. |
| `next-token` | Mark probabilities and vocabulary as illustrative; remove inconsistent fixed vocabulary counts. If a temperature control exists, show the actual recalculated distribution. |
| `rag-pipeline` | Separate indexing from querying. Show lexical/hybrid alternatives, evidence filtering, retrieval failure and abstention; "retrieve then generate" does not guarantee truth. |
| `embedding-space` | Explain that a 2D projection is illustrative and cannot preserve all high-dimensional distances. Show a near-but-wrong retrieval. |
| `tool-calling` | Make model proposal, application validation, authorization, execution and returned result distinct. Add denial, timeout and malformed-output paths. |
| `agent-loop` | Show budgets, terminal states and human approval; do not imply the loop ends only when the model decides. Label reasoning as conceptual, not a hidden trace to extract. |
| `claude-code-workflow` | Show human diff review and independent verification; separate permission policy from tool capability. Keep client-specific details dated. |
| `multi-agent` | Use a dependency graph: research before writing where needed, genuinely independent work in parallel. Compare with a single-agent baseline. |
| `mcp-architecture` | Host/client/server roles, capability/version negotiation and auth boundaries. Replace "any client can use any server" with compatible supported capabilities. |
| `context-decay` | Present a possible position-sensitivity pattern, not a universal curve or a memory guarantee. Add model/task/context caveats and an experiment. |
| `fullstack-deploy` | Separate runtime flow from release pipeline; include identity, private data/secret boundaries, telemetry and rollback. |
| `capstone-architecture` | Add document permissions, citation provenance, no-evidence answer, data lifecycle and failure observation. |
| `phase-mapping` | Map to actual prerequisites and artifacts; avoid implying completion of headings establishes integration competence. |
| `b-pipeline` | Distinguish startup discovery from runtime invocation; show capability refresh, unavailable tool and denied access. |
| `b-timeline` | Use a sequence diagram with request/result IDs, multiple calls, cancellation and a terminal condition beyond successful tool use. |
| `b-bars` | Replace fixed Haiku/Sonnet superiority and illustrative dollar savings with labeled assumptions or real measured task results. Include quality and reviewer cost. |
| `b-layers` | Depict mitigations, not guaranteed attack blockers. Delimiters/classifiers are not authorization boundaries; show residual risk and denied side effects. |
| `b-curves` | Plot training and validation loss plus held-out task results. Correct the inference that falling training loss proves generalization. |
| `b-graph` | Show extraction uncertainty, entity-resolution errors and source provenance; contrast a graph path with evidence that the underlying edges are correct. |

Builder renderer instances must be traced back to their generated source before changes.

### 12.3 Interaction contract

Every interactive visual must answer "what changes when I press this?"

- One clear step action; previous/reset remain secondary.
- Show the current cause and observed consequence together.
- No control whose states render equivalent information.
- Keep topology stable during a flow unless the lesson specifically changes topology.
- Distinguish data, control, approval and failure paths with labels and shape/stroke as well as color.
- Pause/step and reduced-motion modes must preserve the same educational meaning.
- A mobile summary should expose the whole conceptual relationship; full-width technical detail can remain pannable.
- Accessible transcript and keyboard controls must explain the same states.
- Numerical examples need units, assumptions, data provenance and a reproducible calculation where appropriate.

Release review requires a per-instance checklist: narrative, source, edges, labels, states, failure scenario, mobile interpretation, keyboard path, reduced motion and text alternative. Automated screenshot/geometry checks supplement, not replace, subject-matter review.

## 13. Assessment and mastery

### 13.1 Keep the engine; improve what it measures

The current 80% quiz gate, critical-question policy, transfer rubric and review scheduler are useful mechanisms. They are product choices, not validated proof of mastery.

Use four assessment layers:

| Layer | Purpose | Evidence |
|---|---|---|
| Retrieval | Recall the central concept | Short varied questions; explanations for plausible wrong answers |
| Diagnosis | Distinguish competing causes | Trace, retrieved passage, cost breakdown or changed condition |
| Construction | Apply the idea | Inspectable artifact, local test, measurement or decision memo |
| Transfer and retention | Use it later in a new situation | Delayed task with changed domain/constraints and a concise defense |

Do not ask "Which brand is best?" when the objective is model selection. Present task results, costs, privacy constraints and latency, then ask for a decision.

### 13.2 Rubric

Retain correctness, evidence, judgment and explanation. Define anchored descriptions:

- **0:** absent or materially incorrect.
- **1:** follows a supplied example but cannot explain or verify it.
- **2:** handles the familiar task with partial evidence and limited diagnosis.
- **3:** handles the changed task, produces relevant evidence and explains tradeoffs.
- **4:** diagnoses an unfamiliar failure, compares alternatives and identifies limits.

A passing artifact requires at least 3 in each essential dimension, with no safety-critical failure. Do not average a zero in an essential safety/correctness dimension into a pass. These thresholds are proposed and must be calibrated.

### 13.3 AI-assistance policy

Teach with AI, assess understanding independently:

- Allowed: explanation, hints, scaffolding, debugging help and clearly attributed generation during practice.
- Required: learner explains the changed code/design, predicts a failure, and completes a small changed task without generated answers.
- Recorded: assistance level, artifact version, test/measurement evidence and reviewer provenance.
- Not claimed: identity-verified assessment or accredited certification from a local browser application.

Public answer code cannot provide cheating resistance. The goal is honest personal learning, not an examination-security platform.

### 13.4 Retention and evaluation validity

Preserve the existing 1/3/7/21/60-day scheduling initially. Validate the workload and benefit instead of calling the schedule scientifically optimal.

Use alternate question/scenario forms on review. Measure discrimination and common errors before increasing difficulty. For model judges, inspect false approvals and disagreements by case type; overall agreement alone can hide a dangerous minority class.

## 14. Labs, portfolios, and reproducibility

### 14.1 Three explicit execution modes

| Mode | Purpose | Can claim | Cannot claim |
|---|---|---|---|
| Explore / tabletop | Understand a mechanism without setup | Completed explanation/prediction/case analysis | Code or provider compatibility |
| Local build | Build with deterministic fixtures or a supported local model | Executed local tests and inspected outputs | Hosted provider quality or production readiness |
| Connected build | Optional approved API/cloud execution | Results for the recorded model/version/environment/data | General superiority or future compatibility |

The core must remain completable at zero provider cost. Connected labs require visible data destination, account requirements, expected cost range, maximum budget, stop conditions and cleanup.

### 14.2 Lab package contract

Every release-ready executable lab includes:

- Learning outcome and prerequisites.
- Supported operating system/runtime; Windows/PowerShell-first instructions for the primary learner.
- Starter files and pinned dependencies or lockfile, not only a prompt that generates an unknown codebase.
- Synthetic data fixture with license/provenance.
- Expected successful output, at least one failure output and explanation.
- A deterministic local test command that fails when the taught property is broken.
- Optional provider smoke test, explicitly separate from local tests.
- Model/API/SDK version, verification level, date and environment.
- Secret handling, spend limit, network destination and data restrictions.
- Cleanup that names the exact resources/files created; never broad deletion.
- A learner modification and defense prompt.

Suggested first six runnable exercises: task-contract validator; mock API retry client; retrieval with a missing document; bounded tool with denied write; eval suite catching a planted regression; instrumented assistant with an injected provider timeout.

### 14.3 Portfolio progression

**PM dossier:** user evidence -> non-AI baseline -> task definition -> evaluation -> unit economics -> risk register -> staged launch -> operating review -> executive decision.

**Builder dossier:** mock client -> retrieval -> tool contract -> workflow/agent comparison -> evaluation pipeline -> observable local app -> optional connected deployment -> failure recovery.

**Capstone defense:** give the learner a changed requirement, remove a useful document, introduce one provider failure, and ask them to decide whether to ship. They must show the relevant evidence and explain what remains unknown.

The seven existing Builder projects remain optional depth, not seven mandatory near-duplicate products.

## 15. Functional requirements and acceptance criteria

| ID | Priority | Requirement | Acceptance criterion |
|---|---|---|---|
| FR01 | P0 | Beginner start | Fresh learner can start an explanatory, no-account lesson without answering a diagnostic |
| FR02 | P0 | Correct learning order | Explanation precedes the dependent case/prediction/transfer in all migrated units; checked in rendered DOM |
| FR03 | P1 | Task-based navigation | Path/Lab/Progress work on desktop/mobile, with useful empty states and old-route aliases |
| FR04 | P1 | Exact resume | All interruption cases in section 10.4 return to the correct unfinished unit/step without data loss |
| FR05 | P1 | Authored unit schema | Every migrated unit has outcome, misconception, explanation, exercise, feedback, changed check and provenance |
| FR06 | P0 | Claim correction | F03-F06, F09-F10 and F15 have reviewed corrections across lesson, quiz, flashcards, diagrams, labs and generated source |
| FR07 | P1 | Reference separation | Current catalogue and advanced details remain searchable without interrupting the beginner route |
| FR08 | P1 | Learning path options | PM and Builder routes share fundamentals; basic evaluation is available without a coding prerequisite |
| FR09 | P1 | Diagram learning contract | Every retained instance has the review record in section 12; no nonfunctional controls |
| FR10 | P1 | Equivalent mobile explanation | At 390px, the introductory visual communicates its central relationship without lateral search for essential labels |
| FR11 | P1 | Reproducible labs | The six core lab packages run from a clean supported environment with no secret or paid request |
| FR12 | P1 | Connected-lab boundary | No provider request starts without explicit choice; mode, destination, budget and verification status are visible |
| FR13 | P1 | Assessment validity | Every core outcome maps to a taught concept and changed-condition check; no brand trivia or unsupported universal threshold as required knowledge |
| FR14 | P1 | Honest mastery | Reading, self-assessed work, reviewer-reported work, local execution and connected execution remain distinguishable |
| FR15 | P1 | Integrated portfolio | Learner can export the PM or Builder dossier with evidence/version/assistance labels, without credentials or raw sensitive content |
| FR16 | P1 | Freshness state | Overdue model/API/pricing facts show a review-needed state; unexecuted labs cannot display an executed badge |
| FR17 | P1 | Progress migration | Existing IDs/backups remain readable; old evidence is retained and marked for recheck only when the competency materially changed |
| FR18 | P2 | Specialization entry | Each elective states prerequisites, cost, outcome and its place outside the core |
| FR19 | P2 | Editorial operations | Source and deprecation changes create review work; they do not silently rewrite teaching or deploy it |
| FR20 | P1 | Reviewable publication | Local approval, content/UX verification and publication approval are separate recorded gates |

## 16. Non-functional requirements

| Area | Proposed release requirement |
|---|---|
| Accessibility | Target WCAG 2.2 AA with manual keyboard and screen-reader testing, reflow/zoom, contrast, labels, focus, non-color cues, motion and non-drag alternatives [S21] |
| Responsive learning | Test 320, 390, 768 and 1440px; no page-level horizontal overflow; essential concept understanding cannot depend on a wide hidden label |
| Reliability | Keep visible storage failure, recoverable drafts, import validation, scoped caches and offline behavior; test old/new cache upgrade and multi-tab behavior |
| Performance | Preserve dependency-light static delivery. Establish baseline on a declared device/network before setting release budgets; proposed LCP <=2.5s, INP <=200ms and CLS <=0.1 are targets, not observed field results |
| Privacy | Local-first progress, no default third-party analytics, no credentials in exports, minimal telemetry and explicit connected-mode consent |
| Maintainability | Separate durable concept text from volatile provider adapters/facts; avoid a runtime framework migration without a demonstrated requirement |
| Compatibility | Microsoft Edge is the required local verification browser. Declare additional browser support only after testing it; do not infer it from one engine |
| Safety | Synthetic data, constrained tools, clear side effects, bounded budgets, no automatic cloud deployment from a lesson |
| Provenance | Every diagram, exercise and volatile claim identifies source or states that it is illustrative |
| Publication | No push, deployment, archive, progress reset or provider purchase implied by content approval |

The interface review used the current Web Interface Guidelines [S22] as a checklist. Its style preferences do not override the academy's tested design choices or substitute for accessibility testing.

## 17. Architecture, migration, and maintenance

### 17.1 Keep the static application

Continue with static HTML/CSS/JavaScript, a versioned content layer, local progress, export/import and scoped service workers. The present need is better content and learning orchestration, not a server.

Conceptual separation:

- **Curriculum:** modules, units, prerequisites, outcomes and assessment mappings.
- **Learning state:** unit/step resume and draft state.
- **Evidence:** quiz attempts, artifacts, provenance and content versions.
- **Provider registry:** IDs, capabilities, lifecycle, prices and source dates.
- **Lab manifests:** fixtures, versions, commands, mode, cost and verification.
- **Diagram models:** educational states, relationships, accessibility descriptions.

This is a responsibility map, not a requirement to create six new frameworks.

### 17.2 Provider/claim record

A volatile fact needs: claim ID, provider/platform, model ID or API contract, value/units, status, primary source, checked date, next review, reviewer, affected lesson/quiz/lab IDs and verification level.

Verification levels:

1. Documentation reviewed.
2. Static/syntax checked.
3. Executed locally with fixture.
4. Executed against specified provider.
5. Reviewed with a learner or subject-matter expert.

These are separate dimensions, not a single badge that becomes "verified" after opening a web page.

### 17.3 Change propagation

When a model, API, price or teaching claim changes, inspect its lesson, quiz, explanation, flashcard, diagram, lab, source registry and generated output. The current temperature and training-curve inconsistencies show why editing only one surface is insufficient.

For Builder content, the recorded source of truth is `personal\AI_Engineer_Builds\site\js\modules.js`; regeneration uses that project's exporter. Load its local instructions and Spec Kit constitution before future implementation. Do not hand-edit `js\modules-builder.js`.

### 17.4 Progress migration

Maintain a versioned mapping from old module/section links to new units. Back up before migration; make migration idempotent and recoverable. Preserve historical attempts and provenance.

If a lesson gains a materially different outcome, label the new check as needed rather than silently promoting or invalidating all prior work. Learners can inspect what changed and why.

### 17.5 Operating cadence

| Cadence/trigger | Work | Owner role |
|---|---|---|
| Monthly | Model/API/SDK/pricing/lifecycle and external-link review | Technical curriculum owner |
| Before connected-lab release | Execute exact reference environment and record cost/results | Lab maintainer |
| Quarterly | Learning outcomes, question quality, curriculum overlap, benchmark/resource review | Education lead + product owner |
| On retirement/security/product change | Triage affected claims and labs; mark outdated immediately where necessary | Technical owner |
| After pilot/cohort | Analyze drop-off, misconceptions, transfer performance and burden | Product/education lead |

Automated link or lifecycle checks should file review candidates. A human accepts semantic changes and publication. Use a lightweight ownership table initially; do not build a content-management platform to avoid doing editorial work.

## 18. Success metrics and evaluation plan

**North-star outcome:** proportion of participating learners who independently complete a changed task and defend the result after a delay.

All targets below are proposed hypotheses. Current baselines are unknown.

| Metric | Proposed target | Measurement |
|---|---|---|
| First useful action | At least 4 of 5 formative participants start the correct lesson without assistance within 60 seconds | Moderated first-use task |
| First-hour comprehension | At least 4 of 5 distinguish model, context and external evidence in a new example | Short unaided teach-back |
| Navigation/resume | No observed loss or wrong-step continuation in the defined interruption matrix | Automated cases plus moderated journey |
| Core local lab reliability | All six reference labs pass in the declared clean environment; at least 4 of 5 target learners finish the first lab with no more than one setup intervention | Maintainer run + learner pilot |
| Immediate transfer | At least 80% of pilot participants achieve level 3 on essential rubric dimensions | Blind rubric scoring where practical |
| Delayed transfer | At least 70% meet the same criterion after 14 days | Alternate scenario; report counts and uncertainty |
| Judgment calibration | Fewer confident incorrect answers after instruction | Confidence recorded before feedback; analyze by misconception |
| Freshness | No untriaged retired-model reference in core executable labs; all volatile core facts have owner/date/source | Registry and editorial report |
| Accessibility | No unresolved critical task blocker in tested keyboard/screen-reader paths | Manual evidence; not merely an automated score |
| Workload | Learners can finish the selected path within revised pilot-based estimates | Actual time by stage, not time-on-page alone |

Five learners can reveal major usability failures; they cannot establish population-level effectiveness. Begin with 5-8 formative participants spanning novice PM and novice builder needs, then use a larger follow-up sample for learning claims. Report denominators, withdrawals, assistance and uncertainty.

Do not optimize streaks or quiz pass rate as primary success. A high pass rate can mean easy questions. A long session can mean confusion.

### Pilot design

Compare the current and redesigned first-hour experiences using matched tasks or counterbalanced variants. Avoid showing the same answer set twice. Collect navigation observations, assistance count, explanation quality, changed-task performance and a delayed check.

Stop expansion if the new path increases setup burden, if learners cannot explain what their generated code does, or if evidence labels remain confusing.

## 19. Prioritized delivery plan, dependencies, and resources

No reach numbers or engineering estimates are available, so a numeric RICE ranking would create false precision. Use impact, learner risk, dependency and effort ranges instead.

| Epic | Priority | Scope | Depends on | Exit gate |
|---|---|---|---|---|
| E0: Teaching truth and freshness | P0 | Correct F03-F06/F09-F10/F15, provider state, generated-source corrections | Source review | Consistent claims across surfaces; no claim of unexecuted provider success |
| E1: Beginner vertical slice | P0/P1 | Start here; Orientation, Prompting, Platforms, API bridge, RAG introduction, Evals; three-step units and exact resume | Approved learner/outcome brief | First-use and changed-task pilot meets agreed gate |
| E2: Assessment and lab spine | P1 | Six local labs, misconception checks, evidence labels and integrated portfolio | E0; unit contract from E1 | Clean-environment execution and learner explanation |
| E3: Full core migration | P1 | Remaining core modules, routes, progress migration, authored unit review | E1 pilot; E2 contracts | Full curriculum mapping, migration and accessibility review |
| E4: Diagram system quality | P1 | Semantic repairs, mobile concept views, per-instance records | E0; E1 visual pattern | All 39 retained instances reviewed; changed inventory reconciled |
| E5: Modern specialization | P2 | Multimodal/voice, durable agents, MCP/A2A, local/adaptation, optional Foundry | Relevant core outcomes | One assessed artifact per elective; costs and prerequisites explicit |
| E6: Editorial operations | P1/P2 | Registry, review queue, recurring ownership, learner feedback loop | E0 records | Overdue content is visible and handled, not just dated |

### Planning envelope

An illustrative staffing model is one product/technical owner plus part-time education/editorial and design/accessibility review. A credible full release needs independent subject-matter review and actual learners even if AI assists drafting and implementation.

For that model, plan **roughly 8-12 weeks** for corrections, vertical slice, pilot and core rollout; specialist expansion follows readiness, not a launch-date promise. For a solo spare-time effort, expect a longer calendar. These are not estimates from implementation decomposition.

Suggested allocation: approximately 40% curriculum/assessment, 25% labs and verification, 20% learning UX/accessibility, 15% maintenance and release work. Re-estimate after the first slice. Reserve time for pilot-driven revision.

Do not approve an API/GPU spend number by implication. Start at zero provider spend; connected-lab budgets are separate, per-lab decisions. Price labor from actual available roles/rates rather than an invented project total.

### Review gates

1. **G0 - Product:** approve audience, promise, core/electives, no-account route and scope.
2. **G1 - Content:** approve corrections and one exemplar unit, assessment and diagram.
3. **G2 - Learning:** observe first-use and changed-task pilot; revise before scaling.
4. **G3 - Engineering:** approve progress migration, reproducible labs, offline/recovery and accessibility evidence.
5. **G4 - Publication:** explicit commit/push/deploy approval; separate provider/cloud execution approval.
6. **G5 - Outcomes:** delayed-transfer review before claiming professional/world-class learning effectiveness.

## 20. Risks, tradeoffs, and decisions for review

| Risk | Mitigation |
|---|---|
| More modules recreate the original complexity | Protect the common spine; put advanced topics in opt-in specialization |
| Short units become shallow fragments | Require a coherent outcome and changed task; preserve deeper reference |
| AI-written content sounds authoritative but is false | Primary sources, claim review, counterexamples and independent subject-matter checks |
| Coding assistants produce impressive artifacts without learning | Manual modification, injected failure, unaided explanation and changed requirement |
| Model churn makes the course stale | Separate concepts from provider adapters and operationalize review dates |
| Tests validate the schema rather than teaching | Semantic review and learner evidence are independent release gates |
| Simplification loses existing mastery/progress capabilities | Preserve data model and migration evidence while simplifying presentation |
| More telemetry compromises privacy | Local/manual pilot collection first; consented minimal events if later needed |
| External courses become a distracting link directory | A small curated set with a defined role and prerequisite level |
| Generated Builder edits drift | Source-first correction and regeneration |
| Public audience needs differ from the primary learner | Validate personas before adding accounts, cohorts or monetization |

Recommended defaults pending approval:

- Prioritize AI product judgment plus practical application-building, not research training.
- Keep the static/local-first architecture.
- Pilot the first six-module slice rather than rebuild all modules immediately.
- Keep platform-independent concepts central; add current provider adapters.
- Offer Foundry as an optional specialization, not a prerequisite.
- Require human learning validation before stronger educational claims.

**Reusable PM lesson:** define the capability a learner must demonstrate, then work backward to the lesson, exercise and evidence. Starting from a list of new technologies produces a catalogue; starting from observable capability produces an education.

## 21. Source register

Sources were retrieved for this audit. Dynamic pages may change; verify exact model IDs, prices, feature availability and lifecycle dates again before implementation. Source review is not provider execution. Older resources are explicitly identified as structural/educational references.

| ID | Primary source | Used for |
|---|---|---|
| S01 | [OpenAI model catalogue](https://developers.openai.com/api/docs/models) | Current recommended model families |
| S02 | [OpenAI migration to Responses](https://developers.openai.com/api/docs/guides/migrate-to-responses) | New-project API recommendation and continued Chat Completions support |
| S03 | [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations) | Exact model/snapshot lifecycle notices |
| S04 | [Anthropic model overview](https://platform.claude.com/docs/en/models/overview) | Current model lineup, IDs, capability/pricing distinctions |
| S05 | [OpenAI reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices) | Model-specific prompting; why universal step-by-step advice is inappropriate; legacy examples not used as current catalogue |
| S06 | [Anthropic deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) | Active versus deprecated/retired; platform-specific schedules |
| S07 | [Gemini deprecations](https://aistudio.google.com/docs/deprecations) | 2.5 access/rerouting, audio previews and model-specific lifecycle |
| S08 | [Claude Code skills](https://code.claude.com/docs/en/skills) | Skills, custom commands, portable format and extensions |
| S09 | [Agent Skills overview](https://agentskills.io/home) | Progressive loading and reusable procedural knowledge |
| S10 | [MCP 2025-11-25 specification](https://modelcontextprotocol.io/specification/2025-11-25) | Reviewed protocol revision, capabilities and consent; not asserted to be newest revision |
| S11 | [A2A official documentation](https://a2a-protocol.org/latest/) | Agent interoperability and distinction from MCP |
| S12 | [Agents in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/agents/overview), [hosted-agent evaluation](https://learn.microsoft.com/azure/foundry/observability/quickstarts/quickstart-evaluate-hosted-agent) | Managed lifecycle, identity, tracing, evaluation; overview fetched, quickstart searched |
| S13 | [Anthropic AI Fluency](https://anthropic.skilljar.com/ai-fluency-framework-foundations) | Accessible interaction skills and final assessment |
| S14 | [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction) | Prerequisites, structured units, assignments and final challenge |
| S15 | [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/chapter1/1) | Python prerequisites and advanced model/data learning path |
| S16 | [Stanford CS336 current offering](https://cs336.stanford.edu/), [archived Spring 2025](https://cs336.stanford.edu/spring2025/) | Implementation depth, prerequisites and assessed artifacts; archived version distinguished |
| S17 | [FSDL LLM Bootcamp, Spring 2023](https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/) | Historical systems/UX teaching structure, not current API authority |
| S18 | [Google ML Crash Course: overfitting](https://developers.google.com/machine-learning/crash-course/overfitting/overfitting) | Generalization and held-out evaluation |
| S19 | [DeepLearning.AI: Evaluating AI Agents](https://www.deeplearning.ai/courses/evaluating-ai-agents) | Component evaluation, traces, graders and experiments |
| S20 | [IES: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) | Retrieval, representations and explanatory questions; evidence strengths vary |
| S21 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Accessibility target and manual-review scope |
| S22 | [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) | Interface review checklist |
| S23 | [Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents) | Simplest-system baseline; page explicitly cautions that older tooling has changed |
| L01 | [September dual-academy PRD](../../docs/DUAL_ACADEMY_IMPROVEMENT_PRD_2026-09-14.md) | Prior implemented work, preserved capabilities and historical limitations |
| L02 | [Academy session context](../SESSION_CONTEXT.md) | Release baseline and generated Builder source provenance |
| L03 | Azure networking academy audit chat, history ID `1dabeda6-e01c-4664-8a28-d1ef2a57c163` | Beginner-first brief, worked-case complaint, simplification and diagram direction |
| L04 | [Browser evidence](audit-evidence-2026-11-10/browser-evidence.json) and inspected code locations in section 4 | Current observed behavior, distinct from prior chat claims |

## 22. Approval-stage acceptance checklist

This checklist records the original audit delivery. Section 23 records subsequent
approval and implementation; it supersedes the earlier "unchanged" status.

- [x] Existing academy identified and understood rather than replaced speculatively.
- [x] Networking audit conversation used as a guideline, with current-site findings kept separate.
- [x] All substantive modules have a proposed disposition.
- [x] All diagram renderer types have a proposed treatment; rendering checked across the inventory.
- [x] Current provider/protocol/platform changes grounded in primary sources, with support/migration caveats.
- [x] Education benchmarks translated into actionable design choices.
- [x] Functional requirements, lab contracts, assessment rules, metrics, dependencies, ownership and gates specified.
- [x] Recommendation saved locally; academy application and curriculum source unchanged.
- [ ] Product owner approves the direction and first implementation slice.
- [ ] Subject-matter and education reviewers calibrate the exemplar and rubric.
- [ ] Real learners validate the first-hour and delayed-transfer experience.
- [ ] Future implementation completes the project's Spec Kit and publication gates.

**Bottom line:** the academy does not need to become bigger to become better. It needs a coherent beginner journey, accurate and maintained explanations, practice that can be reproduced, and assessment that proves learners can think and act beyond the tutorial.

## 23. Local implementation record - November 11

Historical first-phase record. Section 24 is the current implementation state.

The user approved the direction and requested implementation. The first release
implements the recommended E0/E1 slice, not the entire roadmap beyond G2.

| Area | Disposition |
|---|---|
| Beginner entry and navigation | Implemented: Start here, optional placement, Path/Lab/Progress with existing reference routes retained |
| Authored pilot | Implemented: two units each in Orientation, Prompting, Platforms, API foundations, RAG and Evals |
| Teaching sequence | Implemented: explanation and compact trace before Try and changed-condition Check; original casework moved after reference explanation |
| Progress | Implemented: exact unit/stage resume, drafts, export compatibility, failed-save recovery, version recheck and independent-unit concurrent-save protection |
| Evidence honesty | Implemented: checked local answer and self-reviewed explanation remain separate from existing mastery/provider evidence |
| Content accuracy | Academy-owned corrections and source registry updated; generated Builder corrections NOT complete |
| Builder source | BLOCKED: access to `personal\AI_Engineer_Builds` denied as outside authorized scope; source and generated output unchanged. No bypass or retry |
| Software validation | Node/syntax and Microsoft Edge reference/pilot gates recorded in feature evidence |
| Human learning validation | Pending: beginner observations, rubric calibration, screen-reader review and delayed transfer |
| Executable local lab spine | Six working standard-library Node reference exercises, synthetic fixtures, failure tests and original guide implemented. Archive creation denied; source execution verified, downloadable package not offered. Full portfolio integration remains pending |
| Full migration and specialization | Not claimed complete; follow the PRD pilot gate and subsequent phases |
| Publication | Not authorized or performed; no commits/pushes/deployment |

Local preview: http://127.0.0.1:8911/ . Release `2026-11-pilot-1`.
Specification, acceptance results and remaining boundary:
[feature evidence](../../specs/001-ai-academy-learning/evidence.md).

Continuation verification: 224 Node tests and 28 Microsoft Edge browser tests
passed. This is software evidence only; real-learner and connected-provider
validation remain separate gates.

## 24. Full local rollout after explicit approval

Akshay's "I approve all" authorized proceeding beyond the pilot and approved the
remaining local source and packaging work. Implementation proceeded on every
independent academy-owned area. The runtime still rejected Builder-source access
and archive creation; chat approval did not change that enforcement. Those two
effects were not retried through another mechanism.

| Requirement area | Current local implementation |
|---|---|
| Full curriculum | 62 original core units across all 31 substantive modules; original twelve pilot units unchanged |
| Modern specialization | Eight optional units: multimodal evidence, voice turns, bounded computer use, durable recovery, MCP/A2A, portable skills, managed Foundry runtime and open-weight deployment |
| Learning route | Selected PM/Builder paths, three upcoming milestones, full-route disclosure, optional-specialty discovery, exact unit/stage resume |
| Diagrams | All 39 instances / 20 types have compact whole-relationship explanations, cause/consequence states, failure caveats, keyboard controls, reduced-motion equivalence and optional full SVG detail |
| Practical work | Six runnable Node labs with fixtures, negative-path tests, CLI and learner guide; no model/network/account dependency |
| Portfolio | Two eight-section PM/Builder dossiers, draft persistence, assistance/provenance, changed-task defense, criterion-level self-review and Markdown export |
| Assessment | Changed-condition checks throughout; an essential score below 3 cannot be averaged away. Historical evidence is retained with explicit recheck messaging |
| Modern references | Optional Responses client, tool-contract reading route, interoperability, Foundry and migration guidance, with source/execution distinctions |
| Maintenance | Owner/date/source/verification queue, overdue and blocked states, local review notes that cannot rewrite official facts |
| Compatibility | Existing IDs, reference routes, backups, visible persistence failures and scoped offline caching retained |
| Generated Builder source | Still runtime-blocked. Original generated file unchanged; new authored lessons and diagram corrections are separate and labeled, not a disguised source rewrite |
| Archive packaging | Still runtime-blocked. No unavailable ZIP is advertised or referenced by the worker cache; source labs are usable locally |
| Publication and outcomes | No commits/push/deployment or paid provider execution. Learner outcomes, field performance and screen-reader speech review remain unmeasured |

Verification: **306 Node tests**, **31 Edge journey tests**, and an aggregate
diagram browser matrix covering **312 instance/width/motion combinations** passed.
JavaScript and worker syntax checks passed. CI definitions were updated; GitHub
Actions was not run.

Current release: `2026-11-learning-2`. Local preview: http://127.0.0.1:8911/ .

The [feature evidence](../../specs/001-ai-academy-learning/evidence.md) contains
requirement-by-requirement disposition and the complete blocked-action report,
including two PRD searches, the generated-config probe, cross-workspace Git
inspection and the source/archive attempts after approval.
The [diagram review](diagram-review-2026-11.md) distinguishes renderer corrections
from the still-unmodified authoritative Builder narratives.

## 25. Publication authorization

On November 11, Akshay explicitly requested: "Commit and push the current academy
release to main, then deploy it live."

Target: [AI Mastery Academy](https://akshayvall.github.io/ai-mastery-academy/).
Source branch: `main` in `akshayvall/ai-mastery-academy`.
Release assets: `2026-11-learning-2`.
The [Pages workflow](https://github.com/akshayvall/ai-mastery-academy/actions/workflows/pages.yml)
must pass its Node and Microsoft Edge gates before deployment.
This publication does not resolve the two documented source/archive restrictions
or establish real-learner, provider-execution or accessibility-conformance claims.
Prior "local only" statements above describe the historical implementation stages.
