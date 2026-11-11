# Diagram learning review — November 2026

## Approved scope and acceptance

Implements PRD §12 and feature `001-ai-academy-learning` T015 under the
2026-11-11 approval amendment. Scope: renderer, new local CSS, focused Node and
Edge contracts, this review. Parent owns release wiring and session/change notes.

Acceptance: every retained instance has a compact whole-relationship explanation,
distinct cause/consequence states, labelled failure/approval paths, one Next step
action plus Previous/Reset, keyboard operation and equivalent reduced-motion
meaning. Optional SVG detail remains pannable; essential information does not.
Preserve IDs and public rendering/control APIs. No provider calls or publication.

## Source gate

Builder authoritative source access remains runtime-denied. An attempted broad
PRD lookup and a later generated-config probe were also denied; neither was
retried. Existing runtime tests may consume the delivered curriculum, but this
is not permission to change generated content. Original descriptions and steps
remain visible with an explicit correction/caveat alongside them. Renderer-owned
teaching states are independently authored examples, not corrected source data.

The original training narrative is specifically unreliable: declining training
loss alone cannot diagnose generalization. A labelled illustrative replacement
plot compares training loss, validation loss and held-out task results while
retaining the original narrative for transparent review.

## Planned verification

- Node: all 39 instances, 20 types; unchanged builder/step parity and determinism;
  new compact explanations, genuine controls, corrections and source preservation.
- Edge: all instances at 320/390/768/1440px with normal/reduced motion; every
  state, keyboard actions, reset/end boundaries, optional detail and preview.
- Manual subject-matter/learner/screen-reader review is not inferred from tests.

## Review method and limits

The compact model, its ordered cause/consequence cards and labelled failure
branch are the teaching surface. It is rendered in both previews and the
Diagrams tab. All states are available without motion or disclosure. Selecting
Next changes the highlighted card and live cause/consequence text, not the
topology. Data uses a solid border, control dashed, approval double and failure
dotted; text labels carry the same distinction without depending on color.

Original descriptions are preserved. Original step narratives are in a named
disclosure, not silently rewritten. Generated diagrams display a source-blocked
notice. The optional SVG retains legacy topology/configuration where source
review is blocked. A highlighted legacy element is not evidence that the
unmodified Builder narrative or its numerical assumptions are correct.

Source below means **what was actually reviewed**, not independent external
documentation verification: **A** = academy-owned renderer + approved PRD §12;
**G** = delivered generated diagram as consumed by runtime regression tests,
with authoritative Builder source blocked; **I** = independently authored
illustrative corrective model. No primary-source refresh or provider execution
was performed by this worker.

### Common interaction review applied to each row

- **M (mobile/text):** compact overview, complete labelled states and failure
  branch precede optional pannable SVG. No essential label requires lateral
  search. SVG title/description use the same teaching states.
- **K (keyboard):** native Next/Previous/Reset buttons and disclosure summaries;
  Enter/Space activate; Left/Right and Home/End work from control buttons.
  At overview Previous/Reset are disabled; at the final state Next is disabled.
- **R (reduced motion):** manual discrete states, identical text and topology.
  No autoplay control; decorative SMIL motion removed on initialization.
- **T (text alternative):** visible cause/consequence cards, scope/provenance
  caveat and failure text. Live state announces a complete sentence. Actual
  screen-reader speech/focus testing and learner comprehension remain unverified.

M/K/R are tested at each instance, not inferred from one representative type.
The accessibility target is not a WCAG certification.

## Twenty renderer-type review records

