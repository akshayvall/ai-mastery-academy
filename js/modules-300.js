/* ============================================
   LEVEL 300 — ADVANCED (April 2026)
   Phase 9: MCP | Phase 10: Full-Stack | Phase 11: SaaS | Phase 12: Expert
   Uses Lab Engine v2 with rich structured steps
   ============================================ */

const MODULES_300 = [

// ══════════════════════════════════════════════
// MODULE 10 — PHASE 9: MCP & Tool Ecosystems
// ══════════════════════════════════════════════
{
    id: 'phase9-mcp-skills', level: 300,
    title: 'Phase 9: MCP & Tool Ecosystems',
    subtitle: 'Build MCP servers, connect AI to GitHub/Playwright/databases, A2A protocol, custom skills',
    icon: '🔧',
    estimatedTime: '75m',
    diagrams: [
        {
            id: 'mcp-architecture-diagram',
            type: 'mcp-architecture',
            title: 'MCP — client / server architecture',
            description: 'Model Context Protocol is JSON-RPC over a transport. Servers expose three surfaces (tools, resources, prompts) and any compatible client can use any server.',
            steps: [
                'Client side: an LLM agent runs inside a host app and uses the MCP runtime to discover and call servers.',
                'Transport: JSON-RPC messages travel over stdio, HTTP, or WebSocket.',
                'Server side: exposes tools (callable functions), resources (readable data), and prompts (reusable templates).'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>MCP — USB Standard for AI Tools</h2>
    <p>Build a tool once → works with Claude, VS Code, Cursor, any MCP client. 200+ servers available.</p>
    <table class="content-table">
        <tr><th>Component</th><th>Role</th><th>Examples</th></tr>
        <tr><td><strong>Client</strong></td><td>AI requesting tools</td><td>Claude Desktop, VS Code, Claude Code</td></tr>
        <tr><td><strong>Server</strong></td><td>Provides tools + data</td><td>GitHub, Playwright, PostgreSQL</td></tr>
        <tr><td><strong>Tools</strong></td><td>Individual capabilities</td><td>create_issue, navigate_page, query_db</td></tr>
    </table>
    <h3>Building an MCP Server</h3>
    <div class="code-block">import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
const server = new McpServer({name: "my-tools", version: "1.0.0"});
server.tool("get_status", "Get project status. Use when user asks about progress.",
    {project: {type: "string"}},
    async ({project}) => ({content: [{type: "text", text: JSON.stringify({status: "on track"})}]}));</div>
    <h3>A2A — Agent-to-Agent Protocol</h3>
    <p>MCP = AI→tools. A2A = agents→agents. AgentCards for capability discovery. The emerging ecosystem.</p>
    <h3>Evaluate → Ship → Operate</h3>
    <table class="content-table">
        <tr><th>Stage</th><th>What</th></tr>
        <tr><td><strong>Evals</strong></td><td>Golden datasets, AI-as-judge, batch testing (50% off)</td></tr>
        <tr><td><strong>Safety</strong></td><td>Input sanitisation, PII filter, output validation</td></tr>
        <tr><td><strong>Operate</strong></td><td>Key rotation, rate limits, usage monitoring, model migration</td></tr>
    </table>
</div>

<div class="learn-section">
    <h2>📚 Go Deeper: Anthropic Academy — MCP Course Section</h2>
    <p>The <a href="https://anthropic.skilljar.com/claude-with-the-anthropic-api" target="_blank">Building with the Claude API</a> course includes a dedicated 12-lesson MCP section covering:</p>
    <ul>
        <li>Defining custom tools and resources with the MCP protocol</li>
        <li>Implementing MCP servers (provide tools) and MCP clients (consume tools)</li>
        <li>Handling the full integration lifecycle — discovery, invocation, error handling</li>
        <li>Connecting Claude to various data sources via MCP</li>
    </ul>
    <p>Take this section alongside Phase 9 for the deepest understanding of how to build production MCP servers.</p>
</div>
`,
    quiz: [
        { question: 'MCP?', options: ['Language', 'Universal AI tool standard', 'Chat', 'Training'], correct: 1, explanation: 'Build once, any client.' },
        { question: 'Client vs Server?', options: ['Same', 'Client:AI app. Server:tool provider', 'Client cheaper', 'Server=AI'], correct: 1, explanation: 'Client requests, server provides.' },
        { question: 'A2A?', options: ['API-to-API', 'Agent-to-Agent protocol', 'App-to-App', 'Auth'], correct: 1, explanation: 'Agents discover and delegate to agents.' },
        { question: 'Tool descriptions?', options: ['Docs', 'AI reads them to decide WHEN', 'Pricing', 'Not important'], correct: 1, explanation: 'Only signal for tool selection.' },
        { question: 'Test skills?', options: ['Cannot', 'Positive + negative test', 'Deploy first', 'Unit only'], correct: 1, explanation: 'Test trigger AND non-trigger.' },
        { question: 'Security?', options: ['None', 'Least privilege, env vars, trusted sources', 'Share keys', 'No security'], correct: 1, explanation: 'MCP servers access real systems.' },
        { question: 'Batch API?', options: ['Same price', '50% savings async', 'Free', 'Slower'], correct: 1, explanation: '24-hour window, half price.' },
        { question: 'Golden dataset?', options: ['Training', 'Pre-written Q&A to test against', 'User data', 'Pricing'], correct: 1, explanation: 'Known-correct answers for prompt verification.' }
    ],
    interactive: [{ type: 'flashcards', id: 'mcp-cards', title: 'MCP Cards', cards: [
        { front: 'MCP?', back: 'Model Context Protocol. Universal tool standard. Build once, any client.' },
        { front: 'A2A?', back: 'Agent-to-Agent. AgentCards for discovery. MCP=tools, A2A=agent collab.' },
        { front: 'Build server?', back: 'TypeScript/Python SDK. Clear descriptions. Test with MCP Inspector.' }
    ]}],
    lab: {
        title: 'Hands-On: Build a Custom MCP Server',
        scenario: 'Build your own MCP server with 3 tools, test it, connect to Claude Code, and create a skill.',
        duration: '45-60 min', cost: 'Free', difficulty: 'Advanced',
        prerequisites: ['Node.js installed', 'Claude Code installed', 'Completed Phase 7'],
        steps: [
            { title: 'Design and build the MCP server', subtitle: 'Create 3 tools with clear descriptions', duration: '15 min', instructions: [
                { type: 'command', cmd: 'mkdir custom-mcp-server && cd custom-mcp-server && claude' },
                { type: 'prompt', text: 'Build a TypeScript MCP server using @modelcontextprotocol/sdk:\n\n1. get_project_status(project_name) — mock data: {name, status, completion_pct, blockers}\n2. search_docs(query) — 15+ mock entries on onboarding, standards, deployment\n3. check_health(service) — mock: {service, status, latency_ms}\n\nEach tool needs a >20 word description. package.json with build+start scripts. Error handling for unknown inputs.' },
                { type: 'command', cmd: 'npm install && npm run build' },
                { type: 'verify', text: 'Build succeeds. Each tool has a clear description in the code.' }
            ]},
            { title: 'Test the tools', subtitle: 'Verify all 3 tools work correctly', duration: '10 min', instructions: [
                { type: 'prompt', text: 'Create a test script that:\n1. Calls get_project_status("Alpha") → valid JSON\n2. Calls get_project_status("NonExistent") → friendly error\n3. Calls search_docs("onboarding") → non-empty results\n4. Calls search_docs("xyznonexist") → empty results\n5. Calls check_health("api") → status field\n6. Calls check_health("unknown") → error\nPrint PASS/FAIL per test.' },
                { type: 'command', cmd: 'npm test' },
                { type: 'verify', text: 'All 6 tests pass. Good inputs → data. Bad inputs → friendly errors.' }
            ]},
            { title: 'Connect to Claude Code + create skill', subtitle: 'Add MCP server + auto-triggered skill', duration: '10 min', instructions: [
                'Add to .claude/settings.json:',
                { type: 'code', language: 'json', code: '{"mcpServers": {"project-tools": {"command":"node","args":["./dist/index.js"]}}}' },
                'Restart Claude Code. Check: /mcp → shows project-tools.',
                { type: 'command', cmd: 'mkdir -p .claude/skills/project-check' },
                'Create .claude/skills/project-check/SKILL.md:',
                { type: 'code', language: 'markdown', code: '---\ndescription: Check project status and health\n---\nWhen user asks about projects, progress, or health:\n1. Call get_project_status\n2. Call check_health for related services\n3. Format as status table' },
                'Test positive: "Status of project Alpha?" → triggers skill + tools',
                'Test negative: "Write a haiku" → does NOT trigger skill',
                { type: 'verify', text: 'Positive triggers skill+tools. Negative does not trigger.' }
            ]},
            { title: 'Document and push', subtitle: 'README + GitHub', duration: '5 min', instructions: [
                { type: 'prompt', text: 'Create README: what MCP is, 3 tools, architecture, setup, testing, how to add tools, skill explanation.' },
                { type: 'command', cmd: 'git init && git add . && git commit -m "Custom MCP server with 3 tools"\ngit remote add origin https://github.com/YOUR_USERNAME/custom-mcp-server.git\ngit push -u origin main' },
                { type: 'verify', text: 'Repo has src/, .claude/, tests, README. Developer can clone, build, connect to Claude Code.' }
            ]}
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 11 — PHASE 10: Full-Stack Deploy
// ══════════════════════════════════════════════
{
    id: 'phase10-fullstack', level: 300,
    title: 'Phase 10: Full-Stack AI + Deploy',
    subtitle: 'FastAPI agent endpoint, rate limiting, cost tracking, Docker, Azure deployment',
    icon: '🚀',
    estimatedTime: '90m',
    learn: `
<div class="learn-section">
    <h2>From Script → Deployed System</h2>
    <div class="code-block">POST /api/run-agent {"task":"Research competitors","max_iterations":5}
→ {"id":"abc","result":"## Analysis...","iterations":3,"tokens":4500,"cost":0.02}</div>
    <h3>Non-Negotiable Protections</h3>
    <table class="content-table">
        <tr><th>Protection</th><th>Why</th></tr>
        <tr><td><strong>Rate limiting</strong></td><td>10 req/min. No limit = unlimited cost.</td></tr>
        <tr><td><strong>max_iterations</strong></td><td>Cap at 10. Infinite loop = $100+ bill.</td></tr>
        <tr><td><strong>Timeout</strong></td><td>60 seconds. Hung request = wasted resources.</td></tr>
        <tr><td><strong>Cost tracking</strong></td><td>Log tokens + cost per run for billing.</td></tr>
        <tr><td><strong>Error handling</strong></td><td>Never expose stack traces to users.</td></tr>
    </table>
    <div class="warning-box"><h4>⚠️ Cost Bomb</h4><p>Real scenario: stuck agent × 10,000 iterations × $0.01 = $100 overnight. Always cap iterations + timeout + budget.</p></div>

    <div class="tip-box"><h4>🎯 For PMs — unit economics before deployment</h4><p>Before this endpoint goes near production, run the worksheet in <strong>PM Playbook: AI Unit Economics</strong>. You need cost-per-query, queries-per-user, gross margin per plan, and the 99th-percentile rate-limit — written down. Without those numbers your protections are educated guesses.</p></div>
</div>
`,
    quiz: [
        { question: 'Key transition?', options: ['Model', 'Scripts → deployed APIs', 'Framework', 'DB'], correct: 1, explanation: 'Turn agents into real endpoints.' },
        { question: 'FastAPI why?', options: ['Only option', 'Async + auto-docs + Python', 'Free', 'Required'], correct: 1, explanation: 'Async for AI latency. Auto Swagger.' },
        { question: 'Rate limiting?', options: ['Performance', 'Unlimited = unlimited costs', 'Optional', 'Security'], correct: 1, explanation: 'Financial safety net.' },
        { question: 'Cost bomb?', options: ['No risk', 'Agent loop × 10K = $100+', 'Paid only', 'Strategy'], correct: 1, explanation: 'Cap iterations + timeout always.' },
        { question: 'Log per run?', options: ['Nothing', 'Task, tokens, cost, duration, status', 'Errors only', 'Result only'], correct: 1, explanation: 'Billing + monitoring + debugging.' },
        { question: 'Protections?', options: ['None', 'Rate limit + max_iter + timeout + cost + errors', 'Rate only', 'Auth only'], correct: 1, explanation: 'Defense in depth.' },
        { question: 'Response includes?', options: ['Text only', 'Result + metadata (iterations, tokens, cost)', 'HTML', 'Redirect'], correct: 1, explanation: 'Metadata for monitoring.' },
        { question: 'Deploy?', options: ['Localhost', 'Azure App Service via Docker', 'AWS only', 'Never'], correct: 1, explanation: 'Real deployment for real portfolio.' }
    ],
    interactive: [{ type: 'flashcards', id: 'deploy-cards', title: 'Deploy Cards', cards: [
        { front: 'Architecture?', back: 'Client → FastAPI → AI Agent → SQLite. Docker → Azure.' },
        { front: 'Protections?', back: 'Rate limit, max_iterations, timeout, cost tracking, error handling.' },
        { front: 'Cost bomb?', back: 'Agent × 10K loops × $0.01 = $100. Cap iterations + timeout.' }
    ]}],
    lab: {
        title: 'Hands-On: Deploy an AI Agent API',
        scenario: 'FastAPI agent endpoint with rate limiting, cost tracking, Docker, and deployment.',
        duration: '60-90 min', cost: 'Free (optional Azure for deploy)', difficulty: 'Advanced',
        prerequisites: ['Completed Phases 6-8', 'Docker installed (optional)', 'Claude Code installed'],
        steps: [
            { title: 'Build the API with Claude Code', subtitle: 'All endpoints + SQLite logging', duration: '15 min', instructions: [
                { type: 'command', cmd: 'mkdir agent-api && cd agent-api && claude' },
                { type: 'prompt', text: 'Build a FastAPI app:\n1. POST /api/run-agent — {task, max_iterations(default 5, max 10)} → runs writing agent → {id,result,iterations,tokens_used,cost_usd,duration_seconds}\n2. GET /api/runs — last 20 from SQLite\n3. GET /api/runs/{id} — single run or 404\n4. GET /health — {status:ok}\nUse Gemini Flash. Store all runs in SQLite. Auto-docs at /docs. requirements.txt.' },
                { type: 'command', cmd: 'pip install -r requirements.txt\nuvicorn main:app --reload' },
                'Test: open http://localhost:8000/docs → try POST /api/run-agent with {"task":"Write a haiku"}',
                { type: 'verify', text: 'Swagger shows 4 endpoints. POST returns result + metadata. GET /runs shows the run.' }
            ]},
            { title: 'Add all protections', subtitle: 'Rate limiting, iteration cap, timeout, cost tracking', duration: '15 min', instructions: [
                { type: 'prompt', text: 'Add protections:\n1. Rate limit: 10/min per IP (slowapi). 429 when exceeded.\n2. max_iterations > 10 → reject with 400\n3. Timeout: kill after 60 seconds → 408\n4. Cost tracking: compute from token count + model rate\n5. Error handling: clear JSON, never expose tracebacks\n6. Write 8+ pytest tests: success, rate limit, bad max_iter, invalid body, health' },
                { type: 'command', cmd: 'pytest -v' },
                'Manual rate limit test:',
                { type: 'command', cmd: 'for i in $(seq 1 15); do curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:8000/api/run-agent -H "Content-Type: application/json" -d \'{"task":"test"}\'; done' },
                { type: 'verify', text: 'Tests pass. Rapid requests show 429 after 10. max_iterations=50 → 400.' }
            ]},
            { title: 'Dockerise', subtitle: 'Container for consistent deployment', duration: '10 min', instructions: [
                { type: 'prompt', text: 'Create:\n1. Dockerfile (python:3.12-slim, install deps, uvicorn)\n2. docker-compose.yml (port 8000, pass GEMINI_API_KEY)\n3. .dockerignore, .env.example' },
                { type: 'command', cmd: 'docker compose build && docker compose up -d' },
                { type: 'command', cmd: 'curl http://localhost:8000/health' },
                { type: 'verify', text: 'Docker starts. curl returns {status:ok}. Agent endpoint works from container.' }
            ]},
            { title: 'README + push', subtitle: 'Portfolio project #9', duration: '5 min', instructions: [
                { type: 'prompt', text: 'README: problem statement, architecture diagram, all endpoints with curl, setup (local+Docker+Azure), cost estimate for 100 users.' },
                { type: 'command', cmd: 'git init && git add . && git commit -m "AI Agent API with protections + Docker"\ngit remote add origin https://github.com/YOUR_USERNAME/agent-api.git\ngit push -u origin main' },
                { type: 'verify', text: 'GitHub has main.py, tests/, Dockerfile, README with curl examples. Clone → docker compose up → API running in 2 min.' }
            ]}
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 12 — PHASE 11: AI SaaS Product
// ══════════════════════════════════════════════
{
    id: 'phase11-product', level: 300,
    title: 'Phase 11: AI SaaS Product',
    subtitle: 'Product thinking, JTBD, auth, usage limits, your AI TPM Assistant MVP',
    icon: '💰',
    estimatedTime: '75m',
    learn: `
<div class="learn-section">
    <h2>Product Before Code</h2>
    <table class="content-table">
        <tr><th>Question</th><th>Example (AI TPM Assistant)</th></tr>
        <tr><td><strong>What pain?</strong></td><td>TPMs spend 3+ hrs/week on reports, risk analyses, meeting prep</td></tr>
        <tr><td><strong>For whom?</strong></td><td>TPMs at enterprise tech, 50K+ employees</td></tr>
        <tr><td><strong>Why AI?</strong></td><td>50x faster synthesis than manual work</td></tr>
        <tr><td><strong>Alternative?</strong></td><td>Manual Excel+Word. Must be 10x better to switch.</td></tr>
    </table>
    <div class="concept-box"><h4>JTBD: Users want outcomes, not features.</h4><p>Functional: generate report fast. Emotional: feel in control. Social: look competent to leadership.</p></div>

    <div class="tip-box"><h4>🎯 For PMs — prototype before you spec</h4><p>Don’t write a PRD for an AI feature you haven’t put in front of 5 real users. Use the playbook in <strong>PM Playbook: Discovery → Ship</strong>: 30-minute no-code prototype in NotebookLM/Project, Wizard-of-Oz with 5 users, then write the spec. Saves a quarter of wasted build.</p></div>
    <h3>Features</h3>
    <p>Status Report → Risk Analysis → Meeting Prep. Business: Free (5/mo) → Pro ($29) → Team ($19/user).</p>
    <h3>SaaS Stack</h3>
    <p>React frontend + FastAPI backend + Clerk/Azure AD auth + PostgreSQL + Stripe billing + AI + Azure deploy.</p>
</div>
`,
    quiz: [
        { question: 'First question?', options: ['Stack', 'What pain, for whom?', 'Name', 'Model'], correct: 1, explanation: 'Problem + user first.' },
        { question: 'JTBD?', options: ['Hiring', 'Users want outcomes not features', 'PM tool', 'Pricing'], correct: 1, explanation: 'Functional + emotional + social jobs.' },
        { question: 'Build for your role?', options: ['Easier', 'Domain expertise = unfair advantage', 'Cheaper', 'No advantage'], correct: 1, explanation: 'You ARE the user.' },
        { question: 'Business model?', options: ['Free only', 'Freemium: free → Pro $29 → Team $19/user', 'One-time', 'Ads'], correct: 1, explanation: 'Free drives adoption, paid = revenue.' },
        { question: 'Features?', options: ['Chat only', 'Status report, risk analysis, meeting prep', 'Chatbot', 'Calendar'], correct: 1, explanation: 'Each maps to TPM pain.' },
        { question: 'Auth?', options: ['None', 'Clerk or Azure AD', 'Password file', 'Cookies'], correct: 1, explanation: 'Enterprise needs SSO + permissions.' },
        { question: 'Azure?', options: ['Only option', 'Aligned with your expertise', 'Cheapest', 'Required'], correct: 1, explanation: 'Your knowledge is an asset.' },
        { question: 'Moat?', options: ['Model', 'You are user + builder + domain expert', 'Price', 'UI'], correct: 1, explanation: 'Rare combination.' }
    ],
    interactive: [{ type: 'flashcards', id: 'product-cards', title: 'Product Cards', cards: [
        { front: 'Framework?', back: 'What PAIN? For WHOM? Why AI? Alternative? All four or do not build.' },
        { front: 'JTBD?', back: 'Functional: reports. Emotional: control. Social: look competent.' },
        { front: 'Moat?', back: 'YOU = target user + builder + domain expert. Rare.' }
    ]}],
    lab: {
        title: 'Hands-On: Build Your AI SaaS MVP',
        scenario: 'Product brief → build backend → add auth + usage limits → deploy. Your capstone project.',
        duration: '90-120 min', cost: 'Free', difficulty: 'Advanced',
        prerequisites: ['Completed Phases 9-10', 'All prior projects built'],
        steps: [
            { title: 'Write the product brief', subtitle: 'BEFORE any code — define the product', duration: '15 min', instructions: [
                'Create product-brief.md (this is the most important step):',
                { type: 'code', language: 'markdown', code: '# AI TPM Assistant — Product Brief\n\n## Problem\nTPMs spend 3+ hours/week on status reports, risk analyses, meeting prep.\n\n## Target User\nTPMs at enterprise tech (50K+), managing 2-5 workstreams, reporting to VPs weekly.\n\n## Core Features (MVP = 3 only)\n1. Status Report: bullets → formatted exec report\n2. Risk Analyser: context → ranked risks + mitigations\n3. Meeting Prep: agenda + notes → talking points + questions\n\n## Success Metric\nUser generates 3+ outputs/week.\n\n## Business Model\nFree: 5/month | Pro: $29/month | Team: $19/user/month\n\n## Competitive Advantage\nI am the target user. Domain expertise + technical ability.' },
                { type: 'verify', text: 'product-brief.md has all sections with real, thoughtful content.' }
            ]},
            { title: 'Build the backend', subtitle: '3 AI-powered endpoints', duration: '30 min', instructions: [
                { type: 'command', cmd: 'mkdir ai-tpm-assistant && cd ai-tpm-assistant && claude' },
                'Run /init, then:',
                { type: 'prompt', text: 'Build FastAPI backend for AI TPM Assistant:\n\n1. POST /api/status-report — {updates:str, format:executive|detailed} → {report:str, tokens, cost}\n2. POST /api/risk-analysis — {project_context:str} → {risks:[{risk,likelihood,impact,severity,mitigation}], tokens, cost}\n3. POST /api/meeting-prep — {agenda:str, past_notes:str} → {talking_points:[str], questions:[{question,response}], tokens, cost}\n\nUse Gemini 2.5 Flash. Log all generations to SQLite. Swagger docs at /docs. requirements.txt.' },
                { type: 'command', cmd: 'pip install -r requirements.txt\nuvicorn main:app --reload' },
                'Test ALL 3 at /docs with real inputs from your work.',
                { type: 'verify', text: 'Status report has ## Highlights, ## Risks, ## Next Week. Risk analysis ranks by severity. Meeting prep has specific anticipated questions.' }
            ]},
            { title: 'Add auth + usage limits', subtitle: 'API key auth, daily limits, 429 enforcement', duration: '20 min', instructions: [
                { type: 'prompt', text: 'Add auth + limits:\n1. API key auth: X-API-Key header required. Store keys in SQLite.\n2. Key generation script: python generate_key.py\n3. Usage tracking per key per day in SQLite\n4. Free tier: max 5 generations/day. Exceeded → 429 with reset time.\n5. GET /api/usage → {daily_used, daily_limit, resets_at}\n6. Tests: no key→401, bad key→403, 6th request→429' },
                { type: 'command', cmd: 'python generate_key.py\npytest -v' },
                { type: 'verify', text: 'No key → 401. Bad key → 403. 6th daily request → 429. GET /api/usage shows counts.' }
            ]},
            { title: 'Deploy + document + push', subtitle: 'Docker, README, capstone portfolio piece', duration: '20 min', instructions: [
                { type: 'prompt', text: 'Create:\n1. Dockerfile + docker-compose.yml\n2. README: problem statement, user persona, features with curl examples, auth docs, architecture diagram, setup (local+Docker+Azure), cost estimate per 100 users, roadmap (v2: frontend, v3: Stripe)' },
                'Copy product-brief.md into the project.',
                { type: 'command', cmd: 'git init && git add . && git commit -m "AI TPM Assistant MVP"\ngit remote add origin https://github.com/YOUR_USERNAME/ai-tpm-assistant.git\ngit push -u origin main' },
                { type: 'verify', text: 'Repo: product-brief.md, main.py, Dockerfile, tests/, README with curl examples. Tests pass. docker compose up works. This is your capstone.' }
            ]}
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 13 — PHASE 12: Expert Layer
// ══════════════════════════════════════════════
{
    id: 'phase12-expert', level: 300,
    title: 'Phase 12: Expert Layer',
    subtitle: 'Cost vs quality tradeoffs, prompt injection, scaling to 1000 users, capstone project',
    icon: '🎓',
    estimatedTime: '60m',
    diagrams: [
        {
            id: 'context-decay-diagram',
            type: 'context-decay',
            title: 'Lost in the middle — recall vs context position',
            description: 'Even with huge context windows, models don\u2019t remember evenly. Information at the start and end is recalled best; the middle gets lost.',
            steps: [
                'High recall at the start — the system prompt and earliest instructions stick.',
                'Recall sags through the middle — important facts buried here often go missed.',
                'Recency bump at the very end — the most recent turn is heavily weighted.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>Expert Thinking: 3 Axes</h2>
    <table class="content-table">
        <tr><th>Axis</th><th>Question</th><th>Example</th></tr>
        <tr><td><strong>Tradeoffs</strong></td><td>Cost vs Latency vs Quality</td><td>Nano: cheap+fast. Opus: expensive+best. 90% use nano.</td></tr>
        <tr><td><strong>Failures</strong></td><td>What goes wrong?</td><td>Hallucination, injection, infinite loops, cost explosion</td></tr>
        <tr><td><strong>Scaling</strong></td><td>What breaks at 1000x?</td><td>Rate limits, DB, cost, agents</td></tr>
    </table>
    <h3>Prompt Injection</h3>
    <p>Direct: "Ignore instructions." Indirect: hidden in data AI reads. <strong>No foolproof defense.</strong> Layer: input sanitise + output validate + separate data/instructions + least privilege.</p>
    <h3>90/10 Cost Rule</h3>
    <p>90% → cheap models ($0.20/1M). 10% → expensive ($5/1M). Saves 50-70%.</p>
    <h3>Production Stack</h3>
    <p>Prompt Caching (90% off) + Batch API (50% off) + Model Routing + Structured Outputs + Streaming + Extended Thinking.</p>
    <h3>Image Generation</h3>
    <table class="content-table">
        <tr><th>Type</th><th>How</th><th>Examples</th></tr>
        <tr><td><strong>Diffusion</strong></td><td>Noise → denoise guided by text</td><td>DALL-E, Stable Diffusion, Midjourney</td></tr>
        <tr><td><strong>GANs</strong></td><td>Generator vs Discriminator</td><td>StyleGAN, CycleGAN</td></tr>
    </table>
</div>
`,
    quiz: [
        { question: 'Expert axes?', options: ['Speed', 'Tradeoffs, Failures, Scaling', 'Models', 'Cost only'], correct: 1, explanation: 'Tradeoffs, what breaks, what breaks at 10x.' },
        { question: '90/10 rule?', options: ['Training', '90% cheap, 10% expensive, saves 50-70%', 'Free', 'Output'], correct: 1, explanation: 'Smart model routing.' },
        { question: 'Injection defense?', options: ['System prompts', 'Validation', 'No foolproof — layer defenses', 'Latest model'], correct: 2, explanation: 'Defense in depth, limit blast radius.' },
        { question: '1000 users breaks?', options: ['Nothing', 'Rate limits, DB, cost, agents', 'Frontend', '1M only'], correct: 1, explanation: 'Scale reveals hidden problems.' },
        { question: 'Dominant image gen?', options: ['GANs', 'VAEs', 'Diffusion models', 'Auto-reg'], correct: 2, explanation: 'Noise → denoise guided by text.' },
        { question: 'Indirect injection?', options: ['Slow', 'Hidden in data AI processes', 'Multiple prompts', 'API'], correct: 1, explanation: 'Webpages/docs with hidden instructions.' },
        { question: 'AI-as-judge?', options: ['Legal', 'Another AI evaluates quality', 'Competition', 'Human'], correct: 1, explanation: 'Opus scores Haiku. Scalable.' },
        { question: 'Complete journey?', options: ['Prompting', 'Talk→Prompt→Code→Memory→Tools→Agents→Claude Code→Multi-Agent→MCP→Deploy→SaaS→Scale', 'Coding', 'ChatGPT'], correct: 1, explanation: 'Each phase builds on the last.' }
    ],
    interactive: [
        { type: 'drag-drop', id: 'expert-dd', title: 'Problem → Solution', description: 'Match.', items: ['Route cheap models', 'max_iterations+timeout', 'Input sanitisation', 'PostgreSQL+pooling', 'Usage limits'], targets: { 'Cost': ['Route cheap models'], 'Agent Safety': ['max_iterations+timeout'], 'Security': ['Input sanitisation'], 'DB Scaling': ['PostgreSQL+pooling'], 'Abuse': ['Usage limits'] } },
        { type: 'flashcards', id: 'expert-cards', title: 'Expert Cards', cards: [
            { front: '90/10?', back: '90% cheap → $0.70 avg vs $5.00 all expensive. 78% savings.' },
            { front: '1000 users?', back: 'Rate limits→queue. SQLite→PostgreSQL. Cost→routing. Agents→cap.' },
            { front: 'Injection?', back: 'No foolproof. Input sanitise, output validate, separate data/instructions.' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Expert Capstone',
        scenario: 'Scaling audit of your SaaS + choose-your-own capstone project combining 3+ techniques.',
        duration: '90-120 min', cost: 'Free', difficulty: 'Expert',
        prerequisites: ['All prior phases completed', 'ai-tpm-assistant project built'],
        steps: [
            { title: 'Scaling audit: cost analysis', subtitle: 'Calculate real costs for 1000 users', duration: '15 min', instructions: [
                'Create SCALING.md in your ai-tpm-assistant/ project:',
                { type: 'code', language: 'markdown', code: '## Cost Analysis: 1000 Users\n\n### Assumptions\n- 1000 users × 10 gens/day × 2000 input + 500 output tokens\n\n### Without Routing (all Haiku $1/$5 per 1M)\n- Input: 20M × $1 = $20/day\n- Output: 5M × $5 = $25/day\n- Monthly: $1,350\n\n### With Routing (90% Flash $0.15/$0.60, 10% Haiku)\n- Flash: $5.40/day | Haiku: $4.50/day\n- Monthly: ~$300\n\n### Savings: 78% ($1,350 → $300)' },
                { type: 'verify', text: 'SCALING.md has the math showing 78% savings with model routing.' }
            ]},
            { title: 'Full production plan', subtitle: '6-area scaling plan', duration: '20 min', instructions: [
                'Use Claude to generate a comprehensive plan. Ask:',
                { type: 'prompt', text: 'Create a production scaling plan for my AI API (10K requests/day). Cover:\n1. Cost optimization: routing, caching, batch API\n2. Reliability: rate limit handling, fallback models, circuit breakers\n3. Database: SQLite → PostgreSQL path, connection pooling\n4. Security: 3-layer injection defense, PII filtering\n5. Monitoring: latency p50/p95/p99, error rate, cost per request\n6. Agent safety: max_iterations, timeout, budget caps' },
                'Add to SCALING.md. Commit.',
                { type: 'verify', text: 'SCALING.md covers all 6 areas with specific numbers and thresholds.' }
            ]},
            { title: 'Capstone: choose your own project', subtitle: 'Build something combining 3+ techniques', duration: '60 min', instructions: [
                { type: 'heading', text: 'Choose an idea' },
                { type: 'list', items: [
                    '<strong>AI Compliance Tracker:</strong> agents scan policies, flag non-compliance',
                    '<strong>AI Code Migration:</strong> agents convert Flask→FastAPI with tests',
                    '<strong>AI Meeting Assistant:</strong> transcribe + extract decisions + create tickets',
                    '<strong>AI Finance Advisor:</strong> categorise spending, find patterns',
                    '<strong>AI Paper Summariser:</strong> multi-agent pipeline for research papers'
                ]},
                { type: 'heading', text: 'Requirements (all must be met)' },
                { type: 'list', items: [
                    'Uses 3+ techniques from the course (RAG, agents, tools, MCP, etc.)',
                    'Has a deployed API endpoint (FastAPI + Docker)',
                    'Includes CLAUDE.md + .claude/ setup',
                    'Has README with architecture diagram',
                    'Includes product-brief.md',
                    'Has pytest tests',
                    'Pushed to GitHub'
                ]},
                'Build with Claude Code. This is YOUR showcase project.',
                { type: 'verify', text: 'Project uses 3+ techniques, has API, .claude/ setup, README, product-brief, tests, on GitHub.' }
            ]},
            { title: 'Final reflection + journal', subtitle: 'Complete the full journey', duration: '10 min', instructions: [
                'Update your ai-learning-journal with a final entry:',
                { type: 'code', language: 'markdown', code: '## Capstone: [Project Name]\n- What I built: [1-2 sentences]\n- Techniques used: [list from course]\n- Biggest challenge: [what was hardest]\n- What I would do differently: [hindsight]\n- My biggest learning from the entire course: [reflection]\n\n## The Complete Journey\nTalking → Prompting → Code → Memory/RAG → Tools → Agents\n→ Claude Code → Multi-Agent → MCP → Deploy → SaaS → Expert\n\n13 phases. 10+ portfolio projects.\n3 identities: Builder + Product Thinker + Product Leader.' },
                { type: 'command', cmd: 'cd ../ai-learning-journal\ngit add . && git commit -m "Capstone complete — full AI journey" && git push' },
                { type: 'verify', text: 'Journal has capstone reflection. All projects are on GitHub. You can demo any project and explain the architecture. Congratulations!' }
            ]}
        ]
    }
}

];
