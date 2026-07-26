/* Observable outcomes, diagnostics, and transfer evidence for the AI track. */
const AI_MASTERY_RUBRIC = Object.freeze([
    Object.freeze({ id: 'correctness', label: 'Technical correctness', description: 'The solution works and applies the module concepts accurately.' }),
    Object.freeze({ id: 'evidence', label: 'Verification evidence', description: 'Tests, evals, traces, or measured results support the claims.' }),
    Object.freeze({ id: 'judgment', label: 'Tradeoff judgment', description: 'The learner explains alternatives, risks, cost, and why this choice fits.' }),
    Object.freeze({ id: 'communication', label: 'Clear explanation', description: 'A reviewer can understand, reproduce, and challenge the work.' })
]);

const defineAiMastery = (outcome, prerequisites, prompt, artifact) => Object.freeze({
    outcome,
    prerequisites: Object.freeze(prerequisites),
    transfer: Object.freeze({ prompt, artifact, rubric: AI_MASTERY_RUBRIC })
});

const ACADEMY_MASTERY = Object.freeze({
    activityIds: Object.freeze([
        'ai-stack', 'tokenisation', 'next-token', 'rag-pipeline', 'embedding-space',
        'tool-calling', 'agent-loop', 'multi-agent', 'mcp-architecture', 'context-decay'
    ]),
    diagnostic: Object.freeze({
        title: 'AI mastery diagnostic',
        description: 'Ten questions route you to the earliest competency that needs practice. This is not a grade.',
        questions: Object.freeze([
            Object.freeze({ moduleId: 'phase0-orientation', question: 'What does an LLM do during inference?', options: ['Looks up a stored final answer', 'Predicts tokens from the current context', 'Retrains its weights for every prompt', 'Searches the web automatically'], correct: 1 }),
            Object.freeze({ moduleId: 'phase1-prompting', question: 'Which prompt is easiest to evaluate reliably?', options: ['Write something good', 'Be creative and comprehensive', 'Return JSON matching this schema and these three test cases', 'Think harder'], correct: 2 }),
            Object.freeze({ moduleId: 'phase2-platforms', question: 'What should drive platform selection first?', options: ['The newest brand name', 'Task, data boundary, quality, latency, and cost', 'The longest context window', 'The most expensive plan'], correct: 1 }),
            Object.freeze({ moduleId: 'phase3-ai-from-code', question: 'Where should an API key be stored for a local application?', options: ['Inside committed source code', 'In the browser URL', 'In an environment variable excluded from Git', 'In the README'], correct: 2 }),
            Object.freeze({ moduleId: 'phase4-memory-rag', question: 'A grounded answer is wrong because the useful passage was never retrieved. Which layer failed first?', options: ['Generation', 'Retrieval', 'Formatting', 'Authentication'], correct: 1 }),
            Object.freeze({ moduleId: 'phase5-tool-use', question: 'What makes a tool contract reliable?', options: ['A long tool name', 'Typed inputs, bounded outputs, and explicit errors', 'Unlimited retries', 'Hidden side effects'], correct: 1 }),
            Object.freeze({ moduleId: 'phase6-agents', question: 'When is a deterministic workflow usually better than an agent?', options: ['When steps and decisions are known in advance', 'Whenever a model is available', 'When no test exists', 'When cost is irrelevant'], correct: 0 }),
            Object.freeze({ moduleId: 'pm-evals', question: 'What should an AI release gate compare?', options: ['Only a demo', 'Quality, safety, latency, and cost on representative cases', 'Only token count', 'Only user sentiment'], correct: 1 }),
            Object.freeze({ moduleId: 'phase9-mcp-skills', question: 'What must an MCP client treat as a trust boundary?', options: ['Only the model name', 'Tool discovery, authorization, inputs, outputs, and side effects', 'Only the transport port', 'Only the UI theme'], correct: 1 }),
            Object.freeze({ moduleId: 'phase13-capstone', question: 'What best demonstrates AI system mastery?', options: ['A completion checkbox', 'A working artifact with tests, evals, tradeoffs, and a defense', 'A copied tutorial', 'A high token count'], correct: 1 })
        ])
    }),
    modules: Object.freeze({
        'phase0-orientation': defineAiMastery(
            'Explain tokens, context, inference, model limits, and evaluation without relying on vendor marketing.',
            [],
            'Explain an unfamiliar AI product to a technical PM, identify what the model does and does not guarantee, and correct three common misconceptions.',
            'ai-orientation-teachback.md'
        ),
        'phase1-prompting': defineAiMastery(
            'Turn an ambiguous request into a testable specification with context, constraints, examples, and an output contract.',
            ['phase0-orientation'],
            'Choose a real TPM task that is not used in the lesson, write a production prompt, create five pass/fail tests, and revise the prompt from the failures.',
            'prompt-spec-and-tests.md'
        ),
        'phase2-platforms': defineAiMastery(
            'Select an AI product or API using task fit, data boundaries, quality, latency, cost, and change risk.',
            ['phase1-prompting'],
            'Compare three current platforms on one real workflow using the same inputs and rubric, then write a one-page recommendation with confidence and caveats.',
            'platform-decision-memo.md'
        ),
        'phase3-ai-from-code': defineAiMastery(
            'Build a small API client that protects secrets, validates structured output, handles errors, and records basic usage.',
            ['phase1-prompting'],
            'Build a tested command-line assistant for a new domain using one current provider SDK, structured output, environment-based secrets, and three failure tests.',
            'tested-cli-assistant/'
        ),
        'landscape-2026-ai-systems': defineAiMastery(
            'Separate durable AI architecture concepts from volatile model, price, context, and product availability claims.',
            ['phase0-orientation'],
            'Create a dated model-selection brief for three workload types, cite only first-party catalogs, and mark every volatile claim with its review date.',
            'current-model-selection-brief.md'
        ),
        'zero-to-claude-companion': defineAiMastery(
            'Demonstrate the terminal, Git, HTTP, and repository habits required for safe AI-assisted development.',
            ['phase0-orientation'],
            'Create a small repository from the terminal, make two reviewable commits, inspect an HTTP response, and document how an agent should validate future changes.',
            'developer-readiness-repo/'
        ),
        'phase4-memory-rag': defineAiMastery(
            'Design, build, and evaluate a retrieval pipeline using representative data and retrieval plus answer-quality metrics.',
            ['phase3-ai-from-code'],
            'Build RAG over a new document set, create a twenty-case golden dataset, diagnose retrieval and generation failures separately, and report measured improvements.',
            'evaluated-rag-system/'
        ),
        'phase5-tool-use': defineAiMastery(
            'Design bounded tool contracts with validation, authorization, retries, timeouts, and observable failure behavior.',
            ['phase3-ai-from-code'],
            'Add a tool from a domain not shown in the lesson, handle invalid input, timeout, and partial data, then prove the agent never performs an unapproved side effect.',
            'bounded-tool-contract/'
        ),
        'phase6-agents': defineAiMastery(
            'Choose between a deterministic workflow and an agent, then bound an agent with budgets, stop conditions, traces, and tests.',
            ['phase5-tool-use'],
            'Implement the same task once as a workflow and once as an agent, compare success, latency, and cost, and defend which design should ship.',
            'workflow-vs-agent-report.md'
        ),
        'phase7-claude-code': defineAiMastery(
            'Use repository instructions, permissions, hooks, skills, tests, and review checkpoints to supervise an agentic coding session.',
            ['zero-to-claude-companion', 'phase6-agents'],
            'Give Claude Code an unfamiliar repository task with explicit scope and permissions, capture its plan and test evidence, and review every resulting change.',
            'supervised-agent-change/'
        ),
        'phase8-multi-agent': defineAiMastery(
            'Use multiple agents only when decomposition improves quality or latency enough to justify coordination cost and failure risk.',
            ['phase6-agents'],
            'Solve one research task with a single agent and an orchestrated team, then compare handoff errors, total cost, elapsed time, and answer quality.',
            'orchestration-comparison.md'
        ),
        'phase9-mcp-skills': defineAiMastery(
            'Build and review an MCP integration with explicit trust boundaries, authorization, observability, and failure recovery.',
            ['phase5-tool-use', 'phase7-claude-code'],
            'Expose one read tool and one bounded write tool through MCP, test malformed inputs and denied actions, and produce a trust-boundary diagram plus trace.',
            'secured-mcp-server/'
        ),
        'phase10-fullstack': defineAiMastery(
            'Ship an AI application with identity, secret handling, retries, rate limits, telemetry, rollout, and rollback controls.',
            ['phase6-agents'],
            'Deploy a small AI feature to a staging environment, inject one provider failure, verify telemetry and fallback behavior, and execute a documented rollback.',
            'production-readiness-evidence/'
        ),
        'phase11-product': defineAiMastery(
            'Design an AI SaaS boundary covering tenancy, entitlements, abuse prevention, cost attribution, support, and eval release gates.',
            ['phase10-fullstack', 'pm-evals', 'pm-unit-economics'],
            'Write a production review for a multi-tenant AI feature, including tenant isolation, usage limits, unit economics, abuse cases, support ownership, and release gates.',
            'ai-saas-production-review.md'
        ),
        'phase12-expert': defineAiMastery(
            'Lead an architecture review across reliability, security, quality, cost, observability, and model migration risk.',
            ['phase10-fullstack', 'phase11-product'],
            'Review an unfamiliar AI architecture, find at least six material risks, rank them by impact and confidence, and propose a staged remediation and migration plan.',
            'expert-architecture-review.md'
        ),
        'phase13-capstone': defineAiMastery(
            'Build, evaluate, secure, operate, and defend an end-to-end AI product against an explicit rubric.',
            ['phase4-memory-rag', 'phase5-tool-use', 'phase10-fullstack', 'pm-evals'],
            'Complete the capstone, then accept an unseen requirement change, inject a failure, rerun the eval suite, compare cost and latency, and defend the final design live.',
            'ai-capstone-portfolio/'
        ),
        'pm-evals': defineAiMastery(
            'Define representative datasets, metrics, graders, thresholds, and review gates that support a defensible ship decision.',
            ['phase3-ai-from-code'],
            'Create a thirty-case eval suite for a feature not used in the lesson, calibrate one model-based grader against human review, and make a ship or hold decision.',
            'eval-release-gate/'
        ),
        'pm-unit-economics': defineAiMastery(
            'Model cost per successful task and gross margin under realistic usage, retries, caching, routing, and support assumptions.',
            ['phase0-orientation'],
            'Build a sensitivity model for a new AI feature with low, expected, and high usage, then recommend pricing and two cost controls without hiding quality impact.',
            'ai-unit-economics.xlsx'
        ),
        'pm-build-buy-wait': defineAiMastery(
            'Choose build, buy, or wait using differentiation, data, lock-in, reversibility, cost, and platform-change assumptions.',
            ['phase2-platforms'],
            'Write a decision memo for an unfamiliar AI capability, quantify reversibility and lock-in, and state the evidence that would change the recommendation.',
            'build-buy-wait-memo.md'
        ),
        'pm-discovery-ship': defineAiMastery(
            'Move from a validated job to prototype, eval target, shadow mode, launch, and measured iteration.',
            ['phase1-prompting', 'pm-evals'],
            'Synthesize five user observations into a job statement, design a Wizard-of-Oz test, define an eval target, and write staged launch and rollback gates.',
            'discovery-to-launch-plan.md'
        ),
        'pm-trust-safety': defineAiMastery(
            'Create an owned AI risk register with threat scenarios, tests, mitigations, triggers, residual risk, and escalation paths.',
            ['pm-evals'],
            'Threat-model a new AI feature, run prompt-injection and sensitive-data tests, and produce a signed risk register with residual-risk decisions.',
            'ai-risk-register.md'
        ),
        'pm-analytics': defineAiMastery(
            'Define telemetry that connects adoption, task success, quality, latency, cost, safety, and drift to product decisions.',
            ['pm-evals'],
            'Create an event schema and five-chart dashboard specification for a new feature, including drift thresholds and the action owner for every alert.',
            'ai-product-analytics-spec.md'
        ),
        'pm-roadmap': defineAiMastery(
            'Plan under model uncertainty by preserving options, isolating dependencies, and scheduling evidence-based review gates.',
            ['pm-build-buy-wait'],
            'Create a two-quarter roadmap with three model-capability scenarios, reversible milestones, dependency expiry dates, and a quarterly model review.',
            'uncertainty-aware-roadmap.md'
        ),
        'pm-comms': defineAiMastery(
            'Explain an AI decision to executives using evidence, uncertainty, economics, risks, and one clear decision request.',
            ['pm-evals', 'pm-unit-economics'],
            'Deliver a five-minute review of an unfamiliar AI proposal, answer five hostile questions, and revise the recommendation based on the strongest objection.',
            'executive-ai-review.md'
        ),
        'builder-mcp-assistant': defineAiMastery(
            'Build a tested MCP assistant with bounded tools, authorization decisions, traces, and recoverable failures.',
            ['phase9-mcp-skills'],
            'Add a denied write path and a timeout to the MCP assistant, prove both fail safely, and attach the trace and threat-boundary explanation.',
            'mcp-assistant-evidence/'
        ),
        'builder-multi-agent': defineAiMastery(
            'Build orchestration with typed handoffs, dependency control, recovery, and a measured single-agent baseline.',
            ['phase8-multi-agent'],
            'Introduce one agent failure and one malformed handoff, recover without corrupting the result, and compare the run with a single-agent baseline.',
            'orchestration-evidence/'
        ),
        'builder-eval-pipeline': defineAiMastery(
            'Run versioned eval datasets and calibrated graders as an automated release gate.',
            ['pm-evals'],
            'Add a biased model-grader case, calibrate it with human labels, and prove CI blocks a deliberately regressed prompt or model change.',
            'eval-pipeline-evidence/'
        ),
        'builder-rag-guardrails': defineAiMastery(
            'Detect retrieval, grounding, prompt-injection, stale-index, and citation failures in a RAG system.',
            ['phase4-memory-rag', 'pm-trust-safety'],
            'Add poisoned-document, stale-index, and citation-correctness cases, then show which guardrail catches each failure and what still escapes.',
            'rag-guardrail-evidence/'
        ),
        'builder-audit-agent': defineAiMastery(
            'Design useful audit telemetry with privacy classification, retention, tamper evidence, access control, and incident queries.',
            ['phase10-fullstack'],
            'Classify every logged field, remove unnecessary sensitive data, add a tamper-evidence check, and answer an incident question from the resulting logs.',
            'audit-agent-evidence/'
        ),
        'builder-finetune': defineAiMastery(
            'Decide whether fine-tuning beats prompting or retrieval using holdout quality, safety, cost, and rollback evidence.',
            ['pm-evals', 'phase4-memory-rag'],
            'Build a strong no-fine-tune baseline, evaluate a tuned model on a holdout set plus safety regressions, and make a ship or reject decision.',
            'finetune-decision-report.md'
        ),
        'builder-knowledge-graph': defineAiMastery(
            'Build and evaluate a knowledge graph with explicit ontology, entity resolution, provenance, and a non-graph baseline.',
            ['phase4-memory-rag'],
            'Create a graph for a new domain, measure entity-resolution errors and query usefulness, compare it with a simpler retrieval baseline, and defend the extra complexity.',
            'knowledge-graph-evidence/'
        )
    })
});