| Type; source / narrative | Edges and labels | States and failure scenario | Mobile / keyboard / reduced motion / text; open caveats |
|---|---|---|---|
| `ai-stack`; A/I, simplified overlapping families | Category relationship, not a universal taxonomy; non-neural generation and multimodal systems acknowledged | Five named categories; failure: universal nesting misclassifies systems | M/K/R/T; schematic category boundaries remain a teaching simplification |
| `tokenisation`; A/I, pieces and IDs explicitly invented | Text → pieces → IDs; language/case/spacing caveats | Seven distinct pieces; failure: universal character-ratio budget truncates input | M/K/R/T; no actual tokenizer benchmark executed |
| `next-token`; A/I, synthetic distribution | Scores/probabilities → sampling → new context; 42+18+12+8+5+15=100%; last bucket is aggregate | Six candidates/buckets; failure: likely continuation can be false | M/K/R/T; no temperature control or fake recalculation; not measured model output |
| `rag-pipeline`; A/I, indexing separated from query | Index permissions; lexical/vector/hybrid → relevance/access gate → answer/abstain | Five stages; missing, stale or unauthorized evidence → abstention | M/K/R/T; static vector-store example is one option, not mandatory architecture |
| `embedding-space`; A/I, invented projection | High-dimensional vectors → lossy projection; kitten→horse marks near-but-wrong retrieval | Four clusters + relevance rejection; wrong passage is not usable evidence | M/K/R/T; plot does not preserve all distances and is not an embedding benchmark |
| `tool-calling`; A/I, model proposes; application enforces | Distinct proposal, schema validation, authorization, execution, ID-matched result, response | Six states; malformed arguments, denied action, timeout and invalid result branches | M/K/R/T; approval is conceptual, not a working security service |
| `agent-loop`; A/I, controller-enforced termination | Conceptual decision → approval/budget → result → bounded continuation | Four states; stop for success/denial/cancellation/timeout/exhaustion | M/K/R/T; no hidden reasoning extraction or unrestricted-loop claim |
| `claude-code-workflow`; A/I, dated conceptual client view | Permission distinct from capability; diff review and independent checks before separately authorized commit | Seven stages; failing tests/unsafe diff block progression | M/K/R/T; exact client version/commands not executed or vendor-certified |
| `multi-agent`; A/I, dependency graph rather than universal fan-out | Research→Writer; independent Coder; Writer+Coder→Reviewer; orchestrator starts only ready work | Five roles; missing research blocks writer; compare single-agent baseline | M/K/R/T; independence is an explicit task assumption, not true of all coding |
| `mcp-architecture`; A/I, corrected host/client roles | Host policy → client connection ↔ negotiated version/capabilities ↔ server; auth separate | Three stages; unsupported feature/disconnection/expired authorization return error | M/K/R/T; actual compatibility/provider handshake not executed |
| `context-decay`; A/I, possible position sensitivity | Same evidence moved start/middle/end; invented accuracy curve is not universal | Three experiment conditions; missed evidence possible anywhere | M/K/R/T; held-out experiment is proposed, not completed |
| `fullstack-deploy`; A/I, runtime vs release control | Browser identity→API authorization→AI→private stores; build/test/stage/observe/rollback separately | Five layers; timeout, leaked secret and bad rollout addressed | M/K/R/T; architecture is conceptual, not a security or deployment validation |
| `capstone-architecture`; A/I, permissions/provenance/lifecycle added | Authorized ingestion and query; source/version IDs; deletion propagation; no-evidence branch | Six stages; revoked access, missing evidence and provider failure | M/K/R/T; no production readiness inference from the drawing |
| `phase-mapping`; A/I, prerequisite artifacts | Task contract→mock client→retrieval→bounded tools→optional MCP→operations→defense | Seven artifact gates; changed-task/failure defense tests integration | M/K/R/T; completion of headings is explicitly insufficient |
| `b-pipeline`; G/I, instance-specific corrective states | MCP discovery/runtime separated; other instances use DAG/eval/attack/audit/graph-specific relationships | 4–6 states by instance; stale capability, denied write, bad edge, missing prerequisite or critical regression | M/K/R/T; original graph labels and source propagation remain blocked, not certified |
| `b-timeline`; G/I, explicit corrective sequence SVG | Controller/policy/tool lanes; call A/B IDs, out-of-order results, cancellation and terminal state; audit instance keeps run/call correlation | 6 or 7 states; cancellation/timeout stops work, unmatched result is not success | M/K/R/T; original description/steps retained in disclosure; generated event data remains unchanged and source-level rewrite blocked |
| `b-bars`; G/I, illustrative legacy values | Cost formula includes model spend + review hours×rate + operations; scorecard separately treats units/denominators/safety | Four decisions; cheap requests may have higher accepted-result cost; safety failure blocks release | M/K/R/T; dollar values, scores and brand ranking are not newly measured/endorsed |
| `b-layers`; G/I, mitigation vs guarantee; LoRA instance is separate | Guardrails: classifiers/delimiters are not auth boundaries; LoRA: frozen base + low-rank updates | Five defensive layers or four adapter stages; denied side effects/residual risk or held-out regression | M/K/R/T; original attack-blocking tags remain legacy and source-blocked, visible corrective note governs interpretation |
| `b-curves`; G/I, explicit correction rather than silent source fix | Synthetic training solid line vs validation dashed line; separate held-out task bars; nats/token and case counts labelled | Three evidence layers; falling training loss plus worsening held-out outcomes exposes invalid generalization inference | M/K/R/T; original narrative kept and flagged; this is not a measured training run or diagnosis of a real model |
| `b-graph`; G/I, uncertain assertions and entity resolution | Extraction→identity check→path→source verification; explicit provenance footer supplies missing first highlight | Four stages; same-name merge/false edge invalidates answer | M/K/R/T; original source/configuration not certified; no external extraction performed |

