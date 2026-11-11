/* ============================================
   AI ACADEMY DIAGRAM ENGINE
   Interactive SVG visualisations for AI concepts.

   Same public API as the Azure Networking Academy engine:
     DiagramEngine.render(diagrams)     // diagrams = array on a module
     DiagramEngine.cleanup()
     DiagramEngine.play(id) / reset(id) / stepThrough(id)

   Each diagram object: { id, type, title, description?, steps?, legend? }
   builders[type] returns the SVG markup.
   ============================================ */

const DiagramEngine = {

    activeAnimations: [],

    escapeHtml(value) {
        const characters = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return String(value ?? '').replace(/[&<>"']/g, character => characters[character]);
    },

    domId(prefix, value, index = '') {
        const safeValue = Array.from(String(value ?? 'diagram'))
            .map(character => /[A-Za-z0-9_-]/.test(character) ? character : `-${character.codePointAt(0).toString(16)}-`)
            .join('');
        const suffix = index === '' ? '' : `-${index}`;
        return `${prefix}-${safeValue || 'diagram'}${suffix}`;
    },

    // ── Standard arrowhead markers ──
    arrowDefs(colors) {
        return colors.map(c => {
            const id = c.replace('#', '');
            return `<marker id="ah-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L10,5 L0,9 Z" fill="${c}"/></marker>`;
        }).join('\n');
    },

    // Authored teaching models are separate from legacy/generated source narratives.
    // Each state is [label, cause, observed consequence, relationship kind].
    learningModels: {
        'ai-stack': {
            overview: 'Simplified map: AI includes learning systems; deep learning includes many modern generative models. These overlapping families are not a universal taxonomy.',
            caveat: 'Illustrative categories, not an exhaustive nesting. Generative methods need not be neural; language-model systems can accept images and audio.',
            failure: 'Classifying every generative system as a deep network hides non-neural methods and multimodal capabilities.',
            states: [
                ['AI', 'A task requires machine intelligence.', 'Rules, search or learned models are possible approaches.', 'control'],
                ['Machine learning', 'Training examples inform model parameters.', 'A learned pattern replaces some hand-written rules.', 'data'],
                ['Deep learning', 'Many learned layers transform representations.', 'Some ML systems learn hierarchical features.', 'data'],
                ['Generative deep models', 'A learned model produces new samples.', 'Text, images or other outputs are generated; this is only part of generative AI.', 'data'],
                ['Language models', 'Token sequences condition generation.', 'Language is central, but a system may also process other modalities.', 'data']
            ]
        },
        tokenisation: {
            overview: 'Text → tokenizer pieces → numeric IDs → model input. The seven displayed pieces and IDs are invented teaching examples.',
            caveat: 'Illustrative tokenizer, not measured provider output. Characters per token vary by language, content and model.',
            failure: 'Estimating a budget with a universal characters-per-token ratio can truncate important input; count with the actual tokenizer.',
            states: [
                ['Opening piece', 'The example begins with a quotation and The.', 'One illustrative piece is assigned an invented ID.', 'data'],
                ['Word boundary', 'A space precedes cat.', 'Whitespace may be part of a token, not a separate word counter.', 'data'],
                ['Next piece', 'The example adds sat.', 'A numeric ID represents this piece in this illustrative vocabulary.', 'data'],
                ['Short word', 'The next characters are on.', 'A short word may fit in one token; that is not a general rule.', 'data'],
                ['Case and spacing', 'The example contains the with a leading space.', 'Case and spaces can change the real tokenizer output.', 'data'],
                ['Content-dependent split', 'The text adds mat.', 'Other words or languages may split into multiple pieces.', 'data'],
                ['Closing piece', 'The quotation ends.', 'The model receives the complete ID sequence; verify real counts separately.', 'data']
            ]
        },
        'next-token': {
            overview: 'Context → scores → probability distribution → sampled token → updated context. The bars sum to 100%; they are illustrative, not measured.',
            caveat: 'Example probabilities: 42 + 18 + 12 + 8 + 5 + 15 = 100%. The last bucket aggregates all omitted candidates. No temperature simulator is present.',
            failure: 'A likely continuation can still be false. Lower temperature does not create evidence or guarantee repeatability.',
            states: [
                ['Highest candidate', 'The illustrative context gives sat probability 0.42.', 'It is most likely, not certain or necessarily correct.', 'data'],
                ['Alternative', 'jumped has probability 0.18.', 'Sampling can select a less likely continuation.', 'data'],
                ['Another continuation', 'ran has probability 0.12.', 'Multiple continuations remain possible.', 'data'],
                ['Smaller candidate', 'slept has probability 0.08.', 'A lower probability is not the same as impossibility.', 'data'],
                ['Long tail', 'walked has probability 0.05.', 'The displayed named candidates total 85%.', 'data'],
                ['Remaining vocabulary', 'All other tokens together have probability 0.15.', 'Sampling chooses one token, then the distribution is recomputed for the new context.', 'control']
            ]
        },
        'rag-pipeline': {
            overview: 'Indexing: documents → chunks + permissions → searchable index. Querying: question → lexical/vector/hybrid retrieval → evidence filter → grounded answer or abstention.',
            caveat: 'Illustrative architecture. Vector search is one option; retrieval and citations do not guarantee truth.',
            failure: 'If retrieved passages are missing, stale, unauthorized or irrelevant, do not invent an answer: abstain or ask for better evidence.',
            states: [
                ['Question', 'A user asks about indexed material.', 'The application establishes identity and the information need.', 'data'],
                ['Search representation', 'Choose lexical, vector or hybrid retrieval.', 'The question becomes a query; the offline index already contains chunks and permissions.', 'control'],
                ['Evidence candidates', 'Search returns candidate passages.', 'Filter permissions, relevance, freshness and duplicates; near is not necessarily correct.', 'approval'],
                ['Evidence gate', 'Enough relevant, authorized evidence survives.', 'Attach passage IDs and source provenance; otherwise take the no-evidence branch.', 'control'],
                ['Answer or abstain', 'The model receives filtered passages.', 'Return supported claims with citations, or explicitly say evidence is insufficient.', 'data']
            ]
        },
        'embedding-space': {
            overview: 'Text → high-dimensional vectors → similarity candidates → relevance check. This invented 2-D projection cannot preserve all original distances.',
            caveat: 'Illustrative coordinates, not measured embeddings. The kitten query points near horse: a deliberate near-but-wrong candidate.',
            failure: 'A nearby horse passage does not answer a kitten-care question. Inspect passage content and task relevance before citing it.',
            states: [
                ['Animal cluster', 'Related words are placed nearby in the sketch.', 'The cluster suggests a relationship, not interchangeable meaning.', 'data'],
                ['Vehicle cluster', 'Another group contains vehicle terms.', 'Separate groups make a simplified visual comparison possible.', 'data'],
                ['Programming cluster', 'Code terms occupy another area.', 'Real embedding neighborhoods depend on model and context.', 'data'],
                ['Food cluster', 'Food terms form another illustrative group.', 'The 2-D picture loses information from the original vector space.', 'data'],
                ['Near but wrong', 'kitten is drawn near horse.', 'Similarity proposes a candidate; evidence review rejects the wrong answer.', 'failure']
            ]
        },
        'tool-calling': {
            overview: 'User → model proposal → application validation + authorization → tool execution → matched result → answer. A proposal is not permission.',
            caveat: 'Illustrative call, not a live API. The application, not the model or argument delimiters, enforces side-effect authorization.',
            failure: 'Malformed arguments → reject; denied permission → no execution; timeout → bounded retry or error; malformed result → no fabricated success.',
            states: [
                ['User request', 'The user asks a question.', 'The model receives the task, not unrestricted tool access.', 'data'],
                ['Proposal', 'The model proposes a tool name, arguments and call ID.', 'The application validates schema and checks the requested operation.', 'control'],
                ['Approval boundary', 'The application checks authorization and any required human approval.', 'Only an allowed, validated request reaches the tool; denied requests stop here.', 'approval'],
                ['Tool result', 'The tool executes within a timeout.', 'The application receives a result or an explicit failure for that call ID.', 'data'],
                ['Result validation', 'The application checks result shape and matches the call ID.', 'Validated evidence or a failure message returns to the model.', 'control'],
                ['User response', 'The model summarizes the returned evidence.', 'The user sees the result, or the denial/timeout without invented success.', 'data']
            ]
        },
        'agent-loop': {
            overview: 'Goal → proposed action → approval + budget gate → tool result → next decision. Stop on success, denial, cancellation, timeout or exhausted budget.',
            caveat: 'Reasoning is a conceptual decision state, not a hidden trace to extract. The application enforces budgets independently of the model.',
            failure: 'A repeated failing call consumes the step/time/cost budget. Stop or escalate; never loop indefinitely waiting for model-selected success.',
            states: [
                ['Decide', 'The goal and available evidence suggest a next action.', 'The model proposes an action or a final answer; no side effect occurs yet.', 'control'],
                ['Gate action', 'The application checks remaining budget, schema and human approval.', 'An authorized action executes; denied or over-budget work enters a terminal state.', 'approval'],
                ['Observe', 'A tool returns a result, malformed output or timeout.', 'The application records the outcome and updates the remaining budget.', 'data'],
                ['Continue or stop', 'The controller checks outcome, cancellation and limits.', 'Continue only within budget; otherwise stop with success, denial, timeout or escalation.', 'control']
            ]
        },
        'claude-code-workflow': {
            overview: 'Task + repository context → proposal → permitted read/edit/test → human diff review + independent verification → separately authorized commit.',
            caveat: 'Conceptual client workflow reviewed 2026-11; exact CLI commands and permission modes are version-dependent, not executed here.',
            failure: 'A test can miss a regression and a tool capability can be disallowed. Reject unsafe edits and do not infer publication approval from passing tests.',
            states: [
                ['Task context', 'A user defines intent and repository constraints.', 'The assistant receives scope and acceptance criteria.', 'data'],
                ['Plan', 'The assistant compares the request with existing code.', 'A bounded proposed change can be reviewed before side effects.', 'control'],
                ['Read', 'Read permission permits relevant inspection.', 'Code evidence informs the change; capability alone does not grant permission.', 'approval'],
                ['Edit', 'An approved change is applied within scope.', 'A reviewable diff exists, not yet proof of correctness.', 'data'],
                ['Verify', 'Independent tests, build and lint check the diff.', 'Failures guide correction; passing checks cover only their tested scope.', 'control'],
                ['External tools', 'An MCP tool is available.', 'Its data destination and permissions still require separate checks.', 'approval'],
                ['Human review', 'A person reviews the diff and verification evidence.', 'Commit or publication happens only with separate authorization.', 'approval']
            ]
        },
        'multi-agent': {
            overview: 'Plan → research and independent coding in parallel; research → writing; writing + code → review → merge. Dependencies determine concurrency.',
            caveat: 'Illustrative dependency graph. Compare quality, latency, coordination and total cost against one agent on the same task.',
            failure: 'Starting the writer before required research can propagate invented facts; a reviewer cannot validate evidence they never receive.',
            states: [
                ['Plan dependencies', 'The task is split by independent evidence needs.', 'Research and independent coding can begin; writing waits for research.', 'control'],
                ['Research', 'The researcher gathers cited evidence.', 'Its result unlocks the dependent writing task.', 'data'],
                ['Write after research', 'Research is available.', 'The writer drafts from sources rather than guessing while they are absent.', 'control'],
                ['Independent coding', 'The code task does not depend on the research result.', 'It may run in parallel; if that assumption changes, add a dependency.', 'control'],
                ['Review and merge', 'Draft and code are both complete.', 'Review checks their evidence, then compares the result with a single-agent baseline.', 'approval']
            ]
        },
        'mcp-architecture': {
            overview: 'Host owns policy → client connection negotiates version/capabilities ↔ server exposes supported tools/resources/prompts → authorized operation.',
            caveat: 'Compatibility requires supported versions, transports and negotiated capabilities; not every client supports every server feature.',
            failure: 'Unsupported capability, expired authorization or disconnected server → surface an error; do not silently assume universal interoperability.',
            states: [
                ['Host and client', 'A host application creates a client connection.', 'The host manages user consent, context and policy; the client handles the protocol.', 'control'],
                ['Negotiate', 'Client and server initialize over stdio or Streamable HTTP.', 'Version and capability negotiation establishes supported operations; authentication remains a separate boundary.', 'control'],
                ['Authorized server call', 'The host permits a supported request and the server authorizes access.', 'The server returns permitted data or a denial; protocol compatibility is not authorization.', 'approval']
            ]
        },
        'context-decay': {
            overview: 'Keep question and evidence fixed; move the relevant passage between start, middle and end; compare answer accuracy on held-out tasks.',
            caveat: 'A possible position-sensitivity pattern, not a universal curve or memory guarantee. Model, task, distractors and context length change results.',
            failure: 'A model can miss available evidence in any position. A larger context window is not proof of reliable use of that context.',
            states: [
                ['Start condition', 'Place the same relevant passage near the start.', 'Record correctness and citations; do not infer a guaranteed advantage.', 'data'],
                ['Middle condition', 'Move that passage to the middle without changing its content.', 'A drop, if observed, suggests position sensitivity for this task.', 'data'],
                ['End condition', 'Repeat at the end and across multiple held-out cases.', 'Compare ordering, retrieval and summaries with the same scoring rule.', 'control']
            ]
        },
        'fullstack-deploy': {
            overview: 'Runtime: browser → authenticated API → model/retrieval → private stores. Release: build → test → staged deploy → monitor → rollback if needed.',
            caveat: 'Illustrative architecture; framework and hosting names are examples, not mandatory services. Runtime data flow differs from release control flow.',
            failure: 'Provider timeout or quality regression → trace the failure, return a safe error, and roll back a bad release. Never send server secrets to the browser.',
            states: [
                ['Browser boundary', 'A user sends a request with identity.', 'The frontend carries no provider secret and cannot grant itself access.', 'data'],
                ['API boundary', 'The backend validates identity, input and authorization.', 'Only permitted data and operations reach downstream services.', 'approval'],
                ['AI runtime', 'A permitted request invokes retrieval or a model.', 'Timeouts, budgets and safe error handling bound the request.', 'control'],
                ['Private data', 'Storage checks tenant/document permissions and retention.', 'Authorized evidence returns with provenance; telemetry excludes secrets and unnecessary private text.', 'approval'],
                ['Release and recovery', 'A tested version is staged and observed.', 'Health and quality gates decide rollout or rollback independently of one request.', 'control']
            ]
        },
        'capstone-architecture': {
            overview: 'Authorized upload → permissioned ingestion/index → authorized retrieval → cited answer or no-evidence response; trace failures and expire data.',
            caveat: 'Illustrative system design, not a production-readiness claim. Source IDs must connect citations to permissioned document versions.',
            failure: 'Missing evidence → abstain; revoked document access → remove it from retrieval; provider failure → visible error and trace, not a fabricated answer.',
            states: [
                ['Upload', 'A user submits a document or question.', 'Identity and document ownership accompany the request.', 'data'],
                ['API policy', 'The application validates ownership, limits and request shape.', 'Unauthorized input is denied before ingestion or retrieval.', 'approval'],
                ['Ingest', 'A permitted document is parsed and chunked.', 'Chunks retain source/version IDs, permissions and expiry information.', 'data'],
                ['Store lifecycle', 'Chunks and vectors are indexed.', 'Retention, deletion and permission changes must propagate to indexes and caches.', 'control'],
                ['Query', 'Retrieval filters candidates by current access and relevance.', 'Only sufficient evidence reaches generation; otherwise abstain.', 'approval'],
                ['Answer and observe', 'Claims are checked against cited source passages.', 'Return provenance or no-evidence status; observe failures without logging secrets.', 'data']
            ]
        },
        'phase-mapping': {
            overview: 'Foundations → mock API → retrieval → bounded tools → optional MCP → deployment review → integrated defense. Evidence artifacts, not headings, prove readiness.',
            caveat: 'Conceptual prerequisites under stable phase IDs. Evaluation begins with foundations and continues through every artifact; MCP is optional.',
            failure: 'Completing separate lessons does not establish integration competence. Remove a document or inject a timeout and defend the whole system.',
            states: [
                ['Foundations', 'Define a task and output contract.', 'Produce a testable prompt and examples before connecting code.', 'control'],
                ['API integration', 'A task contract exists.', 'A mock client proves schemas, retries and secret boundaries.', 'data'],
                ['Retrieval', 'The client can handle structured responses and failures.', 'An evidence fixture tests retrieval, citations and missing documents.', 'data'],
                ['Bounded tools', 'Input and result validation work.', 'A tool contract proves denial, budget and stop behavior.', 'approval'],
                ['Optional interface', 'The underlying capability already works.', 'MCP can expose it with negotiated support and explicit permissions.', 'control'],
                ['Operations', 'Integrated tests exist.', 'Telemetry and rollback evidence support a staged release decision.', 'control'],
                ['Defense', 'A changed task or failure is introduced.', 'Explain observed results, residual risk and a justified ship/no-ship decision.', 'approval']
            ]
        },
        'b-pipeline': {
            overview: 'Startup discovery → supported capability registry → runtime proposal → authorization → result. Discovery is not an invocation.',
            caveat: 'Renderer-authored corrective model; the legacy diagram is illustrative and its generated source review is blocked.',
            failure: 'Capability removed or access denied → refresh discovery or return a bounded error; never assume a previously listed tool is still callable.',
            states: [
                ['Connect', 'The host establishes a server connection.', 'Version and capability negotiation precede discovery.', 'control'],
                ['Discover', 'Startup lists supported tools and schemas.', 'The application builds a capability registry, not a permission grant.', 'data'],
                ['Propose', 'At runtime the model selects an available capability.', 'The application validates arguments against the current schema.', 'control'],
                ['Authorize', 'Policy and any human approval allow the operation.', 'Only permitted requests execute within time and call budgets.', 'approval'],
                ['Observe and refresh', 'A result or capability-change signal arrives.', 'Match result IDs; refresh stale capabilities and surface unavailable tools.', 'data']
            ]
        },
        'b-timeline': {
            overview: 'User task → proposed calls A/B → approval → results matched by ID → next decision or terminal cancellation/error/success.',
            caveat: 'Illustrative sequence; the original event narrative remains visible. Multiple calls need distinct IDs and may finish out of order.',
            failure: 'Cancel while B is pending → stop scheduling and mark B cancelled; timeout/error is terminal unless a bounded retry is explicitly permitted.',
            states: [
                ['Task', 'A user requests work.', 'A controller starts a bounded run with a cancellation signal.', 'control'],
                ['Propose A and B', 'The model requests two independent operations.', 'Each request receives its own call ID.', 'data'],
                ['Approve', 'Policy validates each call and its side effects.', 'Only approved calls A/B are dispatched.', 'approval'],
                ['Result B', 'The second operation finishes first.', 'Result B is matched to call B, not the first pending item.', 'data'],
                ['Result A', 'The first operation returns or times out.', 'The controller records the outcome against A and updates the budget.', 'data'],
                ['Check termination', 'Cancellation, error, budget exhaustion or success is observed.', 'Stop scheduling or choose an explicitly bounded next action.', 'control'],
                ['Report', 'The run has reached a terminal state.', 'Report success, partial failure or cancellation without fabricated tool results.', 'data']
            ]
        },
        'b-bars': {
            overview: 'Compare task quality and total cost under the same workload; model names or relative bars alone cannot establish superiority.',
            caveat: 'Illustrative legacy values, not verified prices or universal savings. Total cost = requests × model cost per request + review hours × reviewer rate + operating cost.',
            failure: 'A cheap model with more failures or reviewer work can cost more per accepted result. Measure the same task and include uncertainty.',
            states: [
                ['Comparable workload', 'Fix task cases, request counts and quality threshold.', 'Bars become interpretable only with shared units and assumptions.', 'control'],
                ['Model spend', 'Multiply each model price per request by its request count.', 'This yields only model cost, not the complete operating cost.', 'data'],
                ['Quality and review', 'Measure accepted results, review hours and reviewer rate.', 'Failures and human correction change effective cost.', 'data'],
                ['Decision', 'Combine model, reviewer and operating costs.', 'Compare cost per accepted result with quality and latency; no universal winner follows.', 'control']
            ]
        },
        'b-layers': {
            overview: 'Input checks → separated instructions/data → retrieval filtering → output checks → enforced side-effect authorization. These are mitigations, not guarantees.',
            caveat: 'Delimiters and classifiers are not authorization boundaries. Defense in depth reduces risk but leaves residual prompt-injection risk.',
            failure: 'An injected instruction may survive every text filter. The application must still deny unauthorized writes and record the attempted action.',
            states: [
                ['Input scrutiny', 'Untrusted text enters the system.', 'Detection flags some suspicious content but may miss an attack.', 'data'],
                ['Separate data', 'Instructions and retrieved data are clearly separated.', 'Delimiters aid interpretation, not enforcement.', 'control'],
                ['Filter evidence', 'Retrieval returns potentially hostile passages.', 'Permission and relevance checks reduce exposure without proving safety.', 'approval'],
                ['Check output', 'A generated answer or tool proposal is inspected.', 'A classifier can miss or misclassify risk; it is not a guarantee.', 'control'],
                ['Deny side effects', 'The application checks actual write authorization.', 'Disallowed actions are denied independently of model text; monitor residual risk.', 'approval']
            ]
        },
        'b-curves': {
            overview: 'Training loss measures fit to training data; validation loss checks separate examples; held-out task results test the behavior you actually need.',
            caveat: 'Correction to the original narrative: falling training loss does not prove generalization. The replacement curves and task counts are explicitly synthetic.',
            failure: 'Training loss can keep falling while validation loss rises and task success falls. Check leakage, task representativeness and multiple runs before diagnosing.',
            states: [
                ['Training fit', 'Training loss falls across checkpoints.', 'This only establishes improved fit on training examples.', 'data'],
                ['Validation comparison', 'Validation loss first falls, then rises while training loss falls.', 'The gap suggests overfitting in this example, not a universal diagnosis from curve shape.', 'data'],
                ['Held-out behavior', 'A separate 20-case task set scores 10, 15, 14 and 11 successes.', 'Task success worsens at the last checkpoint despite lower training loss; retain independent evidence.', 'control']
            ]
        },
        'b-graph': {
            overview: 'Source passages → uncertain extraction → entity resolution → candidate graph path → source verification. A path is not proof that its edges are true.',
            caveat: 'Illustrative graph. Retain passage IDs, extraction method and confidence; confidence scores are not automatically calibrated probabilities.',
            failure: 'Two people with the same name can be merged incorrectly. One false edge can invalidate a plausible multi-hop answer.',
            states: [
                ['Extract', 'A model proposes entities and relationships from a passage.', 'Store the source passage and mark extracted assertions as uncertain.', 'data'],
                ['Resolve entities', 'Similar names are compared across sources.', 'Check identity evidence rather than merging solely on name similarity.', 'control'],
                ['Traverse', 'The graph supplies a candidate multi-hop path.', 'The path is a hypothesis composed of individually fallible edges.', 'data'],
                ['Verify provenance', 'Review supporting passages for every answer-critical edge.', 'Reject unsupported edges or abstain; cite the underlying evidence, not just the path.', 'approval']
            ]
        }
    },

    learningOverrides: {
        'b-orch-dag': {
            overview: 'Plan dependencies → parallel independent research → merge evidence → dependent writing → review → accepted result. Compare with a single-agent baseline.',
            failure: 'A writer started before required evidence will guess. Failed prerequisites block dependent work, not the independent branch.',
            states: [
                ['Plan', 'Declare task dependencies and a cost budget.', 'Only independent branches become runnable.', 'control'],
                ['Research A', 'One independent evidence question is ready.', 'Its result carries sources and uncertainty.', 'data'],
                ['Research B', 'Another question does not depend on A.', 'It can run in parallel under the same budget.', 'data'],
                ['Join', 'Both required research results are available.', 'A failure blocks dependent writing or triggers explicit partial-result handling.', 'control'],
                ['Write', 'Merged evidence is provided to the writer.', 'The draft reflects evidence rather than concurrent guessing.', 'data'],
                ['Review baseline', 'Check the draft and total coordination/reviewer cost.', 'Accept only if quality and cost justify the single-agent alternative.', 'approval']
            ]
        },
        'b-eval-flow': {
            overview: 'Versioned cases → reference output → candidate output → deterministic checks + calibrated judges → failure analysis → release gate.',
            failure: 'A high average can hide a safety-critical failure. Block the release for critical failures and inspect judge disagreements.',
            states: [
                ['Cases', 'Version representative cases and expected properties.', 'A held-out set separates development from final measurement.', 'data'],
                ['Baseline', 'Run the reference on those cases.', 'Record outputs and environmental assumptions.', 'data'],
                ['Candidate', 'Run the changed system on the same cases.', 'Comparable outputs allow a regression comparison.', 'data'],
                ['Score', 'Apply deterministic checks and calibrated human/model review.', 'Record per-case failures and uncertainty, not just an average.', 'control'],
                ['Diagnose', 'Inspect disagreements, slices and critical failures.', 'A planted regression demonstrates that the evaluation can detect a problem.', 'control'],
                ['Gate', 'The candidate meets required quality and safety constraints.', 'Approve a staged release or block it with reproducible evidence.', 'approval']
            ]
        },
        'b-rag-attack': {
            overview: 'Hostile document → retrieval → untrusted prompt content → unsafe proposal → application denial. Text defenses do not grant write permission.',
            failure: 'If a retrieved instruction asks to disclose secrets or write data, application policy must deny the operation even if the model follows the instruction.',
            states: [
                ['Attack input', 'An attacker places an instruction inside document data.', 'Treat it as untrusted content, not authority.', 'failure'],
                ['Retrieval', 'Similarity search returns the hostile passage.', 'Relevance does not imply safety or authorization.', 'data'],
                ['Prompt boundary', 'The passage is placed in a labelled data section.', 'Separation helps but cannot guarantee the model ignores instructions.', 'control'],
                ['Proposal', 'The model proposes a sensitive side effect.', 'The application checks schema, target and actual permissions.', 'approval'],
                ['Deny and observe', 'The side effect is outside authorized scope.', 'No write executes; record the denial and assess residual risk.', 'failure']
            ]
        },
        'b-audit-arch': {
            overview: 'Request → bounded tool policy → structured event log → reviewer decision. Logs support an audit; they do not prove every claim is true.',
            failure: 'Missing events or leaked secrets undermine the audit. Restrict access, redact private payloads and test log integrity/retention.',
            states: [
                ['Request identity', 'A run starts with task scope and identity.', 'Assign a run ID and explicit budget.', 'data'],
                ['Policy gate', 'A proposed tool call is validated and authorized.', 'Record call ID and permit/deny outcome before side effects.', 'approval'],
                ['Observe result', 'Execution returns, fails or is cancelled.', 'Link a redacted result and duration to the same call ID.', 'data'],
                ['Review trail', 'A reviewer compares actions with policy and evidence.', 'Gaps remain visible; enforce retention and access controls.', 'control']
            ]
        },
        'b-kg-pipeline': {
            overview: 'Documents + provenance → uncertain extraction → entity resolution → graph index → verified retrieval answer.',
            failure: 'Bad entity merges or unsupported relationships contaminate multi-hop answers. Keep source links and reject unverifiable paths.',
            states: [
                ['Sources', 'Authorized documents enter ingestion.', 'Retain source IDs, versions and permissions.', 'data'],
                ['Extract assertions', 'A model proposes entities and edges.', 'Assertions remain uncertain until checked against source passages.', 'data'],
                ['Resolve identity', 'Potential duplicate entities are compared.', 'Ambiguous names remain distinct until evidence supports merging.', 'control'],
                ['Index graph', 'Reviewed assertions and provenance are stored.', 'Deletion, permission and source changes must propagate to the graph.', 'control'],
                ['Retrieve and verify', 'A graph path suggests an answer.', 'Check every critical edge and cite source evidence or abstain.', 'approval']
            ]
        },
        'b-audit-trace': {
            overview: 'Run ID → call ID → policy decision → matched result → budget/terminal state → reviewer-readable trace.',
            states: [
                ['Start run', 'A task begins with a scope and budget.', 'Create a run ID without storing secrets in metadata.', 'control'],
                ['Propose calls', 'One or more tools are requested.', 'Assign separate call IDs to correlate concurrent results.', 'data'],
                ['Authorize', 'Policy validates each requested side effect.', 'Log permit/deny; denied calls never execute.', 'approval'],
                ['Match results', 'Calls finish out of order or time out.', 'Attach each redacted result to its own call ID.', 'data'],
                ['Stop', 'Cancellation, budget exhaustion or completion occurs.', 'Record the terminal state and stop scheduling further work.', 'control'],
                ['Review', 'A reviewer reads the structured trace.', 'Inspect evidence and missing events; do not reconstruct private hidden reasoning.', 'approval']
            ]
        },
        'b-eval-scorecard': {
            overview: 'Compare per-case quality, safety, latency and total cost with explicit thresholds; averages alone cannot authorize release.',
            caveat: 'Illustrative legacy scores, not measured benchmarks. State denominators, evaluator provenance and reviewer cost; do not infer universal model superiority.',
            failure: 'A candidate may improve average quality while failing one safety-critical case. Slice results and block on critical failures.',
            states: [
                ['Cases and units', 'Define the held-out cases and metric units.', 'Scores have denominators and a reproducible scoring rule.', 'data'],
                ['Quality', 'Score the same task outputs against expected properties.', 'Inspect differences and judge disagreements per case.', 'control'],
                ['Safety and cost', 'Check critical failures, latency and reviewer cost.', 'A cheap average does not erase a safety failure.', 'control'],
                ['Release decision', 'Compare all essential thresholds and uncertainty.', 'Block regressions or stage release with explicit remaining unknowns.', 'approval']
            ]
        },
        'b-ft-lora': {
            overview: 'Frozen base weights + small trainable low-rank adapters → task adaptation → independent evaluation before deployment.',
            caveat: 'Illustrative LoRA architecture, not a performance or memory guarantee. For an adapted weight matrix, ΔW = B × A with rank r; trainable parameters = r × (input + output).',
            failure: 'An adapter can overfit or degrade other tasks. Compare with a prompt/retrieval baseline and test separate held-out cases.',
            states: [
                ['Base model', 'A pretrained model supplies fixed weights.', 'Freezing them avoids updating the full parameter set.', 'data'],
                ['Low-rank adapters', 'Train small matrices A and B for selected weights.', 'Their product supplies a constrained weight update.', 'data'],
                ['Task training', 'Task examples update adapter parameters.', 'Lower training loss measures fit, not guaranteed generalization.', 'control'],
                ['Independent evaluation', 'Test held-out task behavior and regressions.', 'Keep, revise or reject the adapter based on evidence rather than parameter efficiency alone.', 'approval']
            ]
        }
    },

    getLearningModel(diagram) {
        const base = this.learningModels[diagram.type];
        if (!base) return {
            overview: 'No reviewed teaching model is available for this diagram.',
            caveat: 'Unreviewed diagram; do not infer correctness from its appearance.',
            failure: 'Use the lesson text and request a reviewed visual.', states: []
        };
        return { ...base, ...this.learningOverrides[diagram.id] };
    },

    renderLearningOverview(diagram, textId) {
        const model = this.getLearningModel(diagram);
        const escape = value => this.escapeHtml(value);
        return `<div class="diagram-learning" id="${textId}">
            <p class="diagram-overview">${escape(model.overview)}</p>
            <p class="diagram-caveat"><strong>${diagram.type.startsWith('b-') ? 'Renderer correction / caveat. Generated source review blocked.' : 'Scope and provenance.'}</strong> ${escape(model.caveat)}</p>
            <ol class="diagram-state-list">${model.states.map((state, index) => `
                <li data-learning-step="${index + 1}" data-edge-kind="${state[3]}">
                    <span class="diagram-relation">${index + 1} · ${escape(state[3])}</span>
                    <strong>${escape(state[0])}</strong>
                    <span><b>Cause:</b> ${escape(state[1])}</span>
                    <span><b>Consequence:</b> ${escape(state[2])}</span>
                </li>`).join('')}</ol>
            <p class="diagram-failure"><strong>Failure branch:</strong> ${escape(model.failure)}</p>
        </div>`;
    },

    // ── Render API ──
    render(diagrams) {
        this.cleanup();
        const container = document.getElementById('tab-diagrams');
        if (!container) return;
        if (!diagrams || diagrams.length === 0) {
            container.innerHTML = '<p class="no-content">No visual diagrams for this module yet.</p>';
            return;
        }
        container.innerHTML = `<div class="diagrams-wrapper">${diagrams.map((d, index) => this.renderDiagram(d, index)).join('')}</div>`;
        // Synchronous init — rAF is throttled indefinitely in hidden/background tabs
        diagrams.forEach((d, index) => this.initDiagram(d, index));
    },

    renderPreview(diagram, container) {
        if (!diagram || !container) return;
        const id = String(diagram.id);
        const title = String(diagram.title || 'Core visual');
        const description = String(diagram.description || `Visual explanation of ${title}.`);
        const headingId = this.domId('preview-heading', id);
        const textId = this.domId('preview-text', id);
        container.innerHTML = `
            <div class="inline-visual-heading">
                <p class="mastery-eyebrow">Core visual</p>
                <h2 id="${headingId}">${this.escapeHtml(title)}</h2>
                <p>${this.escapeHtml(description)}</p>
            </div>
            ${this.renderLearningOverview(diagram, textId)}
            <details class="diagram-detail">
                <summary>Optional detailed diagram</summary>
                <p>Full SVG detail may scroll horizontally. The complete relationship is explained above.</p>
                <div class="diagram-canvas inline-diagram-canvas" data-step="0" tabindex="0" aria-label="Core visual: ${this.escapeHtml(title)}" aria-describedby="${textId}"></div>
            </details>
            <button type="button" class="btn-secondary" data-app-action="switch-tab" data-tab="diagrams">Open the complete visual walkthrough</button>`;
        const canvas = container.querySelector('.inline-diagram-canvas');
        const builder = this.builders[diagram.type] || this.builders._fallback;
        canvas.innerHTML = builder.call(this, diagram);
        const svg = canvas.querySelector('svg');
        if (!svg) return;
        svg.querySelectorAll('animateMotion').forEach(element => element.remove());
        const namespace = 'http://www.w3.org/2000/svg';
        const svgTitle = document.createElementNS(namespace, 'title');
        const svgDescription = document.createElementNS(namespace, 'desc');
        svgTitle.id = this.domId('preview-svg-title', id);
        svgDescription.id = this.domId('preview-svg-desc', id);
        svgTitle.textContent = title;
        const model = this.getLearningModel(diagram);
        svgDescription.textContent = `${model.overview} ${model.caveat} ${model.failure}`;
        svg.insertBefore(svgDescription, svg.firstChild);
        svg.insertBefore(svgTitle, svgDescription);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-labelledby', `${svgTitle.id} ${svgDescription.id}`);
    },

    cleanup() {
        this.activeAnimations.forEach(id => cancelAnimationFrame(id));
        this.activeAnimations = [];
    },

    renderDiagram(diagram, index) {
        const id = String(diagram.id);
        const title = String(diagram.title || 'Diagram');
        const wrapperId = this.domId('diagram', id, index);
        const headingId = this.domId('diagram-heading', id, index);
        const canvasId = this.domId('canvas', id);
        const textEquivalentId = this.domId('diagram-text', id, index);
        const stepInfoId = this.domId('stepinfo', id);
        const stepCountId = this.domId('stepcnt', id);
        const stepTextId = this.domId('steptxt', id);
        const description = String(diagram.description || `Visual explanation of ${title}.`);
        const steps = Array.isArray(diagram.steps) ? diagram.steps : [];
        const model = this.getLearningModel(diagram);
        return `
        <div class="visual-diagram" id="${wrapperId}" data-diagram-id="${this.escapeHtml(id)}">
            <div class="diagram-title-bar">
                <h3 id="${headingId}">${this.escapeHtml(title)}</h3>
                <div class="diagram-controls">
                    ${model.states.length > 0 ? `<button type="button" class="diag-btn diag-btn-step" data-diagram-action="step" aria-label="Next step for ${this.escapeHtml(title)}">Next step</button>
                    <button type="button" class="diag-btn" data-diagram-action="previous" aria-label="Previous step for ${this.escapeHtml(title)}" disabled>Previous</button>
                    <button type="button" class="diag-btn diag-btn-reset" data-diagram-action="reset" aria-label="Reset ${this.escapeHtml(title)}" disabled>Reset</button>` : ''}
                </div>
            </div>
            ${diagram.description ? `<p class="diagram-description">${diagram.type.startsWith('b-') ? '<strong>Original narrative (see correction below):</strong> ' : ''}${this.escapeHtml(description)}</p>` : ''}
            ${model.states.length > 0 ? `
            <div class="diagram-step-info" id="${stepInfoId}" role="status" aria-live="polite" aria-atomic="true">
                <div class="step-counter">Step <span id="${stepCountId}">0</span> / ${model.states.length}</div>
                <div class="step-text" id="${stepTextId}">Overview. Select Next step to inspect a cause and consequence.</div>
            </div>` : ''}
            ${this.renderLearningOverview(diagram, textEquivalentId)}
            <details class="diagram-source">
                <summary>Original source narrative${diagram.type.startsWith('b-') ? ' — pending source review' : ''}</summary>
                <p>${this.escapeHtml(description)}</p>
                <ol>${steps.map(step => `<li>${this.escapeHtml(step)}</li>`).join('')}</ol>
            </details>
            <details class="diagram-detail">
                <summary>Optional detailed diagram</summary>
                <p>Full SVG detail may scroll horizontally. The complete relationship is explained above. Read the correction/caveat alongside legacy detail.</p>
                <div class="diagram-canvas" id="${canvasId}" tabindex="0" aria-label="Scrollable diagram: ${this.escapeHtml(title)}" aria-describedby="${textEquivalentId}"></div>
            </details>
            ${diagram.legend ? `<div class="diagram-legend">${diagram.legend.map(l => `<span class="legend-item"><span class="legend-dot" style="background:${this.escapeHtml(l.color)}"></span>${this.escapeHtml(l.label)}</span>`).join('')}</div>` : ''}
        </div>`;
    },

    initDiagram(diagram, index) {
        const id = String(diagram.id);
        const canvas = document.getElementById(this.domId('canvas', id));
        if (!canvas) return;
        canvas.dataset.step = '0';
        canvas.dataset.playing = 'false';
        canvas._learningModel = this.getLearningModel(diagram);
        const builder = this.builders[diagram.type] || this.builders._fallback;
        canvas.innerHTML = builder.call(this, diagram);

        const svg = canvas.querySelector('svg');
        if (svg) {
            svg.querySelectorAll('animateMotion').forEach(element => element.remove());
            const namespace = 'http://www.w3.org/2000/svg';
            const titleId = this.domId('svg-title', id, index);
            const descriptionId = this.domId('svg-desc', id, index);
            const title = document.createElementNS(namespace, 'title');
            const description = document.createElementNS(namespace, 'desc');
            title.id = titleId;
            title.textContent = String(diagram.title || 'Diagram');
            description.id = descriptionId;
            const model = canvas._learningModel;
            description.textContent = [model.overview, model.caveat,
                ...model.states.map((state, stepIndex) => `Step ${stepIndex + 1}. ${state[0]}. Cause: ${state[1]} Consequence: ${state[2]}`),
                `Failure branch: ${model.failure}`].join(' ');
            svg.insertBefore(description, svg.firstChild);
            svg.insertBefore(title, description);
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-labelledby', `${titleId} ${descriptionId}`);
            svg.setAttribute('focusable', 'false');
        }

        const wrapper = canvas.closest('.visual-diagram');
        wrapper?.querySelector('[data-diagram-action="step"]')?.addEventListener('click', () => this.stepThrough(id));
        wrapper?.querySelector('[data-diagram-action="previous"]')?.addEventListener('click', () => this.previous(id));
        wrapper?.querySelector('[data-diagram-action="reset"]')?.addEventListener('click', () => this.reset(id));
        wrapper?.addEventListener('keydown', event => {
            if (!event.target.closest('[data-diagram-action]')) return;
            const actions = {
                ArrowRight: () => this.stepThrough(id),
                ArrowLeft: () => this.previous(id),
                Home: () => this.reset(id),
                End: () => this.setStep(id, canvas._learningModel.states.length)
            };
            if (!actions[event.key]) return;
            event.preventDefault();
            actions[event.key]();
        });
    },

    // Kept for callers of the old API; playback now advances one meaningful state.
    play(diagramId) {
        this.stepThrough(diagramId);
    },

    reset(diagramId) {
        this.setStep(diagramId, 0);
    },

    stepThrough(diagramId) {
        const canvas = document.getElementById(this.domId('canvas', diagramId));
        if (!canvas) return;
        this.setStep(diagramId, (Number(canvas.dataset.step) || 0) + 1);
    },

    previous(diagramId) {
        const canvas = document.getElementById(this.domId('canvas', diagramId));
        if (canvas) this.setStep(diagramId, (Number(canvas.dataset.step) || 0) - 1);
    },

    setStep(diagramId, requested) {
        const canvas = document.getElementById(this.domId('canvas', diagramId));
        if (!canvas?._learningModel) return;
        const model = canvas._learningModel;
        const step = Math.max(0, Math.min(model.states.length, Math.trunc(Number(requested)) || 0));
        canvas.dataset.step = step;
        canvas.dataset.playing = 'false';
        canvas.classList.remove('animating');
        const svg = canvas.querySelector('svg');
        if (svg) {
            svg.classList.remove('animate-all');
            svg.querySelectorAll('.step-highlight').forEach(el => el.classList.remove('active'));
            if (step > 0) {
                svg.querySelectorAll(`[data-step="${step}"]`).forEach(el => el.classList.add('active'));
            }
        }
        const stepTxt = document.getElementById(this.domId('steptxt', diagramId));
        const stepCnt = document.getElementById(this.domId('stepcnt', diagramId));
        if (stepCnt) stepCnt.textContent = step;
        const state = model.states[step - 1];
        if (stepTxt) stepTxt.textContent = state
            ? `${state[0]}. Cause: ${state[1]} Consequence: ${state[2]}${step === model.states.length ? ' Walkthrough complete. Use Previous or Reset to revisit.' : ''}`
            : 'Overview. Select Next step to inspect a cause and consequence.';
        const wrapper = canvas.closest('.visual-diagram');
        wrapper?.querySelectorAll('[data-learning-step]').forEach(element => {
            if (Number(element.dataset.learningStep) === step) element.setAttribute('aria-current', 'step');
            else element.removeAttribute('aria-current');
        });
        const next = wrapper?.querySelector('[data-diagram-action="step"]');
        const previous = wrapper?.querySelector('[data-diagram-action="previous"]');
        const reset = wrapper?.querySelector('[data-diagram-action="reset"]');
        if (next) next.disabled = step === model.states.length;
        if (previous) previous.disabled = step === 0;
        if (reset) reset.disabled = step === 0;
    },

    // ──────────────────────────────────────────────
    // BUILDER-TRACK HELPERS (ported from ai-builder-academy,
    // light-theme palette). Used by the b-* builders below.
    // ──────────────────────────────────────────────
    BC: {
        purple: '#7c3aed', blue: '#0ea5e9', green: '#059669', amber: '#d97706',
        red: '#dc2626', text: '#1f2937', sub: '#6b7280',
        node: '#ffffff', nodeBorder: '#d1d5db'
    },

    bArrow(color) {
        const id = 'ah-' + color.replace('#', '');
        return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L10,5 L0,9 Z" fill="${color}"/></marker>`;
    },

    bNode(n, fallback) {
        const c = n.color || fallback;
        const lines = (n.sub || '').split('\n');
        return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10"
                 fill="${this.BC.node}" stroke="${c}" stroke-width="2"/>
            ${n.icon ? `<text x="${n.x + n.w / 2}" y="${n.y + 24}" text-anchor="middle" font-size="18">${n.icon}</text>` : ''}
            <text x="${n.x + n.w / 2}" y="${n.y + (n.icon ? 44 : 24)}" text-anchor="middle" fill="${this.BC.text}" font-size="13" font-weight="700">${n.label}</text>
            ${lines.map((s, i) => `<text x="${n.x + n.w / 2}" y="${n.y + (n.icon ? 60 : 40) + i * 14}" text-anchor="middle" fill="${this.BC.sub}" font-size="10.5">${s}</text>`).join('')}`;
    },

    bEdgePath(a, b) {
        const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
        if (Math.abs(ac.y - bc.y) < 10) {
            const x1 = ac.x < bc.x ? a.x + a.w : a.x, x2 = ac.x < bc.x ? b.x : b.x + b.w;
            return `M ${x1} ${ac.y} L ${x2} ${bc.y}`;
        }
        if (Math.abs(ac.x - bc.x) < 10) {
            const y1 = ac.y < bc.y ? a.y + a.h : a.y, y2 = ac.y < bc.y ? b.y : b.y + b.h;
            return `M ${ac.x} ${y1} L ${bc.x} ${y2}`;
        }
        const x1 = ac.x < bc.x ? a.x + a.w : a.x;
        const y2 = ac.y < bc.y ? b.y : b.y + b.h;
        return `M ${x1} ${ac.y} L ${bc.x} ${ac.y} L ${bc.x} ${y2}`;
    },

    bCompletionSteps(diagram, configuredSteps, viewBox) {
        const steps = Array.isArray(diagram.steps) ? diagram.steps : [];
        if (steps.length <= configuredSteps) return '';
        const values = String(viewBox).split(/\s+/).map(Number);
        const width = values[2] || 860;
        const height = values[3] || 420;
        return steps.slice(configuredSteps).map((step, index) => {
            const stepNumber = configuredSteps + index + 1;
            const y = height - 42 - index * 34;
            const text = String(step);
            const concise = text.length > 92 ? `${text.slice(0, 89)}...` : text;
            return `<g data-step="${stepNumber}" class="step-highlight">
                <rect x="20" y="${y}" width="${width - 40}" height="30" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
                <text x="${width / 2}" y="${y + 19}" text-anchor="middle" fill="#047857" font-size="11" font-weight="700">${this.escapeHtml(concise)}</text>
            </g>`;
        }).join('');
    },

    // ──────────────────────────────────────────────
    // BUILDERS — one per diagram type
    // ──────────────────────────────────────────────
    builders: {

        /* ── Builder Track (b-*): config-driven, data in modules-builder.js ── */

        'b-pipeline'(d) {
            const { nodes, edges, viewBox = '0 0 860 420' } = d.data;
            const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
            const colors = [...new Set(edges.map(e => e.color || this.BC.purple))];
            const edgeSvg = edges.map(e => {
                const p = this.bEdgePath(byId[e.from], byId[e.to]);
                const c = e.color || this.BC.purple;
                return `<g ${e.step ? `data-step="${e.step}" class="step-highlight"` : ''}>
                    <path d="${p}" fill="none" stroke="${c}" stroke-width="2" ${e.dashed ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#ah-${c.replace('#','')})"/>
                    ${e.label ? `<text x="${(byId[e.from].x + byId[e.from].w / 2 + byId[e.to].x + byId[e.to].w / 2) / 2}" y="${(byId[e.from].y + byId[e.from].h / 2 + byId[e.to].y + byId[e.to].h / 2) / 2 - 8}" text-anchor="middle" fill="${this.BC.sub}" font-size="10.5" font-style="italic">${e.label}</text>` : ''}
                    ${e.dot !== false ? `<circle r="4.5" fill="${c}" class="flow-dot"><animateMotion dur="${e.dur || 2.2}s" repeatCount="indefinite" path="${p}"/></circle>` : ''}
                </g>`;
            }).join('');
            const nodeSvg = nodes.map(n =>
                `<g ${n.step ? `data-step="${n.step}" class="step-highlight"` : ''}>${this.bNode(n, this.BC.purple)}</g>`).join('');
            const configuredSteps = Math.max(0, ...nodes.map(node => node.step || 0), ...edges.map(edge => edge.step || 0));
            const completionSteps = this.bCompletionSteps(d, configuredSteps, viewBox);
            return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
                <defs>${colors.map(c => this.bArrow(c)).join('')}</defs>${edgeSvg}${nodeSvg}${completionSteps}</svg>`;
        },

        'b-layers'(d) {
            const { layers, viewBox = '0 0 860 400' } = d.data;
            const w = 640, x = 110, h = Math.min(58, 320 / layers.length - 10);
            const rows = layers.map((l, i) => {
                const y = 40 + i * (h + 14);
                return `<g ${l.step ? `data-step="${l.step}" class="step-highlight"` : ''}>
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${this.BC.node}" stroke="${l.color}" stroke-width="2"/>
                    <text x="${x + 18}" y="${y + h / 2 - 4}" fill="${this.BC.text}" font-size="13.5" font-weight="700">${l.label}</text>
                    <text x="${x + 18}" y="${y + h / 2 + 14}" fill="${this.BC.sub}" font-size="11">${l.sub || ''}</text>
                    ${l.tag ? `<text x="${x + w - 16}" y="${y + h / 2 + 5}" text-anchor="end" fill="${l.color}" font-size="11.5" font-weight="700">${l.tag}</text>` : ''}
                </g>
                ${i < layers.length - 1 ? `<line x1="${x + w / 2}" y1="${y + h}" x2="${x + w / 2}" y2="${y + h + 14}" stroke="${this.BC.nodeBorder}" stroke-width="2"/>` : ''}`;
            }).join('');
            const note = d.id === 'b-ft-lora'
                ? 'Illustrative adapter layers: efficiency does not establish held-out quality.'
                : d.type === 'phase-mapping'
                    ? 'Prerequisites need tested artifacts, not just completed headings.'
                    : 'Mitigations, not guarantees: delimiters and classifiers are not authorization boundaries.';
            const [vx, vy, width, height] = viewBox.split(/\s+/).map(Number);
            return `<svg viewBox="${vx} ${vy} ${width} ${height + 40}" preserveAspectRatio="xMidYMid meet">${rows}
                <text x="${width / 2}" y="${height + 22}" text-anchor="middle" fill="#1f2937" font-size="12">${note}</text></svg>`;
        },

        'b-bars'(d) {
            const { bars, series, viewBox = '0 0 860 420' } = d.data;
            const x0 = 250, wMax = 480, rowH = series ? 52 : 42;
            const rows = bars.map((b, i) => {
                const y = 70 + i * rowH;
                const w1 = b.value * wMax;
                let out = `<g ${b.step ? `data-step="${b.step}" class="step-highlight"` : ''}>
                    <text x="${x0 - 14}" y="${y + 15}" text-anchor="end" fill="${this.BC.text}" font-size="12.5" font-weight="600">${b.label}</text>
                    <rect x="${x0}" y="${y}" width="${wMax}" height="18" rx="4" fill="#eef0f4"/>
                    <rect x="${x0}" y="${y}" width="${w1}" height="18" rx="4" fill="${b.color || this.BC.purple}" class="bar-fill"/>
                    <text x="${x0 + w1 + 10}" y="${y + 14}" fill="${b.color || this.BC.purple}" font-size="12" font-weight="700">${b.display}</text>`;
                if (series && b.value2 !== undefined) {
                    const w2 = b.value2 * wMax;
                    out += `<rect x="${x0}" y="${y + 22}" width="${wMax}" height="18" rx="4" fill="#eef0f4"/>
                    <rect x="${x0}" y="${y + 22}" width="${w2}" height="18" rx="4" fill="${b.color2 || this.BC.blue}" class="bar-fill"/>
                    <text x="${x0 + w2 + 10}" y="${y + 36}" fill="${b.color2 || this.BC.blue}" font-size="12" font-weight="700">${b.display2}</text>`;
                }
                return out + '</g>';
            }).join('');
            const legend = series ? `
                <rect x="${x0}" y="30" width="14" height="14" rx="3" fill="${this.BC.purple}"/><text x="${x0 + 20}" y="42" fill="${this.BC.sub}" font-size="12">${series[0]}</text>
                <rect x="${x0 + 130}" y="30" width="14" height="14" rx="3" fill="${this.BC.blue}"/><text x="${x0 + 150}" y="42" fill="${this.BC.sub}" font-size="12">${series[1]}</text>` : '';
            const configuredSteps = Math.max(0, ...bars.map(bar => bar.step || 0));
            const completionSteps = this.bCompletionSteps(d, configuredSteps, viewBox);
            const [vx, vy, width, height] = viewBox.split(/\s+/).map(Number);
            return `<svg viewBox="${vx} ${vy} ${width} ${height + 45}" preserveAspectRatio="xMidYMid meet">${legend}${rows}${completionSteps}
                <text x="${width / 2}" y="${height + 25}" text-anchor="middle" fill="#1f2937" font-size="12">Illustrative legacy values: verify task quality, workload, units and reviewer cost; no universal winner.</text></svg>`;
        },

        'b-curves'(d) {
            const training = [1.0, 0.65, 0.35, 0.15];
            const validation = [1.1, 0.75, 0.8, 1.0];
            const success = [10, 15, 14, 11];
            const x = index => 90 + index * 190;
            const y = loss => 270 - loss * 160;
            const curve = values => values.map((loss, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(loss)}`).join(' ');
            return `<svg viewBox="0 0 860 460" preserveAspectRatio="xMidYMid meet">
                <text x="430" y="24" text-anchor="middle" fill="#1f2937" font-size="15" font-weight="700">Illustrative correction: training fit is not generalization</text>
                <text x="430" y="46" text-anchor="middle" fill="#4b5563" font-size="12">Synthetic checkpoints; mean token loss (nats/token), same scoring convention</text>
                <line x1="90" y1="270" x2="700" y2="270" stroke="#1f2937"/>
                <line x1="90" y1="70" x2="90" y2="270" stroke="#1f2937"/>
                ${[0, 0.5, 1].map(loss => `<text x="78" y="${y(loss) + 4}" text-anchor="end" fill="#4b5563" font-size="12">${loss.toFixed(1)}</text>`).join('')}
                <g data-step="1" class="step-highlight">
                    <path d="${curve(training)}" fill="none" stroke="#7c3aed" stroke-width="3"/>
                    <text x="105" y="325" fill="#4c1d95" font-size="13">Training loss: 1.00 → 0.65 → 0.35 → 0.15 (solid)</text>
                </g>
                <g data-step="2" class="step-highlight">
                    <path d="${curve(validation)}" fill="none" stroke="#0369a1" stroke-width="3" stroke-dasharray="8 5"/>
                    <text x="105" y="348" fill="#075985" font-size="13">Validation loss: 1.10 → 0.75 → 0.80 → 1.00 (dashed)</text>
                </g>
                ${training.map((_, index) => `<text x="${x(index)}" y="291" text-anchor="middle" fill="#4b5563" font-size="12">Checkpoint ${index + 1}</text>`).join('')}
                <g data-step="3" class="step-highlight">
                    <text x="105" y="377" fill="#1f2937" font-size="13" font-weight="700">Held-out task: successes / 20 separate cases</text>
                    ${success.map((count, index) => `<rect x="${x(index) - 25}" y="${425 - count * 2}" width="50" height="${count * 2}" fill="#047857"/>
                        <text x="${x(index)}" y="444" text-anchor="middle" fill="#1f2937" font-size="12">${count}/20 (${count * 5}%)</text>`).join('')}
                </g>
            </svg>`;
        },

        'b-graph'(d) {
            const { nodes, links, viewBox = '0 0 860 440' } = d.data;
            const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
            const linkSvg = links.map(l => {
                const a = byId[l.from], b = byId[l.to];
                return `<g ${l.step ? `data-step="${l.step}" class="step-highlight"` : ''}>
                    <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${l.hop ? this.BC.amber : this.BC.nodeBorder}" stroke-width="${l.hop ? 3 : 1.5}" class="${l.hop ? 'hop-edge' : ''}"/>
                    <text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 6}" text-anchor="middle" fill="${l.hop ? this.BC.amber : this.BC.sub}" font-size="9.5" font-style="italic">${l.label}</text>
                </g>`;
            }).join('');
            const nodeSvg = nodes.map(n => `
                <g ${n.step ? `data-step="${n.step}" class="step-highlight"` : ''}>
                    <circle cx="${n.x}" cy="${n.y}" r="26" fill="${this.BC.node}" stroke="${n.color}" stroke-width="2.5" class="graph-node"/>
                    <text x="${n.x}" y="${n.y - 2}" text-anchor="middle" fill="${this.BC.text}" font-size="10.5" font-weight="700">${n.label}</text>
                    <text x="${n.x}" y="${n.y + 11}" text-anchor="middle" fill="${n.color}" font-size="8.5">${n.type}</text>
                </g>`).join('');
            const [vx, vy, width, height] = viewBox.split(/\s+/).map(Number);
            return `<svg viewBox="${vx} ${vy} ${width} ${height + 50}" preserveAspectRatio="xMidYMid meet">${linkSvg}${nodeSvg}
                <g data-step="1" class="step-highlight">
                    <rect x="20" y="${height}" width="${width - 40}" height="40" rx="6" fill="#fff" stroke="#1f2937" stroke-dasharray="5 4"/>
                    <text x="${width / 2}" y="${height + 24}" text-anchor="middle" fill="#1f2937" font-size="12">Extracted assertions need source provenance; entity matches and graph edges may be wrong.</text>
                </g></svg>`;
        },

        'b-timeline'(d) {
            const audit = d.id === 'b-audit-trace';
            const lanes = [
                { x: 80, label: 'User / reviewer' }, { x: 250, label: 'Controller' },
                { x: 440, label: 'Policy' }, { x: 610, label: 'Tool A' }, { x: 780, label: 'Tool B' }
            ];
            const rows = [
                { from: 0, to: 1, label: 'Task + run ID + budget', kind: 'data' },
                { from: 1, to: 2, label: 'Propose call A and call B; validate schemas', kind: 'control' },
                { from: 2, to: 3, label: 'Authorize each call; denied → do not dispatch', kind: 'approval', also: 4 },
                { from: 4, to: 1, label: audit ? 'Results B then A: match each call ID; redact payload' : 'Result for call B arrives first; match B', kind: 'data' },
                ...(!audit ? [{ from: 3, to: 1, label: 'Result for call A, or explicit timeout', kind: 'data' }] : []),
                { from: 1, to: 0, label: 'Cancellation / budget / error / success → terminal state', kind: 'failure' },
                { from: 1, to: 0, label: 'Report outcome and evidence; no new calls after stop', kind: 'control' }
            ];
            const height = 150 + rows.length * 64;
            const rowSvg = rows.map((row, index) => {
                const y = 137 + index * 64;
                const color = row.kind === 'failure' ? '#991b1b' : '#1f2937';
                const dash = row.kind === 'control' ? '6 4' : row.kind === 'failure' ? '2 4' : '';
                return `<g data-step="${index + 1}" class="step-highlight">
                    <text x="430" y="${y - 12}" text-anchor="middle" fill="${color}" font-size="12">${index + 1}. ${row.kind}: ${this.escapeHtml(row.label)}</text>
                    <line x1="${lanes[row.from].x}" y1="${y}" x2="${lanes[row.to].x}" y2="${y}" stroke="${color}" stroke-width="${row.kind === 'approval' ? 3 : 2}" stroke-dasharray="${dash}" marker-end="url(#ah-${color.slice(1)})"/>
                    ${row.also ? `<line x1="${lanes[row.from].x}" y1="${y + 14}" x2="${lanes[row.also].x}" y2="${y + 14}" stroke="${color}" stroke-width="3" marker-end="url(#ah-${color.slice(1)})"/>` : ''}
                </g>`;
            }).join('');
            return `<svg viewBox="0 0 860 ${height}" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#1f2937', '#991b1b'])}</defs>
                <text x="430" y="24" text-anchor="middle" fill="#1f2937" font-size="15" font-weight="700">Illustrative sequence correction — original source narrative retained separately</text>
                ${lanes.map(lane => `<rect x="${lane.x - 70}" y="45" width="140" height="38" rx="6" fill="#fff" stroke="#1f2937"/>
                    <text x="${lane.x}" y="69" text-anchor="middle" fill="#1f2937" font-size="12">${lane.label}</text>
                    <line x1="${lane.x}" y1="83" x2="${lane.x}" y2="${height - 20}" stroke="#9ca3af" stroke-dasharray="3 4"/>`).join('')}
                ${rowSvg}
            </svg>`;
        },

        // 1. The AI stack — concentric labelled boxes
        'ai-stack'(d) {
            // Each layer is 35px taller than the next inner one, so the
            // visible top band is exactly 35px. Label + italic example must
            // both fit inside that band, otherwise the inner box covers them.
            const layers = [
                { label: 'Artificial Intelligence',  example: 'e.g. chess engines, fraud detection, spam filters', w: 720, h: 380, color: '#ddd6fe', text: '#4c1d95', sub: '#5b21b6' },
                { label: 'Machine Learning',         example: 'e.g. Netflix recommendations, demand forecasting',  w: 600, h: 310, color: '#c4b5fd', text: '#4c1d95', sub: '#5b21b6' },
                { label: 'Deep Learning',            example: 'e.g. image recognition, speech-to-text',            w: 480, h: 240, color: '#a78bfa', text: '#1e1b4b', sub: '#312e81' },
                { label: 'Generative deep models',   example: 'Modern subset, not all generative AI',               w: 360, h: 170, color: '#8b5cf6', text: '#fff',    sub: '#ede9fe' },
                { label: 'Generative LMs',           example: 'GPT · Claude · Gemini',                              w: 240, h: 100, color: '#7c3aed', text: '#fff',    sub: '#ede9fe', innermost: true }
            ];
            const cx = 400, cy = 220;
            const boxes = layers.map((l, i) => {
                const top = cy - l.h / 2;
                // Outer layers: stack label+example inside the 35px visible top band.
                // Innermost layer: centre the label + example vertically (no inner box to dodge).
                const labelY = l.innermost ? cy - 4 : top + 14;
                const exY    = l.innermost ? cy + 14 : top + 27;
                const labelSize = l.innermost ? 14 : 13;
                const exSize    = l.innermost ? 12 : 10;
                return `<g data-step="${i + 1}" class="step-highlight ai-stack-layer">
                    <rect x="${cx - l.w / 2}" y="${top}" width="${l.w}" height="${l.h}" rx="10" fill="${l.color}" stroke="#4c1d95" stroke-width="1.5"/>
                    <text x="${cx}" y="${labelY}" text-anchor="middle" fill="${l.text}" font-size="${labelSize}" font-weight="700">${l.label}</text>
                    <text x="${cx}" y="${exY}" text-anchor="middle" fill="${l.sub}" font-size="${exSize}" font-style="italic">${l.example}</text>
                </g>`;
            }).join('');
            return `<svg viewBox="0 0 800 440" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                ${boxes}
            </svg>`;
        },

        // 2. Tokenisation — text flowing into tokens
        'tokenisation'(d) {
            const text = '"The cat sat on the mat"';
            const tokens = ['"The', ' cat', ' sat', ' on', ' the', ' mat', '"'];
            const ids   = ['1820', '8415', '7423', '402', '1820', '17143', '1'];
            const startX = 80, tokenW = 80, gap = 8;
            const tokY = 200;

            const tokenGroups = tokens.map((t, i) => {
                const x = startX + i * (tokenW + gap);
                return `<g data-step="${i + 1}" class="step-highlight token-group">
                    <rect x="${x}" y="${tokY}" width="${tokenW}" height="48" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
                    <text x="${x + tokenW / 2}" y="${tokY + 20}" text-anchor="middle" fill="#4c1d95" font-size="13" font-family="ui-monospace,Consolas,monospace" font-weight="600">${t.replace(/ /g, '·')}</text>
                    <text x="${x + tokenW / 2}" y="${tokY + 38}" text-anchor="middle" fill="#7c3aed" font-size="10" font-family="ui-monospace,Consolas,monospace">id=${ids[i]}</text>
                </g>`;
            }).join('');

            return `<svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                <text x="400" y="60" text-anchor="middle" fill="#4c1d95" font-size="22" font-weight="700">Input text</text>
                <rect x="180" y="80" width="440" height="60" rx="8" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
                <text x="400" y="118" text-anchor="middle" fill="#1f2937" font-size="20" font-family="ui-monospace,Consolas,monospace">${text}</text>
                <text x="400" y="170" text-anchor="middle" fill="#6b7280" font-size="13" font-style="italic">↓ tokeniser splits into sub-word tokens ↓</text>
                ${tokenGroups}
                <text x="400" y="290" text-anchor="middle" fill="#4c1d95" font-size="14">Each token is converted to a numeric ID. The model sees only IDs.</text>
                <text x="400" y="320" text-anchor="middle" fill="#6b7280" font-size="12">Illustrative pieces and invented IDs · real counts vary by tokenizer, language and content</text>
            </svg>`;
        },

        // 3. Next-token prediction — top-k probability bars
        'next-token'(d) {
            const candidates = [
                { tok: 'sat',     p: 0.42 },
                { tok: 'jumped',  p: 0.18 },
                { tok: 'ran',     p: 0.12 },
                { tok: 'slept',   p: 0.08 },
                { tok: 'walked',  p: 0.05 },
                { tok: '… other tokens', p: 0.15 }
            ];
            const barX = 320, barY0 = 110, barH = 30, gap = 12, barMax = 360;
            const bars = candidates.map((c, i) => {
                const w = c.p * barMax;
                const y = barY0 + i * (barH + gap);
                const fill = i === 0 ? '#7c3aed' : i < 5 ? '#a78bfa' : '#d1d5db';
                return `<g data-step="${i + 1}" class="step-highlight">
                    <text x="${barX - 12}" y="${y + 20}" text-anchor="end" fill="#1f2937" font-size="13" font-family="ui-monospace,Consolas,monospace" font-weight="600">${c.tok}</text>
                    <rect x="${barX}" y="${y}" width="${w}" height="${barH}" rx="4" fill="${fill}"/>
                    <text x="${barX + w + 8}" y="${y + 20}" fill="#4c1d95" font-size="13" font-weight="600">${(c.p * 100).toFixed(0)}%</text>
                </g>`;
            }).join('');

            return `<svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet">
                <text x="400" y="40" text-anchor="middle" fill="#4c1d95" font-size="20" font-weight="700">Prompt: "The cat ___"</text>
                <text x="400" y="68" text-anchor="middle" fill="#6b7280" font-size="13">Illustrative probabilities; vocabulary and sampling depend on the model</text>
                <text x="400" y="92" text-anchor="middle" fill="#6b7280" font-size="12" font-style="italic">Top candidates shown · sampling picks one according to temperature</text>
                ${bars}
                <text x="400" y="395" text-anchor="middle" fill="#4c1d95" font-size="13">lower temperature favors "sat" · higher temperature spreads probability across candidates</text>
            </svg>`;
        },

        // 4. RAG pipeline — 5-stage flow
        'rag-pipeline'(d) {
            const stages = [
                { x: 80,  label: '1. Query',      sub: '"How does X work?"',    color: '#0ea5e9' },
                { x: 240, label: '2. Search',     sub: 'lexical / vector / hybrid', color: '#7c3aed' },
                { x: 400, label: '3. Filter',     sub: 'access + relevance',     color: '#7c3aed' },
                { x: 560, label: '4. Augment',    sub: 'prompt + chunks',        color: '#a78bfa' },
                { x: 720, label: '5. Answer',     sub: 'cite or abstain',        color: '#059669' }
            ];
            const boxes = stages.map((s, i) =>
                `<g data-step="${i + 1}" class="step-highlight">
                    <rect x="${s.x - 60}" y="180" width="120" height="80" rx="8" fill="#fff" stroke="${s.color}" stroke-width="2"/>
                    <text x="${s.x}" y="210" text-anchor="middle" fill="${s.color}" font-size="14" font-weight="700">${s.label}</text>
                    <text x="${s.x}" y="232" text-anchor="middle" fill="#4b5563" font-size="11">${s.sub}</text>
                </g>`
            ).join('');
            const arrows = stages.slice(0, -1).map((s, i) => {
                const x1 = s.x + 60, x2 = stages[i + 1].x - 60;
                return `<line x1="${x1}" y1="220" x2="${x2 - 8}" y2="220" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#ah-7c3aed)" class="anim-line"/>`;
            }).join('');

            // Vector DB cluster
            const dots = Array.from({ length: 14 }, (_, index) => {
                const cx = 315 + (index * 37) % 170;
                const cy = 58 + (index * 23) % 48;
                const r = 4 + index % 3;
                return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#a78bfa" opacity="0.6"/>`;
            });

            return `<svg viewBox="0 0 800 380" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                <rect x="280" y="40" width="240" height="100" rx="10" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="6"/>
                <text x="400" y="32" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="700">Vector database</text>
                ${dots.join('')}
                <line x1="400" y1="140" x2="400" y2="180" stroke="#7c3aed" stroke-width="1.4" stroke-dasharray="4" marker-end="url(#ah-7c3aed)"/>
                ${boxes}
                ${arrows}
                <text x="400" y="320" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">RAG supplies evidence, not guaranteed truth. Verify claims and citations.</text>
                <text x="400" y="345" text-anchor="middle" fill="#6b7280" font-size="11" font-style="italic">Embed at index time AND at query time using the SAME embedding model</text>
            </svg>`;
        },

        // 5. ReAct agent loop — circular flow
        'agent-loop'(d) {
            const cx = 400, cy = 200, r = 110;
            const nodes = [
                { angle: -90, label: 'Decision',    sub: 'conceptual, not hidden trace', color: '#7c3aed' },
                { angle: 30,  label: 'Approved action', sub: 'policy + budget gate', color: '#0ea5e9' },
                { angle: 150, label: 'Observation', sub: 'tool result',        color: '#059669' }
            ];
            const pts = nodes.map(n => {
                const rad = n.angle * Math.PI / 180;
                return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), ...n };
            });
            const boxes = pts.map((p, i) =>
                `<g data-step="${i + 1}" class="step-highlight">
                    <rect x="${p.x - 70}" y="${p.y - 28}" width="140" height="56" rx="10" fill="#fff" stroke="${p.color}" stroke-width="2.5"/>
                    <text x="${p.x}" y="${p.y - 6}" text-anchor="middle" fill="${p.color}" font-size="15" font-weight="700">${p.label}</text>
                    <text x="${p.x}" y="${p.y + 12}" text-anchor="middle" fill="#4b5563" font-size="11">${p.sub}</text>
                </g>`
            ).join('');
            const arcs = pts.map((p, i) => {
                const next = pts[(i + 1) % pts.length];
                return `<path d="M ${p.x},${p.y} A ${r * 0.95},${r * 0.95} 0 0,1 ${next.x},${next.y}"
                    fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#ah-7c3aed)" class="anim-line" stroke-dasharray="6 6"/>`;
            }).join('');
            return `<svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                <text x="400" y="40" text-anchor="middle" fill="#4c1d95" font-size="20" font-weight="700">ReAct: Reason + Act loop</text>
                ${boxes}
                <g data-step="4" class="step-highlight">
                    ${arcs}
                    <circle cx="${cx}" cy="${cy}" r="32" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
                    <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#4c1d95" font-size="11" font-weight="700">bounded</text>
                    <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#4c1d95" font-size="11" font-weight="700">loop</text>
                </g>
                <text x="400" y="365" text-anchor="middle" fill="#4b5563" font-size="12">Human approval where required; controller enforces step, time and cost budgets.</text>
                <text x="400" y="390" text-anchor="middle" fill="#4b5563" font-size="12">Stop: success · denied · cancelled · timeout · budget exhausted</text>
            </svg>`;
        },

        // 6. Tool / function calling — sequence diagram
        'tool-calling'(d) {
            const lanes = [
                { x: 140, label: 'User',     color: '#6b7280' },
                { x: 360, label: 'Model',    color: '#7c3aed' },
                { x: 580, label: 'Your app', color: '#0ea5e9' },
                { x: 720, label: 'Tool / API', color: '#059669' }
            ];
            const headers = lanes.map(l =>
                `<rect x="${l.x - 60}" y="40" width="120" height="36" rx="6" fill="${l.color}"/>
                 <text x="${l.x}" y="64" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">${l.label}</text>
                 <line x1="${l.x}" y1="76" x2="${l.x}" y2="380" stroke="#d1d5db" stroke-width="1" stroke-dasharray="3"/>`
            ).join('');
            const msgs = [
                { from: 0, to: 1, y: 110, text: '"What is the weather in Paris?"',                step: 1 },
                { from: 1, to: 2, y: 160, text: '{"tool_call": "get_weather", "args": {"city":"Paris"}}', step: 2, color: '#7c3aed' },
                { from: 2, to: 3, y: 210, text: 'validate + authorize → execute',              step: 3, color: '#0ea5e9' },
                { from: 3, to: 2, y: 250, text: '{"temp": 14, "cond": "rain"}',                  step: 4, color: '#059669', back: true },
                { from: 2, to: 1, y: 290, text: 'tool_result message',                            step: 5, color: '#0ea5e9', back: true },
                { from: 1, to: 0, y: 340, text: '"It is 14°C and raining in Paris."',            step: 6, color: '#7c3aed', back: true }
            ];
            const arrows = msgs.map(m => {
                const x1 = lanes[m.from].x, x2 = lanes[m.to].x;
                const c  = m.color || '#374151';
                return `<g data-step="${m.step}" class="step-highlight">
                    <line x1="${x1}" y1="${m.y}" x2="${x2}" y2="${m.y}" stroke="${c}" stroke-width="2" marker-end="url(#ah-${c.replace('#','')})" class="anim-line"/>
                    <text x="${(x1 + x2) / 2}" y="${m.y - 6}" text-anchor="middle" fill="${c}" font-size="11" font-family="ui-monospace,Consolas,monospace">${m.text}</text>
                </g>`;
            }).join('');
            const colors = ['#374151', '#7c3aed', '#0ea5e9', '#059669'];
            return `<svg viewBox="0 0 800 430" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(colors)}</defs>
                ${headers}
                ${arrows}
                <text x="400" y="409" text-anchor="middle" fill="#991b1b" font-size="12">Malformed / denied → no execution. Timeout / invalid result → explicit failure.</text>
            </svg>`;
        },

        // 7. MCP architecture — client/server with surfaces
        'mcp-architecture'(d) {
            return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed', '#0ea5e9'])}</defs>
                <!-- Client (host app) -->
                <g data-step="1" class="step-highlight">
                    <rect x="40" y="80" width="240" height="240" rx="12" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
                    <text x="160" y="108" text-anchor="middle" fill="#4c1d95" font-size="15" font-weight="700">Host application</text>
                    <text x="160" y="128" text-anchor="middle" fill="#6b7280" font-size="11">(Claude Desktop, Copilot, IDE…)</text>
                    <rect x="70" y="150" width="180" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed"/>
                    <text x="160" y="175" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">LLM agent</text>
                    <rect x="70" y="200" width="180" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed"/>
                    <text x="160" y="225" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">MCP client connection</text>
                </g>

                <!-- Transport -->
                <g data-step="2" class="step-highlight">
                    <line x1="280" y1="200" x2="520" y2="200" stroke="#7c3aed" stroke-width="2" marker-end="url(#ah-7c3aed)" stroke-dasharray="6" class="anim-line"/>
                    <line x1="520" y1="220" x2="280" y2="220" stroke="#0ea5e9" stroke-width="2" marker-end="url(#ah-0ea5e9)" stroke-dasharray="6" class="anim-line"/>
                    <text x="400" y="168" text-anchor="middle" fill="#4c1d95" font-size="11">Negotiate version + capabilities</text>
                    <text x="400" y="186" text-anchor="middle" fill="#4c1d95" font-size="12" font-weight="600">JSON-RPC</text>
                    <text x="400" y="246" text-anchor="middle" fill="#6b7280" font-size="11">stdio · Streamable HTTP</text>
                    <text x="400" y="270" text-anchor="middle" fill="#991b1b" font-size="11">Auth + host consent are separate</text>
                </g>

                <!-- Server -->
                <g data-step="3" class="step-highlight">
                    <rect x="520" y="80" width="240" height="240" rx="12" fill="#fff" stroke="#0ea5e9" stroke-width="2"/>
                    <text x="640" y="108" text-anchor="middle" fill="#0c4a6e" font-size="15" font-weight="700">MCP Server</text>
                    <text x="640" y="128" text-anchor="middle" fill="#6b7280" font-size="11">(GitHub, Filesystem, custom…)</text>
                    <rect x="550" y="148" width="180" height="34" rx="6" fill="#e0f2fe" stroke="#0ea5e9"/>
                    <text x="640" y="170" text-anchor="middle" fill="#0c4a6e" font-size="12" font-weight="600">🛠 tools (functions)</text>
                    <rect x="550" y="190" width="180" height="34" rx="6" fill="#e0f2fe" stroke="#0ea5e9"/>
                    <text x="640" y="212" text-anchor="middle" fill="#0c4a6e" font-size="12" font-weight="600">📄 resources (data)</text>
                    <rect x="550" y="232" width="180" height="34" rx="6" fill="#e0f2fe" stroke="#0ea5e9"/>
                    <text x="640" y="254" text-anchor="middle" fill="#0c4a6e" font-size="12" font-weight="600">💬 prompts (templates)</text>
                </g>

                <text x="400" y="365" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">Check versions, transport, negotiated capabilities, permissions, and host support.</text>
            </svg>`;
        },

        // 8. Multi-agent orchestrator — fan-out
        'multi-agent'(d) {
            const orch = { x: 400, y: 80 };
            const workers = [
                { x: 130, label: 'Researcher', sub: 'web search',     color: '#0ea5e9' },
                { x: 290, label: 'Writer',     sub: 'drafting',       color: '#7c3aed' },
                { x: 510, label: 'Coder',      sub: 'implementation', color: '#059669' },
                { x: 670, label: 'Reviewer',   sub: 'critique',       color: '#dc2626' }
            ];
            const wY = 240;
            const orchG = `<g data-step="1" class="step-highlight">
                <rect x="${orch.x - 100}" y="${orch.y - 30}" width="200" height="60" rx="10" fill="#7c3aed"/>
                <text x="${orch.x}" y="${orch.y - 6}" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">Orchestrator</text>
                <text x="${orch.x}" y="${orch.y + 14}" text-anchor="middle" fill="#ede9fe" font-size="11">plans · dispatches · merges</text>
            </g>`;
            const wG = workers.map((w, i) =>
                `<g data-step="${i + 2}" class="step-highlight">
                    <rect x="${w.x - 70}" y="${wY}" width="140" height="60" rx="10" fill="#fff" stroke="${w.color}" stroke-width="2"/>
                    <text x="${w.x}" y="${wY + 26}" text-anchor="middle" fill="${w.color}" font-size="14" font-weight="700">${w.label}</text>
                    <text x="${w.x}" y="${wY + 44}" text-anchor="middle" fill="#4b5563" font-size="11">${w.sub}</text>
                    ${i === 0 || i === 2 ? `<line x1="${orch.x}" y1="${orch.y + 30}" x2="${w.x}" y2="${wY - 4}" stroke="${w.color}" stroke-width="1.6" marker-end="url(#ah-${w.color.replace('#','')})"/>` : ''}
                    ${i === 1 ? `<path d="M 200 270 L 220 270" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#ah-7c3aed)"/>` : ''}
                    ${i === 3 ? `<path d="M 580 270 L 600 270 M 290 300 L 290 320 L 670 320 L 670 300" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#ah-dc2626)"/>` : ''}
                </g>`
            ).join('');
            return `<svg viewBox="0 0 800 380" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#0ea5e9', '#7c3aed', '#059669', '#dc2626'])}</defs>
                <text x="400" y="36" text-anchor="middle" fill="#4c1d95" font-size="18" font-weight="700">Orchestrator–Worker Pattern</text>
                ${orchG}${wG}
                <text x="400" y="345" text-anchor="middle" fill="#4b5563" font-size="13">Research → Writer; Writer + independent Coder → Reviewer</text>
                <text x="400" y="366" text-anchor="middle" fill="#6b7280" font-size="11">Only independent branches run in parallel. Compare with a single-agent baseline.</text>
            </svg>`;
        },

        // 9. Embedding space — 2D scatter with clusters
        'embedding-space'(d) {
            const clusters = [
                { color: '#7c3aed', label: 'Animals',     points: [[160, 110], [180, 140], [140, 150], [175, 185], [220, 120], [115, 205]] },
                { color: '#0ea5e9', label: 'Vehicles',    points: [[480, 110], [510, 140], [460, 165], [530, 130], [500, 180], [475, 145]] },
                { color: '#059669', label: 'Programming', points: [[280, 280], [320, 300], [260, 310], [310, 270], [450, 300]] },
                { color: '#dc2626', label: 'Food',        points: [[600, 290], [630, 270], [580, 310], [640, 305], [610, 320]] }
            ];
            const labels = ['cat', 'dog', 'rabbit', 'horse', 'cow', 'sheep', 'car', 'truck', 'bike', 'bus', 'plane', 'boat', 'python', 'javascript', 'rust', 'go', 'java', 'pizza', 'sushi', 'curry', 'pasta', 'tacos'];
            let li = 0;
            // Wrap each cluster in its own data-step group so Step controls highlight one cluster at a time.
            const dots = clusters.map((c, i) => {
                const inner = c.points.map(p => {
                    const lbl = labels[li++] || '';
                    return `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${c.color}" opacity="0.85"/><text x="${p[0] + 10}" y="${p[1] + 4}" fill="#1f2937" font-size="11">${lbl}</text>`;
                }).join('');
                return `<g data-step="${i + 1}" class="step-highlight">${inner}</g>`;
            }).join('');

            // Highlighted query point + nearest neighbour line (step 5)
            const query = { x: 245, y: 185 };
            const nearest = { x: 175, y: 185 };
            const queryGroup = `<g data-step="5" class="step-highlight">
                <circle cx="${query.x}" cy="${query.y}" r="10" fill="none" stroke="#dc2626" stroke-width="2"/>
                <text x="${query.x + 14}" y="${query.y - 8}" fill="#dc2626" font-size="11" font-weight="700">query: "kitten"</text>
                <line x1="${query.x}" y1="${query.y}" x2="${nearest.x + 6}" y2="${nearest.y + 2}" stroke="#dc2626" stroke-width="1.5" marker-end="url(#ah-dc2626)" stroke-dasharray="4"/>
            </g>`;

            return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#dc2626'])}</defs>
                <rect x="40" y="60" width="720" height="300" rx="8" fill="#fafafa" stroke="#d1d5db"/>
                <text x="400" y="40" text-anchor="middle" fill="#4c1d95" font-size="16" font-weight="700">Embedding space (2-D projection of high-dimensional vectors)</text>
                ${dots}
                ${queryGroup}
                <text x="400" y="386" text-anchor="middle" fill="#4b5563" font-size="12">Illustrative projection loses distances. Near horse is not evidence for a kitten-care answer.</text>
            </svg>`;
        },

        // 10. Context-window decay — line chart accuracy vs position
        'context-decay'(d) {
            const w = 700, h = 240, x0 = 60, y0 = 40;
            // U-shaped curve: high at start, dip in middle, slight rise at end
            const pts = [];
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const u = 0.95 - 0.55 * Math.sin(Math.PI * t) + 0.10 * (t > 0.85 ? 1 : 0) - 0.04 * t;
                const x = x0 + t * w;
                const y = y0 + (1 - Math.max(0, Math.min(1, u))) * h;
                pts.push(`${x},${y}`);
            }
            const polyline = `<polyline points="${pts.join(' ')}" fill="none" stroke="#7c3aed" stroke-width="2.5" class="anim-line"/>`;

            // Axes
            const axes = `
                <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + h}" stroke="#1f2937" stroke-width="1.5"/>
                <line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="#1f2937" stroke-width="1.5"/>
                <text x="${x0 - 14}" y="${y0 + 10}" text-anchor="end" fill="#1f2937" font-size="11">100%</text>
                <text x="${x0 - 14}" y="${y0 + h / 2}" text-anchor="end" fill="#1f2937" font-size="11">50%</text>
                <text x="${x0 - 14}" y="${y0 + h}" text-anchor="end" fill="#1f2937" font-size="11">0%</text>
                <text x="${x0}" y="${y0 + h + 22}" fill="#1f2937" font-size="12">start</text>
                <text x="${x0 + w / 2}" y="${y0 + h + 22}" text-anchor="middle" fill="#1f2937" font-size="12">middle of context</text>
                <text x="${x0 + w}" y="${y0 + h + 22}" text-anchor="end" fill="#1f2937" font-size="12">end</text>
                <text x="${x0 + w / 2}" y="${y0 - 10}" text-anchor="middle" fill="#4c1d95" font-size="14" font-weight="700">Illustrative position effect — not a benchmark</text>`;

            // Annotations (steps)
            const annot = `
                <g data-step="1" class="step-highlight">
                    <circle cx="${x0 + 30}" cy="${y0 + 30}" r="6" fill="#059669"/>
                    <text x="${x0 + 42}" y="${y0 + 34}" fill="#059669" font-size="12" font-weight="600">Possible start-position advantage</text>
                </g>
                <g data-step="2" class="step-highlight">
                    <circle cx="${x0 + w / 2}" cy="${y0 + h - 40}" r="6" fill="#dc2626"/>
                    <text x="${x0 + w / 2 + 12}" y="${y0 + h - 36}" fill="#dc2626" font-size="12" font-weight="600">Possible middle-position failure</text>
                </g>
                <g data-step="3" class="step-highlight">
                    <circle cx="${x0 + w - 40}" cy="${y0 + 50}" r="6" fill="#7c3aed"/>
                    <text x="${x0 + w - 50}" y="${y0 + 46}" text-anchor="end" fill="#7c3aed" font-size="12" font-weight="600">Possible end-position advantage</text>
                </g>`;

            return `<svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet">
                ${axes}${polyline}${annot}
                <text x="400" y="340" text-anchor="middle" fill="#4b5563" font-size="12" font-style="italic">Measure your model and task; compare retrieval, ordering, and summaries on held-out cases.</text>
            </svg>`;
        },

        'claude-code-workflow'(d) {
            const colors = ['#7c3aed','#059669','#2563eb','#d97706','#dc2626'];
            const defs = this.arrowDefs ? DiagramEngine.arrowDefs(colors) : '';
            const boxes = [
                { x: 50,  y: 30,  w: 130, h: 50, label: 'CLAUDE.md',       sub: 'Project context',     fill: '#ede9fe', stroke: '#7c3aed', step: 1 },
                { x: 50,  y: 110, w: 130, h: 50, label: 'User Prompt',     sub: '"Add auth to API"',    fill: '#ecfdf5', stroke: '#059669', step: 1 },
                { x: 250, y: 70,  w: 140, h: 50, label: '🧠 Claude Code',  sub: 'Plan & reason',        fill: '#f0f0ff', stroke: '#2563eb', step: 2 },
                { x: 460, y: 30,  w: 120, h: 44, label: 'Read Files',      sub: 'grep · glob · view',   fill: '#fefce8', stroke: '#d97706', step: 3 },
                { x: 460, y: 86,  w: 120, h: 44, label: 'Edit Code',       sub: 'create · edit',        fill: '#fefce8', stroke: '#d97706', step: 4 },
                { x: 460, y: 142, w: 120, h: 44, label: 'Run Commands',    sub: 'test · build · lint',  fill: '#fefce8', stroke: '#d97706', step: 5 },
                { x: 460, y: 198, w: 120, h: 44, label: 'MCP Tools',       sub: 'DB · API · search',    fill: '#fefce8', stroke: '#d97706', step: 6 },
                { x: 650, y: 100, w: 120, h: 50, label: 'Human review',    sub: 'diff + independent tests', fill: '#ecfdf5', stroke: '#059669', step: 7 }
            ];
            const arrows = [
                { x1: 180, y1: 55,  x2: 248, y2: 85,  c: '#7c3aed' },
                { x1: 180, y1: 135, x2: 248, y2: 105, c: '#059669' },
                { x1: 390, y1: 95,  x2: 458, y2: 52,  c: '#2563eb' },
                { x1: 390, y1: 95,  x2: 458, y2: 108, c: '#2563eb' },
                { x1: 390, y1: 95,  x2: 458, y2: 164, c: '#2563eb' },
                { x1: 390, y1: 95,  x2: 458, y2: 220, c: '#2563eb' },
                { x1: 580, y1: 108, x2: 648, y2: 120, c: '#d97706' },
                { x1: 580, y1: 164, x2: 648, y2: 130, c: '#d97706' }
            ];
            const rects = boxes.map(b => `
                <g data-step="${b.step}" class="step-highlight">
                    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8" fill="${b.fill}" stroke="${b.stroke}" stroke-width="1.5"/>
                    <text x="${b.x + b.w/2}" y="${b.y + 20}" text-anchor="middle" fill="#1f2937" font-size="12" font-weight="700">${b.label}</text>
                    <text x="${b.x + b.w/2}" y="${b.y + 36}" text-anchor="middle" fill="#6b7280" font-size="10">${b.sub}</text>
                </g>`).join('');
            const lines = arrows.map(a => `<line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="${a.c}" stroke-width="1.5" marker-end="url(#ah-${a.c.replace('#','')})"/>`).join('');
            return `<svg viewBox="0 0 800 280" preserveAspectRatio="xMidYMid meet">
                <defs>${defs}</defs>
                <text x="400" y="18" text-anchor="middle" fill="#4c1d95" font-size="14" font-weight="700">Claude Code Agentic Workflow</text>
                ${lines}${rects}
                <text x="400" y="270" text-anchor="middle" fill="#4b5563" font-size="11">Read → plan → permitted edit → test → human review. Commit needs separate approval.</text>
            </svg>`;
        },

        'fullstack-deploy'(d) {
            const colors = ['#7c3aed','#059669','#2563eb','#d97706','#dc2626'];
            const defs = DiagramEngine.arrowDefs(colors);
            const layers = [
                { x: 20,  y: 40,  w: 160, h: 200, label: 'Frontend',       items: ['React / Next.js','Tailwind CSS','Vercel / Pages'], fill: '#ede9fe', stroke: '#7c3aed' },
                { x: 210, y: 40,  w: 160, h: 200, label: 'Backend API',    items: ['FastAPI / Express','Auth middleware','Rate limiting'], fill: '#ecfdf5', stroke: '#059669' },
                { x: 400, y: 40,  w: 160, h: 200, label: 'AI Layer',       items: ['LLM API calls','RAG pipeline','Agent orchestration'], fill: '#dbeafe', stroke: '#2563eb' },
                { x: 590, y: 40,  w: 160, h: 200, label: 'Infrastructure', items: ['Vector DB','PostgreSQL','Redis cache'], fill: '#fefce8', stroke: '#d97706' }
            ];
            const layerSvg = layers.map((l, i) => {
                const itemsHtml = l.items.map((item, j) =>
                    `<text x="${l.x + l.w/2}" y="${l.y + 75 + j * 28}" text-anchor="middle" fill="#374151" font-size="11">• ${item}</text>`
                ).join('');
                return `
                <g data-step="${i + 1}" class="step-highlight">
                    <rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="10" fill="${l.fill}" stroke="${l.stroke}" stroke-width="1.5"/>
                    <text x="${l.x + l.w/2}" y="${l.y + 24}" text-anchor="middle" fill="#1f2937" font-size="13" font-weight="700">${l.label}</text>
                    <line x1="${l.x + 10}" y1="${l.y + 36}" x2="${l.x + l.w - 10}" y2="${l.y + 36}" stroke="${l.stroke}" stroke-width="0.5"/>
                    ${itemsHtml}
                </g>`;
            }).join('');
            const arrows = [
                `<line x1="180" y1="140" x2="208" y2="140" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#ah-7c3aed)"/>`,
                `<line x1="370" y1="140" x2="398" y2="140" stroke="#059669" stroke-width="1.5" marker-end="url(#ah-059669)"/>`,
                `<line x1="560" y1="140" x2="588" y2="140" stroke="#2563eb" stroke-width="1.5" marker-end="url(#ah-2563eb)"/>`
            ].join('');
            const cicd = `
                <g data-step="5" class="step-highlight">
                    <rect x="20" y="265" width="730" height="40" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1"/>
                    <text x="385" y="290" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="700">Release control: Build → Test → Stage → Monitor → Rollout / Rollback</text>
                </g>`;
            return `<svg viewBox="0 0 780 320" preserveAspectRatio="xMidYMid meet">
                <defs>${defs}</defs>
                <text x="390" y="24" text-anchor="middle" fill="#4c1d95" font-size="14" font-weight="700">Full-Stack AI Application Architecture</text>
                ${layerSvg}${arrows}${cicd}
            </svg>`;
        },

        'capstone-architecture'(d) {
            const nodes = [
                { id: 'ui', x: 20, y: 170, w: 130, h: 82, label: 'Web interface', sub: 'upload + chat', icon: '🖥️', color: '#7c3aed', step: 1 },
                { id: 'api', x: 190, y: 170, w: 140, h: 82, label: 'FastAPI', sub: 'identity + authorization', icon: '🔌', color: '#0ea5e9', step: 2 },
                { id: 'ingest', x: 380, y: 35, w: 160, h: 92, label: 'Ingestion', sub: 'extract · chunk\nembed', icon: '📄', color: '#d97706', step: 3 },
                { id: 'store', x: 650, y: 35, w: 170, h: 92, label: 'Vector store', sub: 'source IDs + access\nretention + deletion', icon: '🧭', color: '#059669', step: 4 },
                { id: 'query', x: 380, y: 285, w: 160, h: 92, label: 'RAG query', sub: 'retrieve + filter\nabstain if no evidence', icon: '🔎', color: '#7c3aed', step: 5 },
                { id: 'model', x: 650, y: 285, w: 170, h: 92, label: 'LLM response', sub: 'cited claims or error\ntrace failures safely', icon: '✨', color: '#dc2626', step: 6 }
            ];
            const edges = [
                { from: 'ui', to: 'api', label: 'HTTPS', color: '#7c3aed', step: 2 },
                { from: 'api', to: 'ingest', label: 'documents', color: '#d97706', step: 3 },
                { from: 'ingest', to: 'store', label: 'upsert', color: '#059669', step: 4 },
                { from: 'api', to: 'query', label: 'question', color: '#0ea5e9', step: 5 },
                { from: 'query', to: 'store', label: 'top-k', color: '#059669', step: 5, dashed: true },
                { from: 'query', to: 'model', label: 'grounded prompt', color: '#7c3aed', step: 6 }
            ];
            return this.builders['b-pipeline'].call(this, { ...d, data: { nodes, edges, viewBox: '0 0 860 420' } });
        },

        'phase-mapping'(d) {
            const layers = [
                { label: 'Phases 0–1 · Model and prompt foundations', sub: 'Tokens, limits, testable instructions, and output contracts', color: '#7c3aed', tag: 'FOUNDATION', step: 1 },
                { label: 'Phase 3 · Provider SDK integration', sub: 'API calls, schemas, errors, secrets, and retries', color: '#0ea5e9', tag: 'RUNTIME', step: 2 },
                { label: 'Phase 4 · Retrieval-augmented generation', sub: 'Ingest, retrieve, ground, cite, and evaluate', color: '#059669', tag: 'KNOWLEDGE', step: 3 },
                { label: 'Phases 5–6 · Tools and bounded agents', sub: 'Validated tool contracts, loops, budgets, and stop conditions', color: '#d97706', tag: 'ORCHESTRATION', step: 4 },
                { label: 'Phase 9 · Optional MCP interface', sub: 'Expose the Q&A capability through a permissioned server', color: '#7c3aed', tag: 'ECOSYSTEM', step: 5 },
                { label: 'Phase 10 · Production deployment', sub: 'API, container, telemetry, rollout, and rollback', color: '#0ea5e9', tag: 'OPERATIONS', step: 6 },
                { label: 'Phases 11–12 · Product and expert review', sub: 'Tenant safety, unit economics, reliability, and architecture judgment', color: '#dc2626', tag: 'SHIP GATE', step: 7 }
            ];
            return this.builders['b-layers'].call(this, { ...d, data: { layers, viewBox: '0 0 860 500' } });
        },

        // Fallback
        '_fallback'(d) {
            return `<svg viewBox="0 0 800 200"><text x="400" y="100" text-anchor="middle" fill="#6b7280" font-size="14">Diagram type "${d.type}" not yet implemented.</text></svg>`;
        }
    }
};