## Per-instance trace and exception record

Each row inherits its type's narrative/edges/labels/states/failure/M/K/R/T review
above. Explicit override rows use the named independently authored model.
**A** rows are local renderer review only; **G** rows remain source-blocked.

| Module | Instance ID | Type; source | Instance narrative/state treatment and remaining limit |
|---|---|---|---|
| phase0-orientation | ai-stack-diagram | ai-stack; A | 5-category compact map; simplified scope, not taxonomy proof |
| phase0-orientation | tokenisation-diagram | tokenisation; A | 7 pieces; invented IDs clearly identified |
| phase1-prompting | next-token-diagram | next-token; A | 6 buckets; probability assumptions visible |
| phase3-ai-from-code | tool-calling-diagram | tool-calling; A | 6 proposal-to-response states; authorization/timeout boundary |
| phase4-memory-rag | rag-pipeline-diagram | rag-pipeline; A | 5 stages with separate indexing and no-evidence branch |
| phase4-memory-rag | embedding-space-diagram | embedding-space; A | 5 states; near horse rejected for kitten task |
| phase5-tool-use | tool-calling-flow | tool-calling; A | Same 6-state contract; no tool actually invoked |
| phase6-agents | agent-loop-diagram | agent-loop; A | 4 bounded states; termination independent of model choice |
| phase7-claude-code | claude-code-workflow-diagram | claude-code-workflow; A | 7 stages; review/commit not conflated |
| phase8-multi-agent | multi-agent-diagram | multi-agent; A | 5 states; writer waits for research |
| phase9-mcp-skills | mcp-architecture-diagram | mcp-architecture; A | 3 states; negotiated support is not permission |
| phase10-fullstack | fullstack-deploy-diagram | fullstack-deploy; A | 5 layers; runtime/release distinction |
| phase12-expert | context-decay-diagram | context-decay; A | 3 possible experimental conditions, not actual results |
| phase13-capstone | capstone-architecture-diagram | capstone-architecture; A | 6 permissioned stages; source lifecycle and abstention |
| phase13-capstone | capstone-phase-mapping-diagram | phase-mapping; A | 7 artifact gates; evaluate throughout |
| ai-stack | ai-stack-standalone | ai-stack; A | Same model; standalone alias retained |
| tokenisation | tokenisation-standalone | tokenisation; A | Same 7-piece illustrative model |
| next-token | next-token-standalone | next-token; A | Same 6-bucket probability model |
| rag-pipeline | rag-pipeline-standalone | rag-pipeline; A | Same retrieval alternatives and failure gate |
| embedding-space | embedding-space-standalone | embedding-space; A | Same near-but-wrong example; labels retain collision regression |
| tool-calling | tool-calling-standalone | tool-calling; A | Same application approval boundary |
| agent-loop | agent-loop-standalone | agent-loop; A | Same budget/termination states |
| multi-agent | multi-agent-standalone | multi-agent; A | Same dependency graph and baseline caveat |
| mcp-architecture | mcp-architecture-standalone | mcp-architecture; A | Same negotiated compatibility/auth distinctions |
| context-decay | context-decay-standalone | context-decay; A | Same unmeasured experiment; no memory guarantee |
| builder-mcp-assistant | b-mcp-arch | b-pipeline; G | 5 discovery/runtime states; capability refresh/unavailable tool; legacy source pending |
| builder-mcp-assistant | b-mcp-loop | b-timeline; G | 7 ID-correlated sequence states with multiple calls/cancellation; original narrative retained |
| builder-multi-agent | b-orch-dag | b-pipeline; G | 6-state override: parallel research, join, dependent writer, baseline review |
| builder-multi-agent | b-orch-cost | b-bars; G | 4 cost/quality decisions; legacy brand/cost values remain unverified |
| builder-eval-pipeline | b-eval-flow | b-pipeline; G | 6-state evaluation override; planted-regression and safety gate |
| builder-eval-pipeline | b-eval-scorecard | b-bars; G | 4 scorecard-specific states, not falsely treated as a cost-only chart |
| builder-rag-guardrails | b-rag-defense | b-layers; G | 5 mitigations; residual risk and denied write; blocking tags not endorsed |
| builder-rag-guardrails | b-rag-attack | b-pipeline; G | 5-state hostile document→proposal→application denial override |
| builder-audit-agent | b-audit-trace | b-timeline; G | 6-state audit override: run/call IDs, redaction, cancellation, review |
| builder-audit-agent | b-audit-arch | b-pipeline; G | 4-state audit architecture: scope/policy/result/review; log gaps explicit |
| builder-finetune | b-ft-loss | b-curves; G | 3-state correction; original generalization claim preserved and flagged |
| builder-finetune | b-ft-lora | b-layers; G | 4-state LoRA override; not mislabeled as security layers; parameter formula stated |
| builder-knowledge-graph | b-kg-hop | b-graph; G | 4 states; missing first SVG state repaired with provenance assertion |
| builder-knowledge-graph | b-kg-pipeline | b-pipeline; G | 5 extraction/identity/index/verification states; provenance uncertainty explicit |

## Compatibility and operational decisions

- `render`, `renderDiagram`, `renderPreview`, `initDiagram`, `cleanup`, `play`,
  `reset`, `stepThrough` and builder signatures remain. IDs and existing
  `data-diagram-action="step"` / canvas selectors remain.
- `play(id)` intentionally becomes a one-state advance, not cosmetic animation.
  The Play button is removed because it had no distinct learning outcome.
  Next no longer wraps silently to zero; Previous and Reset make reversal explicit.
- `previous(id)` and clamped `setStep(id, index)` are added. Controller state is
  attached to its rendered canvas, so it no longer depends on a global module
  lookup and can work on all declared instances in isolation.
- Parent must include `css/diagram-learning.css` after existing styles in the
  document and offline cache. No asset wiring outside this worker's scope was edited.
- The new Edge harness serves a bounded academy fixture on an ephemeral localhost
  port, uses `channel="msedge"` in fresh contexts, blocks off-origin requests,
  and shuts down its server/browser. It never uses an existing user profile.
- A design hook flagged a decorative side accent; it was removed rather than
  waived. State border styles remain intentional non-color relationship cues.

## Verification evidence

- Red: 5 new Node regressions failed for missing compact models/controls/source
  correction/training plot; Edge failed on missing overview at all 8 width/motion
  settings.
- Green (latest local check): 17/17 focused Node tests passed, including a
  separately red/green-tested ID-correlated sequence renderer.
- Related platform/content/modern-reference contracts: 29/29 passed. JavaScript
  syntax and Python AST parsing passed without adding dependencies.
- Additional gap check reproduced missing `b-kg-hop` SVG step 1. Adding a
  labelled provenance state fixed it; all narrated SVG steps now have targets.
- Full shared academy Node run during concurrent implementation reported
  unrelated in-progress unit-content failures (advanced units and PM trust/safety).
  This worker did not modify those files or treat that run as a release pass.
- Final combined bounded Node run: **46/46 passed** (17 diagram contracts +
  29 platform/content/modern-reference contracts).
- Edge matrix: **passed**, 1 matrix test in **382.508 seconds**. All **39
  instances / 20 types**, each at **320, 390, 768 and 1440px**, with normal
  and reduced motion: **312 instance/viewport/motion combinations**, plus
  preview checks. Each declared state was advanced using the keyboard;
  Previous, Reset, Home, ArrowRight, disabled end boundaries and optional
  detail disclosure were exercised. No page errors or page-level overflow.
- The final sequence SVG change was additionally checked in isolated Edge at
  390px under both motion modes: `b-mcp-loop` 7/7 states and `b-audit-trace`
  6/6 states, correct labels, active targets and no page-level overflow.
- No dependencies installed, external requests, commits or deployment.

Reproduce from the workspace root:

```powershell
node --test personal\Idea_Gen\ai-academy\tests\diagrams.test.js personal\Idea_Gen\ai-academy\tests\platform.test.js personal\Idea_Gen\ai-academy\tests\content-accuracy.test.js personal\Idea_Gen\ai-academy\tests\modern-reference.test.js
python personal\Idea_Gen\ai-academy\tests\browser_diagram_learning.py
```

The fixture explicitly loads the new CSS; parent must still verify the actual
release document and service-worker asset wiring. The passing fixture matrix
does not claim that a deployment or cache-upgrade test was run by this worker.

## Remaining release gates

1. Reopen authoritative Builder source access through the normal permission
   process; correct source narratives/configuration and regenerate, then review
   every affected lesson/quiz/flashcard/diagram/lab surface. Current local
   corrections do **not** close PRD FR06's cross-source requirement.
2. Human subject-matter review of original/generated detail and actual learner
   explanation quality. The 39-instance inventory is coverage, not efficacy.
3. Manual screen-reader, zoom/reflow and broader contrast review. Edge checks
   cover the documented paths only.
4. Parent release wiring/offline verification and separate publication approval.
