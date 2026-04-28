/* ============================================
   LEVEL 200 — INTERMEDIATE (April 2026)
   Phase 4: RAG | Phase 5: Tools | Phase 6: Agents
   Phase 7: Claude Code | Phase 8: Multi-Agent
   Uses Lab Engine v2 with rich structured steps
   ============================================ */

const MODULES_200 = [

// ══════════════════════════════════════════════
// MODULE 5 — PHASE 4: Memory & RAG
// ══════════════════════════════════════════════
{
    id: 'phase4-memory-rag', level: 200,
    title: 'Phase 4: Memory & RAG',
    subtitle: 'How AI "remembers", embeddings, vector search, and building a Retrieval-Augmented Generation system from scratch',
    icon: '🧠',
    estimatedTime: '60m',
    diagrams: [
        {
            id: 'rag-pipeline-diagram',
            type: 'rag-pipeline',
            title: 'The RAG pipeline end-to-end',
            description: 'RAG = ground the model in YOUR data. Index once, retrieve at query time, augment the prompt, generate.',
            steps: [
                'User query arrives in natural language.',
                'Embed the query with the same model used at index time.',
                'Vector DB returns the top-k nearest chunks by cosine similarity.',
                'Augment: stuff the chunks into the prompt as context.',
                'Generate: model answers grounded in the retrieved chunks.'
            ]
        },
        {
            id: 'embedding-space-diagram',
            type: 'embedding-space',
            title: 'Embedding space — why semantic search works',
            description: 'Each piece of text becomes a vector in (typically) 1536-D space. Similar meanings cluster together. This is how a search for "kitten" finds "cat" without sharing any letters.',
            steps: [
                'Animals cluster together top-left.',
                'Vehicles cluster top-right.',
                'Programming languages cluster bottom-left.',
                'Foods cluster bottom-right.',
                'A query embedding lands somewhere in the space; cosine distance picks the nearest known points.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>The Memory Problem</h2>
    <p>AI has <strong>no memory</strong>. Every API call is stateless. When your chatbot "remembers" your name, it is because <em>your code</em> stores previous messages and re-sends them.</p>
    <div class="code-block">messages = [
  {"role": "system", "content": "You are helpful."},
  {"role": "user", "content": "My name is Akshay."},
  {"role": "assistant", "content": "Nice to meet you!"},
  {"role": "user", "content": "What is my name?"}
]
// You send the FULL array each time. The model sees all of it.</div>
    <p>The <strong>messages array IS the memory</strong>. When history exceeds the context window, you must truncate, summarise, or use RAG.</p>
</div>
<div class="learn-section">
    <h2>Embeddings — The Magic Behind Semantic Search</h2>
    <p>An embedding converts text into a list of numbers (a vector) that captures <em>meaning</em>. Similar text produces similar vectors:</p>
    <div class="code-block">embed("What is a dog?")        → [0.21, 0.82, 0.15, ...]
embed("Tell me about canines") → [0.22, 0.80, 0.16, ...]  // Similar!
embed("How to bake bread")     → [0.91, 0.12, 0.78, ...]  // Different!</div>
    <p>This enables <strong>semantic search</strong> — finding content by meaning, not keywords. "canine" finds "dog" because their vectors are close.</p>
</div>
<div class="learn-section">
    <h2>The RAG Pipeline</h2>
    <p>RAG lets AI use your documents without fine-tuning. This is how ChatGPT with files and NotebookLM work.</p>
    <table class="content-table">
        <tr><th>Step</th><th>What Happens</th><th>Tools</th></tr>
        <tr><td><strong>1. Index</strong></td><td>Chunk documents → create embeddings → store in vector DB</td><td>ChromaDB, Pinecone, Azure AI Search</td></tr>
        <tr><td><strong>2. Retrieve</strong></td><td>Embed user question → find top-K similar chunks</td><td>Cosine similarity search</td></tr>
        <tr><td><strong>3. Augment</strong></td><td>Inject retrieved chunks into the prompt as context</td><td>Prompt engineering</td></tr>
        <tr><td><strong>4. Generate</strong></td><td>AI answers grounded in real documents</td><td>Any LLM</td></tr>
    </table>
    <h3>Advanced RAG Patterns</h3>
    <table class="content-table">
        <tr><th>Pattern</th><th>How</th><th>When</th></tr>
        <tr><td><strong>Query Decomposition</strong></td><td>Split complex question into sub-questions</td><td>"Compare Q1 and Q2" → separate retrieval for each</td></tr>
        <tr><td><strong>Query Rewriting</strong></td><td>LLM rewrites vague question for retrieval</td><td>"How does that work?" → specific version</td></tr>
        <tr><td><strong>Hierarchical</strong></td><td>First find relevant docs, then chunks</td><td>Large knowledge bases</td></tr>
    </table>
    <div class="concept-box"><h4>🎯 This is how the products you use work</h4><p>ChatGPT with files? RAG. NotebookLM? RAG. Enterprise doc Q&A? RAG. You are building the same architecture.</p></div>

    <div class="tip-box"><h4>🎯 For PMs — RAG without evals is malpractice</h4><p>RAG hides hallucinations behind plausible citations. Pair every RAG launch with the workflow in <strong>PM Playbook: AI Evaluations</strong> (golden dataset + LLM-as-judge + release gate). Without it you have no way to know whether the chunks you retrieved actually answered the question.</p></div>
</div>
`,
    quiz: [
        { question: 'Does AI have memory?', options: ['Yes', 'No — you simulate it by re-sending history', 'Paid only', 'Auto DB'], correct: 1, explanation: 'Stateless. Your code stores and re-sends messages.' },
        { question: 'What is an embedding?', options: ['Attachment', 'Vector capturing semantic meaning', 'DB index', 'API key'], correct: 1, explanation: 'Text → numbers. Similar meaning → similar vectors.' },
        { question: 'RAG pipeline order?', options: ['Generate first', 'Index → Retrieve → Augment → Generate', 'Augment first', 'Retrieve first'], correct: 1, explanation: 'Index → Retrieve → Augment → Generate.' },
        { question: 'Why RAG reduces hallucination?', options: ['Better model', 'Grounds answers in real documents', 'Costs more', 'Does not'], correct: 1, explanation: 'Context from real docs = grounded answers.' },
        { question: 'Chunking overlap?', options: ['Not important', 'Prevents split ideas from being lost', 'Bigger chunks', 'Random'], correct: 1, explanation: '50-token overlap = sentences appear in both chunks.' },
        { question: 'RAG vs fine-tuning?', options: ['Same', 'RAG: knowledge, cheap. Fine-tune: behaviour, expensive', 'Fine-tune better', 'RAG better'], correct: 1, explanation: 'RAG = give knowledge. Fine-tune = change behaviour.' },
        { question: 'Semantic search?', options: ['Keywords', 'Finding by meaning via embeddings', 'SQL', 'Google'], correct: 1, explanation: '"canine" finds "dog" via similar vectors.' },
        { question: 'Products using RAG?', options: ['None', 'ChatGPT files, NotebookLM, Claude Projects', 'Only NLM', 'Paid only'], correct: 1, explanation: 'RAG everywhere docs + AI Q&A exists.' }
    ],
    interactive: [
        { type: 'drag-drop', id: 'rag-pipeline', title: 'Order the RAG Pipeline', description: 'Put steps in order.', items: ['Generate', 'Index', 'Augment', 'Retrieve'], targets: { 'Step 1': ['Index'], 'Step 2': ['Retrieve'], 'Step 3': ['Augment'], 'Step 4': ['Generate'] } },
        { type: 'flashcards', id: 'rag-cards', title: 'RAG Cards', cards: [
            { front: 'Memory?', back: 'AI has NONE. Your code stores messages and re-sends. Messages array = memory.' },
            { front: 'RAG pipeline?', back: 'Index (chunk+embed) → Retrieve (find similar) → Augment (inject prompt) → Generate (answer).' },
            { front: 'Embeddings?', back: 'Text → vector of numbers. Similar meaning → similar vectors. GPS for meaning.' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Build a RAG Knowledge Base',
        scenario: 'Build a complete RAG system from scratch with Claude Code. Index your documents in ChromaDB, query with cited answers.',
        duration: '45-60 min',
        cost: 'Free (Google AI Studio for embeddings)',
        difficulty: 'Intermediate',
        prerequisites: ['Python 3 installed', 'GEMINI_API_KEY set (from Phase 3)', 'Claude Code installed'],
        steps: [
            { title: 'Create the project and documents', subtitle: 'Set up docs that your RAG system will search', duration: '5 min', instructions: [
                { type: 'command', cmd: 'mkdir rag-knowledge-base\ncd rag-knowledge-base\nmkdir docs' },
                { type: 'heading', text: 'Create 3-5 markdown files in docs/' },
                'These are the documents your system will search over. Make them REAL — use content you actually work with:',
                { type: 'list', items: ['docs/architecture.md — 300+ words about a system you know', 'docs/coding-standards.md — your team conventions', 'docs/onboarding.md — new-member guide', 'docs/faq.md — 10 common Q&As', 'docs/troubleshooting.md — 10 issues + solutions'] },
                { type: 'tip', text: 'The more realistic your docs, the more useful the final system. Write at least 200 words per file.' },
                { type: 'verify', text: 'Run <strong>ls docs/</strong> — 3-5 .md files. Open each and confirm 200+ words of real content.' }
            ]},
            { title: 'Build the document indexer', subtitle: 'Chunk, embed, and store in ChromaDB', duration: '15 min', instructions: [
                { type: 'command', cmd: 'claude' },
                'Paste this into Claude Code:',
                { type: 'prompt', text: 'Build a RAG document indexer. Create indexer.py that:\n1. Reads all .md files from docs/\n2. Splits each into chunks of ~500 chars with 50-char overlap\n3. Creates embeddings using Gemini (models/text-embedding-004)\n4. Stores chunks + embeddings + metadata (filename, chunk_index) in ChromaDB persistent collection at ./chroma_db/\n5. Prints progress per file and total summary\n6. Also create requirements.txt with chromadb and google-generativeai\nHandle errors: skip unreadable files with a warning.' },
                'After Claude Code creates the files:',
                { type: 'command', cmd: 'pip install -r requirements.txt\npython indexer.py' },
                { type: 'tip', text: 'If you get an API error, verify GEMINI_API_KEY is set: echo $GEMINI_API_KEY' },
                { type: 'verify', text: 'Script runs without errors. Prints chunk counts per file. A <strong>chroma_db/</strong> folder is created.' }
            ]},
            { title: 'Build the query system', subtitle: 'Embed questions, retrieve chunks, generate cited answers', duration: '15 min', instructions: [
                'In Claude Code, paste:',
                { type: 'prompt', text: 'Build the RAG query system. Create query.py that:\n1. Connects to ChromaDB collection from ./chroma_db/\n2. CLI loop: prompts "Question: "\n3. Embeds the question with Gemini\n4. Queries ChromaDB for top 3 similar chunks\n5. If best similarity < 0.3, says "I do not have info about that"\n6. Otherwise, builds prompt: system instruction + retrieved chunks + question\n7. Calls Gemini 2.5 Flash to generate answer\n8. Prints answer with "Sources: [filename, chunk N]" citations\n9. Commands: /quit to exit, /sources to list indexed files\nHandle empty ChromaDB gracefully.' },
                { type: 'heading', text: 'Test with these queries' },
                { type: 'list', items: [
                    '<strong>TEST 1:</strong> Ask about something in your docs → should cite the right file',
                    '<strong>TEST 2:</strong> Ask a different doc topic → should cite that file',
                    '<strong>TEST 3:</strong> "What is the weather?" → should say "I do not have info"',
                    '<strong>TEST 4:</strong> Cross-doc question → should combine info from multiple files'
                ]},
                { type: 'verify', text: 'Tests 1-2 return relevant cited answers. Test 3 correctly declines. Test 4 combines multiple sources.' }
            ]},
            { title: 'Add README and push to GitHub', subtitle: 'Document and publish portfolio project #4', duration: '5 min', instructions: [
                'In Claude Code:',
                { type: 'prompt', text: 'Create README.md with:\n- Title: Personal RAG Knowledge Base\n- Architecture diagram (text): docs/ → indexer.py → [chunk → embed → ChromaDB] → query.py → [embed Q → search → top 3 → LLM → cited answer]\n- Setup: API key, pip install, add docs, run indexer, run query\n- Example queries\n- How to add new documents\nAlso create .gitignore: chroma_db/, __pycache__/, .env' },
                { type: 'command', cmd: 'git init && git add . && git commit -m "RAG system with ChromaDB and Gemini"\ngit remote add origin https://github.com/YOUR_USERNAME/rag-knowledge-base.git\ngit push -u origin main' },
                { type: 'verify', text: 'GitHub repo has: README with architecture diagram, indexer.py, query.py, requirements.txt, docs/ folder. A visitor could clone and run in 5 minutes.' }
            ]}
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 6 — PHASE 5: Tool Use
// ══════════════════════════════════════════════
{
    id: 'phase5-tool-use', level: 200,
    title: 'Phase 5: Tool Use & Function Calling',
    subtitle: 'AI that DOES things — define tools, AI decides when to use them, the foundation of every agent',
    icon: '🔨',
    estimatedTime: '50m',
    diagrams: [
        {
            id: 'tool-calling-flow',
            type: 'tool-calling',
            title: 'Function calling — the message handshake',
            description: 'Tool use is just a structured back-and-forth. The model never executes anything; it just emits JSON and waits for your app to come back with the result.',
            steps: [
                '1. User message in.',
                '2. Model decides: "I need a tool" → emits tool_call JSON.',
                '3. Your app reads the JSON and calls the real function or API.',
                '4. Tool returns data.',
                '5. App sends a tool_result message back to the model.',
                '6. Model produces the user-facing answer.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>From Chat → Action</h2>
    <p>You define tools (functions with descriptions). The AI decides <strong>when</strong> to call them and with <strong>what arguments</strong>. The AI does NOT execute — it returns the function name + args. <strong>Your code executes.</strong> This is the foundation of every agent.</p>
    <div class="code-block">// 1. Define tools with JSON schema
tools = [{"type":"function","function":{
    "name":"get_weather",
    "description":"Get weather for a city. Use when user asks about weather.",
    "parameters":{"type":"object","properties":{
        "city":{"type":"string","description":"City name"}}}}}]

// 2. AI returns: {"name":"get_weather","arguments":{"city":"Seattle"}}
// 3. YOUR code executes: result = get_weather("Seattle")
// 4. Send result back to AI → AI crafts natural response</div>

    <h3>Tool Types</h3>
    <table class="content-table">
        <tr><th>Type</th><th>Examples</th><th>Use Case</th></tr>
        <tr><td><strong>Search</strong></td><td>Web, knowledge base, files</td><td>Current information</td></tr>
        <tr><td><strong>Code Exec</strong></td><td>Python sandbox, shell</td><td>Calculations, data</td></tr>
        <tr><td><strong>File I/O</strong></td><td>Read/write files</td><td>Content creation</td></tr>
        <tr><td><strong>APIs</strong></td><td>REST, databases, Jira</td><td>External systems</td></tr>
        <tr><td><strong>Browser</strong></td><td>Navigate, click, fill</td><td>Web automation</td></tr>
    </table>

    <h3>Claude Built-in API Tools</h3>
    <p>Beyond function calling, Claude has <strong>first-party tools</strong> built into the Messages API:</p>
    <div class="code-block">// Web Search — Claude searches the web, cites sources
tools=[{"type": "web_search_20250305"}]

// Code Execution — Claude writes + runs Python in sandbox
tools=[{"type": "code_execution_20250522"}]</div>

    <div class="warning-box"><h4>⚠️ Descriptions are everything</h4><p>The AI reads tool descriptions to decide WHEN to call. "Gets stuff" → never called. "Get current weather for a specific city" → perfect selection.</p></div>

    <div class="tip-box"><h4>🎯 For PMs — designing the tool surface IS product work</h4><p>Tool inventory, naming, descriptions, error messages, and human-confirmation rules are PM decisions, not engineering ones. Each tool is a permission you grant the model on behalf of the user. See <strong>PM Playbook: Trust, Safety & Risk Register</strong> for the least-privilege framework before you ship a multi-tool agent.</p></div>
</div>
`,
    quiz: [
        { question: 'Function calling?', options: ['Python functions', 'Define tools → AI picks → you execute → return result', 'AI executes', 'Cloud'], correct: 1, explanation: 'You define, AI decides, you execute.' },
        { question: 'AI executes?', options: ['Yes', 'No — returns name+args, YOUR code executes', 'Sometimes', 'Opus only'], correct: 1, explanation: 'AI returns JSON. You do the work.' },
        { question: 'Foundation of agents?', options: ['No', 'Yes — every agent is built on tool use', 'Chatbots only', 'Web only'], correct: 1, explanation: 'Claude Code, Copilot, Codex — all function calling.' },
        { question: 'Descriptions?', options: ['Docs only', 'AI reads them to decide WHEN to call', 'Pricing', 'Not important'], correct: 1, explanation: 'Only signal for tool selection.' },
        { question: 'No tool needed?', options: ['Must use', 'AI responds directly — tool use optional', 'Error', 'All tools'], correct: 1, explanation: 'AI only calls when needed.' },
        { question: 'Web search tool?', options: ['Custom', 'Built-in: web_search_20250305', 'Manual', 'Google API'], correct: 1, explanation: 'First-party in Messages API.' },
        { question: 'Code execution?', options: ['Custom sandbox', 'Built-in: code_execution_20250522', 'Local only', 'SSH'], correct: 1, explanation: 'Anthropic-hosted sandbox.' },
        { question: 'Phase 3 → 5?', options: ['Same', 'Phase 3: call once. Phase 5: AI uses TOOLS', 'Remove API', 'Different lang'], correct: 1, explanation: 'Text in/out → AI decides tools → takes actions.' }
    ],
    interactive: [{ type: 'flashcards', id: 'tool-cards', title: 'Tool Use Cards', cards: [
        { front: 'Flow?', back: '1. Define tools. 2. Send query+tools. 3. AI returns name+args. 4. You execute. 5. Return result. 6. AI responds.' },
        { front: 'Descriptions?', back: 'AI reads them to decide WHEN. Clear = accurate. Vague = never called.' },
        { front: 'Built-in tools?', back: 'web_search_20250305 (web), code_execution_20250522 (Python sandbox). No setup needed.' }
    ]}],
    lab: {
        title: 'Hands-On: Build an AI Tool Agent',
        scenario: 'Build an assistant with 3 tools — weather, calculator, file reader. AI decides which to use.',
        duration: '30-45 min', cost: 'Free', difficulty: 'Intermediate',
        prerequisites: ['Completed Phase 4', 'GEMINI_API_KEY set', 'Claude Code installed'],
        steps: [
            { title: 'Create tools and wire function calling', subtitle: 'Build 3 tools with Claude Code', duration: '10 min', instructions: [
                { type: 'command', cmd: 'mkdir tool-agent && cd tool-agent && claude' },
                { type: 'prompt', text: 'Build a Python tool-calling assistant using the Gemini API with function calling:\n\n1. TOOLS:\n   a) get_weather(city) — mock JSON: {temp, conditions, humidity}. Different cities = different data.\n   b) calculate(expression) — safe math eval using ast.literal_eval\n   c) read_file(filename) — read local file contents, friendly error if missing\n\n2. FUNCTION CALLING: Send user input + tool schemas. When AI returns tool call, execute, send result back.\n\n3. LOOP: Prompt "You: ", handle tool calls, print "AI: ". Support /quit and /tools.\n\n4. Create sample notes.txt with some content.\n5. requirements.txt + .gitignore' },
                { type: 'verify', text: 'ls shows main.py, notes.txt, requirements.txt. pip install -r requirements.txt succeeds.' }
            ]},
            { title: 'Test tool selection', subtitle: 'Verify AI picks the right tool for each question', duration: '10 min', instructions: [
                { type: 'command', cmd: 'python main.py' },
                { type: 'heading', text: 'Run these test scenarios' },
                { type: 'list', items: [
                    '<strong>TEST 1:</strong> "What is the weather in Seattle?" → uses get_weather',
                    '<strong>TEST 2:</strong> "What is 25 * 17 + 3?" → uses calculate',
                    '<strong>TEST 3:</strong> "Read my notes.txt" → uses read_file',
                    '<strong>TEST 4:</strong> "What is Python?" → NO tool used (direct answer)',
                    '<strong>TEST 5:</strong> "Read secret.txt" → friendly error (file missing)',
                    '<strong>TEST 6:</strong> /tools → lists all 3 available tools'
                ]},
                { type: 'verify', text: 'Tests 1-3 use correct tool. Test 4 uses NO tool. Test 5 handles error. Test 6 lists tools.' }
            ]},
            { title: 'Add tests and error handling', subtitle: 'Write pytest tests for each tool', duration: '10 min', instructions: [
                { type: 'prompt', text: 'Add:\n1. pytest tests: test_tools.py with 8+ tests covering all tools + error cases\n2. Error handling: invalid math → friendly error, missing file → helpful message, API failure → continue loop\nRun pytest and fix failures.' },
                { type: 'command', cmd: 'pytest -v' },
                { type: 'verify', text: 'All tests pass. Try to break the assistant with bad inputs — it handles everything gracefully.' }
            ]},
            { title: 'Document and push', subtitle: 'README with architecture + push to GitHub', duration: '5 min', instructions: [
                { type: 'prompt', text: 'Create README: architecture diagram (User → AI → Tool Decision → Execute → Result → Response), tools list, how to add new tools, setup instructions.' },
                { type: 'command', cmd: 'git init && git add . && git commit -m "Tool-calling AI assistant"\ngit remote add origin https://github.com/YOUR_USERNAME/tool-agent.git\ngit push -u origin main' },
                { type: 'verify', text: 'GitHub repo has main.py, test_tools.py, README. Tests pass. Visitor could add a 4th tool by following README.' }
            ]}
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 7 — PHASE 6: AI Agents
// ══════════════════════════════════════════════
{
    id: 'phase6-agents', level: 200,
    title: 'Phase 6: AI Agents',
    subtitle: 'The agent loop: Think → Act → Observe → Repeat. Build writing, web research, and deep research agents.',
    icon: '🤖',
    estimatedTime: '50m',
    diagrams: [
        {
            id: 'agent-loop-diagram',
            type: 'agent-loop',
            title: 'The ReAct agent loop',
            description: 'An agent is just a tool-calling model wrapped in a loop. Each iteration it reasons, acts, observes — until it decides it is done.',
            steps: [
                'Thought — the model reasons about what to do next.',
                'Action — it picks a tool and arguments.',
                'Observation — the tool result becomes new context.',
                '…then back to Thought. Loop until the model emits a final answer.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>Agent = LLM + Tools + Loop</h2>
    <div class="code-block">while not task_complete:
    thought = llm.think("What should I do next?")
    action = llm.pick_tool(thought)
    result = execute(action)
    if llm.is_done(result): break</div>
    <p>This is the <strong>ReAct (Reason + Act)</strong> pattern — backbone of every AI agent.</p>
    <table class="content-table">
        <tr><th>Phase</th><th>What AI Does</th><th>Who Controls</th></tr>
        <tr><td>Phase 3</td><td>Answers one question</td><td>You control everything</td></tr>
        <tr><td>Phase 5</td><td>Calls a tool once</td><td>You control flow</td></tr>
        <tr><td><strong>Phase 6</strong></td><td><strong>Loops — calling tools until task done</strong></td><td><strong>AI controls flow</strong></td></tr>
    </table>
    <h3>Reasoning Models & Inference-Time Scaling</h3>
    <p>Models that <strong>think longer</strong> produce better answers. A smaller model thinking 30 seconds outperforms a larger model answering instantly.</p>
    <table class="content-table">
        <tr><th>Model</th><th>Innovation</th></tr>
        <tr><td><strong>OpenAI o-series</strong></td><td>Hidden chain-of-thought reasoning</td></tr>
        <tr><td><strong>DeepSeek-R1</strong></td><td>Open-source reasoning via RL</td></tr>
        <tr><td><strong>Claude Extended Thinking</strong></td><td>Visible thinking, adaptive depth</td></tr>
    </table>
    <h3>Safety</h3>
    <ul>
        <li><strong>max_iterations:</strong> Without this → infinite loop → unlimited cost</li>
        <li><strong>Human-in-the-loop:</strong> Approve destructive actions</li>
        <li><strong>Rate limits:</strong> Cap API calls per run</li>
    </ul>

    <div class="tip-box"><h4>🎯 For PMs — "workflow or agent?" before you build</h4><p>Most "agent" features should ship as deterministic <em>workflows</em> with one or two LLM steps. Pick a real agent only when the path through tools genuinely cannot be enumerated up front — the variance, latency and cost are dramatically higher. The PM owns this decision and it should appear on every AI feature spec.</p></div>
</div>
`,
    quiz: [
        { question: 'Agent formula?', options: ['LLM', 'LLM + Tools + Loop', 'Tools', 'RAG'], correct: 1, explanation: 'Intelligence + capabilities + iteration.' },
        { question: 'ReAct?', options: ['React.js', 'Think → Act → Observe → Repeat', 'Billing', 'Safety'], correct: 1, explanation: 'Reason + Act.' },
        { question: 'Phase 5 vs 6?', options: ['Same', 'Tools once vs LOOP until done', 'Different tools', 'Simpler'], correct: 1, explanation: 'The LOOP is the breakthrough.' },
        { question: 'Biggest risk?', options: ['Slow', 'Infinite loop = unlimited cost', 'Memory', 'Latency'], correct: 1, explanation: 'Stuck agents = $100+ bills.' },
        { question: 'Inference-time scaling?', options: ['Bigger model', 'Thinking longer improves accuracy', 'Faster better', 'Training only'], correct: 1, explanation: '30 seconds thinking > instant answer.' },
        { question: 'Claude Code technically?', options: ['Magic', 'ReAct loop: read → plan → edit → test → fix → repeat', 'Cloud only', 'Autocomplete'], correct: 1, explanation: 'The ReAct pattern in action.' },
        { question: 'Human-in-the-loop?', options: ['Watch', 'Approve destructive actions', 'Training', 'Forms'], correct: 1, explanation: 'Pause before delete/send/deploy.' },
        { question: 'What you build vs Phase 3?', options: ['Same', 'Autonomous: plans, executes, self-reviews, iterates', 'Longer check', 'Web app'], correct: 1, explanation: 'Phase 3 answers. Phase 6 completes tasks autonomously.' }
    ],
    interactive: [{ type: 'flashcards', id: 'agent-cards', title: 'Agent Cards', cards: [
        { front: 'Agent = ?', back: 'LLM + Tools + Loop (think → act → observe → repeat).' },
        { front: 'Phase 3→5→6?', back: '3: call once. 5: tools once. 6: tools in LOOP until done. Autonomy.' },
        { front: 'Safety?', back: 'max_iterations, human-in-the-loop, rate limits. Always cap loops.' }
    ]}],
    lab: {
        title: 'Hands-On: Build AI Agents',
        scenario: 'Build a writing agent that plans, writes, self-reviews, and iterates. Then an Ask-the-Web agent and a Deep Research agent.',
        duration: '60-90 min', cost: 'Free', difficulty: 'Intermediate',
        prerequisites: ['Completed Phase 5', 'Claude Code installed'],
        steps: [
            { title: 'Build the writing agent', subtitle: 'Autonomous plan → write → review → rewrite loop', duration: '20 min', instructions: [
                { type: 'command', cmd: 'mkdir task-agent && cd task-agent && claude' },
                { type: 'prompt', text: 'Build a Python writing agent:\n1. INPUT: Topic as CLI arg: python agent.py "topic"\n2. PLAN: Call LLM → structured outline (title + 4 sections as JSON)\n3. WRITE: For each section, generate ~200 words\n4. REVIEW: Score each section: clarity/accuracy/engagement (1-10)\n5. REWRITE: If any score < 7, rewrite (max 2 rewrites per section)\n6. OUTPUT: Save to output/article.md. Print summary: sections, scores, iterations, tokens.\n7. SAFETY: max 5 total rewrite LLM calls.\n8. Use Gemini 2.5 Flash. Create output/ dir. requirements.txt.' },
                { type: 'command', cmd: 'python agent.py "Why AI agents will change software development in 2026"' },
                { type: 'verify', text: 'Agent prints: outline → section scores → rewrites for low scores → final article. output/article.md exists and is coherent.' }
            ]},
            { title: 'Build the Ask-the-Web agent', subtitle: 'Perplexity-style research with citations', duration: '20 min', instructions: [
                { type: 'prompt', text: 'Create web_agent.py:\n1. Takes a question as CLI arg\n2. DECOMPOSE: Break into 2-3 search queries\n3. SEARCH: Use a mock_search.py with 20+ mock entries on AI/tech topics\n4. EXTRACT: Find relevant sentences from results\n5. SYNTHESISE: Call LLM with extracted info → cited answer [Source N]\n6. ITERATE: If insufficient, refine query (max 3 iterations)\n7. Print: answer + citations + metadata (queries used, iterations)' },
                { type: 'command', cmd: 'python web_agent.py "What are the latest trends in AI agents?"' },
                { type: 'verify', text: 'Agent decomposes question, searches, produces cited answer with [Source N] references. Max 3 search iterations.' }
            ]},
            { title: 'Build the Deep Research agent', subtitle: 'Multi-step research with gap analysis', duration: '20 min', instructions: [
                { type: 'prompt', text: 'Create deep_research.py:\n1. Takes research question\n2. PLAN: Chain-of-thought research plan\n3. LOOP (max 5): search → extract → identify GAPS → refine if gaps remain\n4. SYNTHESIS: Executive summary + Key findings (cited) + Methodology + Limitations\n5. Save to output/research_report.md\n6. Track: searches, sources, reasoning steps' },
                { type: 'command', cmd: 'python deep_research.py "How are enterprises deploying AI agents in 2026?"' },
                { type: 'verify', text: 'Structured report with exec summary, cited findings, methodology, limitations. Saved to output/.' }
            ]},
            { title: 'Push all agents to GitHub', subtitle: 'Portfolio project #6', duration: '5 min', instructions: [
                { type: 'prompt', text: 'Create README covering all 3 agents: writing, web research, deep research. Architecture, setup, examples.' },
                { type: 'command', cmd: 'git init && git add . && git commit -m "3 AI agents: writing, web research, deep research"\ngit remote add origin https://github.com/YOUR_USERNAME/task-agent.git\ngit push -u origin main' },
                { type: 'verify', text: 'GitHub repo has agent.py, web_agent.py, deep_research.py, mock_search.py, README. All 3 agents run.' }
            ]}
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 8 — PHASE 7: Claude Code Mastery
// ══════════════════════════════════════════════
{
    id: 'phase7-claude-code', level: 200,
    title: 'Phase 7: Claude Code & .claude/ Mastery',
    subtitle: '7-layer architecture, CLAUDE.md, commands, rules, skills, agents, hooks, MCP, Managed Agents',
    icon: '🏗️',
    estimatedTime: '90m',
    learn: `
<div class="learn-section">
    <h2>Claude Code: 7-Layer Architecture</h2>
    <table class="content-table">
        <tr><th>Layer</th><th>What</th><th>Details</th></tr>
        <tr><td><strong>Foundation</strong></td><td>Runtime</td><td>Full filesystem, agent executes commands, hours-long sessions, terminal access</td></tr>
        <tr><td><strong>L1 Memory</strong></td><td>CLAUDE.md</td><td>Global → project → directory priority. .claudeignore. CLAUDE.local.md (gitignored)</td></tr>
        <tr><td><strong>L2 Skills</strong></td><td>Auto-invoked</td><td>~/.claude/skills/ with SKILL.md. Built-in: docx, xlsx, pptx, pdf</td></tr>
        <tr><td><strong>L3 MCP</strong></td><td>200+ tools</td><td>Dev (GitHub), Productivity (Notion), Data (PostgreSQL), Comms (Slack)</td></tr>
        <tr><td><strong>L4 Commands</strong></td><td>Slash commands</td><td>/help /init /clear /compact /model /mcp /doctor /config /cost. @file refs. Esc, Esc×2, !, \\</td></tr>
        <tr><td><strong>L5 Orchestration</strong></td><td>Multi-agent</td><td>Sub-tasks, Hooks (PreToolCall/PostToolCall), Checkpoints (Esc×2 rewind)</td></tr>
        <tr><td><strong>Top Floor</strong></td><td>Workflows</td><td>Architect, Creator, PM patterns. Prompting cheat sheet.</td></tr>
    </table>
</div>
<div class="learn-section">
    <h2>.claude/ Folder Reference</h2>
    <div class="code-block">your-project/
├── CLAUDE.md .............. team instructions (committed)
├── CLAUDE.local.md ........ personal (gitignored)
├── .claudeignore .......... exclude from context
└── .claude/
    ├── settings.json ...... permissions + MCP (committed)
    ├── settings.local.json  personal (gitignored)
    ├── commands/ ........... /project:review, /project:deploy
    ├── rules/ ............. code-style.md, testing.md (auto-loaded)
    ├── skills/ ............ SKILL.md (auto-triggered)
    └── agents/ ............ code-reviewer.md (isolated)</div>
</div>
<div class="learn-section">
    <h2>Claude Managed Agents</h2>
    <p>Fully managed autonomous infrastructure. Deploy agents in stateful sessions with persistent event history.</p>
    <table class="content-table">
        <tr><th></th><th>Claude Code</th><th>Managed Agents</th></tr>
        <tr><td><strong>Mode</strong></td><td>Interactive terminal</td><td>Autonomous cloud</td></tr>
        <tr><td><strong>Control</strong></td><td>You watch + approve</td><td>Runs unattended</td></tr>
        <tr><td><strong>State</strong></td><td>Single session</td><td>Long-lived + event history</td></tr>
    </table>
    <div class="code-block"># ant CLI for Managed Agents
ant beta:agents create --name "Bot" --model '{id: claude-sonnet-4-6}'
ant beta:environments create --name "dev-env"
ant beta:sessions create --agent AGENT_ID --environment ENV_ID</div>
</div>

<div class="learn-section">
    <h2>📚 Go Deeper: Official Claude Code Courses & Tutorials</h2>
    <p>Anthropic provides free, structured learning for Claude Code. These are the highest-quality resources available — made by the team that built it.</p>

    <h3>🎓 Anthropic Academy: Claude Code 101 (Free)</h3>
    <p><a href="https://anthropic.skilljar.com/claude-code-101" target="_blank">Enroll free — 12 lectures, 1.5 hrs video, 1 quiz, certificate of completion</a></p>
    <table class="content-table">
        <tr><th>Section</th><th>Lessons</th><th>What You Learn</th></tr>
        <tr><td><strong>What is Claude Code?</strong></td><td>2</td><td>What separates an AI coding agent from a chat assistant. The agentic loop: gather context → take action → verify results. Tools and permissions that govern each step.</td></tr>
        <tr><td><strong>Your First Prompt</strong></td><td>2</td><td>Install in terminal, VS Code, JetBrains, Claude Desktop, or web. Approval mode, auto-accept, Plan Mode — choosing the right level of oversight.</td></tr>
        <tr><td><strong>Daily Workflows</strong></td><td>3</td><td>The Explore → Plan → Code → Commit rhythm. Context management commands (/compact, /clear, /context). Code review with Claude Code.</td></tr>
        <tr><td><strong>Customizing Claude Code</strong></td><td>5</td><td>CLAUDE.md for project conventions. Subagents and skills for repeated workflows. MCP servers for external systems. Hooks for deterministic guardrails.</td></tr>
    </table>
    <p><strong>Prerequisites:</strong> Basic familiarity with a code editor and command line. Claude Pro/Max/Enterprise account or API key.</p>

    <h3>🎓 Anthropic Academy: Building with the Claude API (Free)</h3>
    <p><a href="https://anthropic.skilljar.com/claude-with-the-anthropic-api" target="_blank">84 lectures, 8.1 hrs video, 10 quizzes, certificate</a> — Section 6 covers Claude Code & Computer Use specifically (8 lessons on dev workflows, UI automation, MCP integration).</p>

    <h3>📖 Claude Tutorials Hub — Claude Code Picks</h3>
    <p>Written guides and videos at <a href="https://claude.com/resources/tutorials" target="_blank">claude.com/resources/tutorials</a>:</p>
    <table class="content-table">
        <tr><th>Tutorial</th><th>What You Learn</th><th>Link</th></tr>
        <tr><td>What Are Skills?</td><td>Auto-triggered workflow files in .claude/skills/ — when to use, how to build</td><td><a href="https://claude.com/resources/tutorials/what-are-skills" target="_blank">Open</a></td></tr>
        <tr><td>How Skills Compare to Other Features</td><td>Skills vs commands vs rules vs agents — when to use each</td><td><a href="https://claude.com/resources/tutorials/how-skills-compare-to-other-claude-code-features" target="_blank">Open</a></td></tr>
        <tr><td>Using Claude Code Remote Control</td><td>Control Claude Code sessions remotely — programmatic steering</td><td><a href="https://claude.com/resources/tutorials/using-claude-code-remote-control" target="_blank">Open</a></td></tr>
        <tr><td>What is Claude Managed Agents?</td><td>Fully autonomous cloud agents — deploy, monitor, event history</td><td><a href="https://claude.com/resources/tutorials/what-is-claude-managed-agents" target="_blank">Open</a></td></tr>
        <tr><td>Getting Good at Claude: Research-Backed Curriculum</td><td>Official learning path with research-validated techniques</td><td><a href="https://claude.com/resources/tutorials/getting-good-at-claude-a-research-backed-curriculum" target="_blank">Open</a></td></tr>
        <tr><td>Choosing the Right Claude Model</td><td>Haiku vs Sonnet vs Opus — when to use each, cost tradeoffs</td><td><a href="https://claude.com/resources/tutorials/choosing-the-right-claude-model" target="_blank">Open</a></td></tr>
        <tr><td>Get the Most from Claude Opus 4.6</td><td>Advanced prompting for the flagship model, 1M context strategies</td><td><a href="https://claude.com/resources/tutorials/get-the-most-from-claude-opus-4-6" target="_blank">Open</a></td></tr>
    </table>
    <div class="warning-box"><h4>💡 Recommended Path</h4><p>1. Take Claude Code 101 now (1.5 hrs) — you will understand the agentic loop and daily workflows.<br>2. Read the Skills tutorials — they map directly to the L2 layer you just learned.<br>3. Read the Managed Agents tutorial — it expands on the ant CLI section above.<br>4. Complete the API course Section 6 (Claude Code & Computer Use) for the developer integration angle.</p></div>
</div>
`,
    quiz: [
        { question: '.claude/?', options: ['Cache', 'Control center: settings, commands, rules, skills, agents', 'Logs', 'Temp'], correct: 1, explanation: 'All Claude Code config.' },
        { question: 'CLAUDE.md vs local?', options: ['Same', 'CLAUDE.md: team (committed). Local: personal (gitignored)', 'Local newer', 'Models'], correct: 1, explanation: 'Team shared, personal private.' },
        { question: 'Commands vs Skills?', options: ['Same', 'Commands: manual. Skills: auto-trigger', 'Skills cost', 'Commands newer'], correct: 1, explanation: 'Explicit vs automatic.' },
        { question: '/init?', options: ['Git', 'Auto-generate CLAUDE.md', 'Server', 'Deps'], correct: 1, explanation: 'Examines project, creates initial CLAUDE.md.' },
        { question: 'Managed Agents?', options: ['Chat', 'Autonomous cloud with stateful sessions', 'Video', 'DB'], correct: 1, explanation: 'Deploy agents that run unattended.' },
        { question: 'Esc×2?', options: ['Exit', 'Rewind to previous checkpoint', 'Clear', 'Help'], correct: 1, explanation: 'Undo to last safe state.' },
        { question: 'Hooks?', options: ['Webhooks', 'PreToolCall/PostToolCall scripts', 'Shortcuts', 'Git only'], correct: 1, explanation: 'Lint before commit, format after edit.' },
        { question: 'MCP add?', options: ['Plugin', '.claude/settings.json or claude mcp add', 'Different tool', 'Auto'], correct: 1, explanation: 'Configure in settings or CLI.' }
    ],
    interactive: [
        { type: 'drag-drop', id: 'claude-folder', title: '.claude/ Components', description: 'Match to purpose.', items: ['CLAUDE.md', 'commands/review.md', 'rules/code-style.md', 'skills/deploy/SKILL.md', 'agents/reviewer.md', 'settings.json'], targets: { 'Team instructions': ['CLAUDE.md'], 'Slash command': ['commands/review.md'], 'Auto-loaded rules': ['rules/code-style.md'], 'Auto-triggered workflow': ['skills/deploy/SKILL.md'], 'Isolated sub-agent': ['agents/reviewer.md'], 'Permissions + MCP': ['settings.json'] } },
        { type: 'flashcards', id: 'cc-cards', title: 'Claude Code Cards', cards: [
            { front: '7 layers?', back: 'Foundation, Memory, Skills, MCP, Commands, Orchestration, Workflows.' },
            { front: 'Managed Agents?', back: 'Cloud autonomous. Agent+Environment→Session. ant CLI. Runs unattended.' },
            { front: '.claude/?', back: 'settings.json, commands/, rules/, skills/, agents/. Commit except .local.' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Build clawpilot-lite (7-Layer Setup)',
        scenario: 'Build a project exercising ALL 7 layers of Claude Code: Foundation, Memory, Skills, MCP, Commands, Orchestration, Workflows.',
        duration: '60-90 min', cost: 'Free (+ GitHub token for MCP)', difficulty: 'Advanced',
        prerequisites: ['Claude Code installed', 'GitHub account + Personal Access Token', 'Completed Phases 4-6'],
        steps: [
            { title: 'FOUNDATION: Install + scaffold', subtitle: 'Set up project and build FastAPI app', duration: '10 min', instructions: [
                { type: 'command', cmd: 'mkdir clawpilot-lite && cd clawpilot-lite && git init && claude' },
                'Run /init to generate CLAUDE.md. Then:',
                { type: 'prompt', text: 'Build a FastAPI task manager:\n- GET /health → {status: ok}\n- POST /tasks → {title, description} → saves to SQLite → returns task with ID\n- GET /tasks → all tasks\n- GET /tasks/{id} → one task or 404\n- DELETE /tasks/{id} → delete or 404\nUse SQLAlchemy + Pydantic. Include pytest tests. requirements.txt.' },
                { type: 'command', cmd: 'pip install -r requirements.txt\nuvicorn main:app --reload' },
                { type: 'verify', text: 'Open http://localhost:8000/docs — Swagger shows 5 endpoints. Create a task via Swagger, list tasks. Run pytest — all pass.' }
            ]},
            { title: 'LAYER 1 — Memory: CLAUDE.md + .claudeignore', subtitle: 'Configure persistent project instructions', duration: '5 min', instructions: [
                'Edit CLAUDE.md with your project specifics:',
                { type: 'code', language: 'markdown', code: '# Clawpilot Lite\n## Architecture: FastAPI + SQLite + SQLAlchemy + Pydantic\n## Commands: uvicorn main:app --reload | pytest -v\n## Style: Python 3.12, Black, type hints everywhere\n## DO NOT: log PII, commit .env, use raw SQL, disable tests' },
                'Create .claudeignore:',
                { type: 'code', language: 'text', code: '__pycache__/\n*.pyc\n*.db\n.env\nchroma_db/' },
                'Create CLAUDE.local.md: "I prefer verbose explanations. Server on port 8000."',
                { type: 'verify', text: 'Ask Claude Code: "What are our standards?" — it should reference your CLAUDE.md content.' }
            ]},
            { title: 'LAYER 2 — Skills: auto-invoked workflow', subtitle: 'Create a skill that auto-triggers', duration: '5 min', instructions: [
                { type: 'command', cmd: 'mkdir -p .claude/skills/api-endpoint' },
                'Create .claude/skills/api-endpoint/SKILL.md:',
                { type: 'code', language: 'markdown', code: '---\ndescription: "Create new API endpoints following conventions"\n---\n## Rules\n1. Use SQLAlchemy ORM\n2. Add Pydantic validation\n3. Return consistent error format\n4. Write 2 tests per endpoint\n5. Add docstring' },
                'Test: Ask Claude "Add a PUT /tasks/{id} endpoint"  — it should follow all 5 rules.',
                { type: 'verify', text: 'New endpoint uses ORM, has Pydantic model, has tests, has docstring.' }
            ]},
            { title: 'LAYER 3 — MCP: connect GitHub', subtitle: 'Create GitHub issues from Claude Code', duration: '10 min', instructions: [
                'Create GitHub Personal Access Token: github.com/settings/tokens → repo scope.',
                'Create .claude/settings.json:',
                { type: 'code', language: 'json', code: '{\n  "permissions": {"allow": ["read","write","execute"]},\n  "mcpServers": {\n    "github": {\n      "command": "npx",\n      "args": ["-y","@modelcontextprotocol/server-github"],\n      "env": {"GITHUB_TOKEN": "ghp_YOUR_TOKEN"}\n    }\n  }\n}' },
                'Restart Claude Code. Check: /mcp → should show github.',
                'Test: "Create a GitHub issue titled Add authentication with 3 acceptance criteria"',
                { type: 'verify', text: 'GitHub repo → Issues tab → new issue created by Claude Code.' }
            ]},
            { title: 'LAYER 4 — Commands + LAYER 5 — Agents', subtitle: 'Custom slash commands and sub-agent personas', duration: '10 min', instructions: [
                { type: 'command', cmd: 'mkdir -p .claude/commands .claude/rules .claude/agents' },
                'Create .claude/commands/review.md:',
                { type: 'code', language: 'text', code: 'Review changes for:\n1. Code quality (naming, DRY, SOLID)\n2. Security (OWASP Top 10)\n3. Missing tests\n4. Convention violations\nOutput: | # | Issue | Severity | File:Line | Fix |' },
                'Create .claude/rules/testing.md: "Every endpoint needs happy + error test."',
                'Create .claude/agents/code-reviewer.md:',
                { type: 'code', language: 'text', code: 'You are a senior code reviewer (15 years).\nReview for correctness, readability, security.\nGive file:line references. Rate quality 1-10.' },
                'Test: /project:review → should produce issue table.',
                { type: 'verify', text: '/project:review outputs findings table. Agent gives 1-10 score with line references.' }
            ]},
            { title: 'TOP FLOOR — Workflow + push', subtitle: 'Run PM workflow testing all layers', duration: '10 min', instructions: [
                { type: 'prompt', text: 'Run the full PM workflow:\n1. Analyse codebase architecture (3 sentences)\n2. Write a 1-page PRD for adding user authentication\n3. Break into 5 Jira-style tickets with acceptance criteria\n4. Create GitHub issue for ticket #1 via MCP\n5. Create Dockerfile + docker-compose.yml' },
                'Create comprehensive README explaining the 7-layer architecture.',
                { type: 'command', cmd: 'git add . && git commit -m "feat: 7-layer Claude Code setup"\ngit remote add origin https://github.com/YOUR_USERNAME/clawpilot-lite.git\ngit push -u origin main' },
                { type: 'verify', text: 'Repo has: CLAUDE.md, .claudeignore, .claude/ (settings, commands, rules, skills, agents), Dockerfile, README. GitHub issue exists. Tests pass.' }
            ]}
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 9 — PHASE 8: Multi-Agent
// ══════════════════════════════════════════════
{
    id: 'phase8-multi-agent', level: 200,
    title: 'Phase 8: Multi-Agent Systems',
    subtitle: 'Sequential pipeline, Orchestrator, Debate/Critic, Swarm. Build a 3-agent research pipeline.',
    icon: '🕸️',
    estimatedTime: '60m',
    diagrams: [
        {
            id: 'multi-agent-diagram',
            type: 'multi-agent',
            title: 'Orchestrator–Worker pattern',
            description: 'A planner agent decomposes the task and dispatches to specialist agents in parallel, then merges their outputs.',
            steps: [
                'Orchestrator receives the user request and plans the work.',
                'Researcher gathers facts from the web.',
                'Writer drafts the prose using the research.',
                'Coder produces working code.',
                'Reviewer critiques and the orchestrator merges everything into the final answer.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>Why Multi-Agent?</h2>
    <p>Like microservices for intelligence. Specialised roles produce better results than one overworked generalist.</p>
    <div class="code-block">Sequential:   Researcher → Writer → Editor
Orchestrator: Manager → Code + Test + Docs → combines
Debate:       Generator ↔ Critic iterate
Swarm:        Triage → routes to specialists</div>
    <h3>Claude Cowork</h3>
    <p>Background agents in parallel sandboxes. Assign and forget. Review when done.</p>
    <h3>Frameworks</h3>
    <table class="content-table">
        <tr><th>Framework</th><th>Pattern</th><th>Best For</th></tr>
        <tr><td><strong>CrewAI</strong></td><td>Role-based crews</td><td>Collaborative teams</td></tr>
        <tr><td><strong>LangGraph</strong></td><td>Graph with cycles</td><td>Complex looping workflows</td></tr>
        <tr><td><strong>Swarm</strong></td><td>Dynamic handoffs</td><td>Routing-based systems</td></tr>
    </table>
    <div class="warning-box"><h4>⚠️ Start with 2-3 agents. Each adds overhead + cost.</h4></div>
</div>
`,
    quiz: [
        { question: 'Why multi-agent?', options: ['Faster', 'Specialised roles = better results', 'Cheaper', 'No reason'], correct: 1, explanation: 'Each excels at their role.' },
        { question: 'Sequential?', options: ['Random', 'A→B→C, output feeds next', 'Parallel', 'One'], correct: 1, explanation: 'Fixed order, clear handoffs.' },
        { question: 'Orchestrator?', options: ['Random', 'Manager delegates + combines', 'Sequential', 'One'], correct: 1, explanation: 'PM assigns, specialists execute.' },
        { question: 'Cowork?', options: ['Chat', 'Background parallel agents', 'Video', 'DB'], correct: 1, explanation: 'Assign tasks, run while you sleep.' },
        { question: 'Challenge?', options: ['Models', 'Coordination, context loss, cost', 'Simple', 'One model'], correct: 1, explanation: 'More agents = more overhead.' },
        { question: 'Cycles?', options: ['CrewAI', 'LangGraph', 'Swarm', 'AutoGen'], correct: 1, explanation: 'Graph state machines with loops.' },
        { question: 'Debate?', options: ['Humans', 'Gen → Critic → improve → repeat', 'Competition', 'Random'], correct: 1, explanation: 'Self-improving through feedback.' },
        { question: 'Start with?', options: ['10', '2-3 max', '1 always', '100'], correct: 1, explanation: 'Scale only when needed.' }
    ],
    interactive: [
        { type: 'drag-drop', id: 'patterns', title: 'Scenario → Pattern', description: 'Match.', items: ['Research → Write → Edit', 'Manager → Code+Test+Docs', 'Writer ↔ Reviewer', 'Route to billing vs tech'], targets: { 'Sequential': ['Research → Write → Edit'], 'Orchestrator': ['Manager → Code+Test+Docs'], 'Debate': ['Writer ↔ Reviewer'], 'Swarm': ['Route to billing vs tech'] } },
        { type: 'flashcards', id: 'ma-cards', title: 'Multi-Agent Cards', cards: [
            { front: 'Patterns?', back: 'Sequential (A→B→C), Orchestrator (manager+workers), Debate (gen↔critic), Swarm (dynamic route).' },
            { front: 'Cowork?', back: 'Background parallel sandboxes. Assign and forget.' },
            { front: 'When NOT?', back: 'Simple tasks. 2-3 agents max to start.' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Build a 3-Agent Research Pipeline',
        scenario: 'Design and build: Researcher → Summariser → Critic. Run manually then automate with code.',
        duration: '45-60 min', cost: 'Free', difficulty: 'Advanced',
        prerequisites: ['Completed Phase 6', 'Claude Code installed'],
        steps: [
            { title: 'Design the pipeline', subtitle: 'Define agents, inputs, outputs, handoff contracts', duration: '10 min', instructions: [
                { type: 'command', cmd: 'mkdir multi-agent-research && cd multi-agent-research' },
                'Create DESIGN.md with this structure:',
                { type: 'code', language: 'markdown', code: '# Multi-Agent Research Pipeline\n\n## Agent 1: Researcher\n- Input: Topic (string)\n- Job: Find 10 key facts with data points\n- Output: JSON [{fact, source, confidence}]\n\n## Agent 2: Summariser\n- Input: Researcher JSON\n- Job: 500-word executive briefing citing fact numbers\n- Rule: ONLY use provided facts\n\n## Agent 3: Critic\n- Input: Briefing + original facts\n- Job: Score clarity/accuracy/completeness (1-10)\n- Output: JSON {clarity, accuracy, completeness, improvements}' },
                { type: 'verify', text: 'DESIGN.md exists with all 3 agents, their I/O formats, and contracts.' }
            ]},
            { title: 'Run pipeline manually in Claude', subtitle: '3 separate conversations, save each output', duration: '15 min', instructions: [
                { type: 'heading', text: 'Conversation 1 — Researcher' },
                'Open claude.ai. System: "Senior research analyst. Find 10 key facts as JSON." User: "AI agents in enterprise 2026"',
                'Save JSON output to agent1_output.json',
                { type: 'heading', text: 'Conversation 2 — Summariser' },
                'NEW conversation. System: "Content strategist. Create 500-word briefing from facts. Cite [Fact N]. DO NOT add info." User: [paste JSON]',
                'Save to agent2_output.md',
                { type: 'heading', text: 'Conversation 3 — Critic' },
                'NEW conversation. System: "Quality editor. Score clarity/accuracy/completeness 1-10. List improvements." User: "Facts: [JSON] Briefing: [text]"',
                'Save to agent3_output.json',
                { type: 'verify', text: '3 saved outputs. Briefing cites fact numbers. Critic gives specific scores and improvements.' }
            ]},
            { title: 'Automate with Claude Code', subtitle: 'Build the full pipeline in Python', duration: '15 min', instructions: [
                { type: 'command', cmd: 'claude' },
                { type: 'prompt', text: 'Build pipeline.py:\n1. Accept topic as CLI arg\n2. Agent 1 (Researcher): system prompt from DESIGN.md, call Gemini, parse JSON\n3. Agent 2 (Summariser): system prompt, include Agent 1 output, generate briefing\n4. Agent 3 (Critic): system prompt, include facts + briefing, parse scores\n5. Save all outputs to output/\n6. Print: each agent output, scores, total tokens, cost estimate\nrequirements.txt included.' },
                { type: 'command', cmd: 'python pipeline.py "How enterprises deploy AI agents in 2026"' },
                { type: 'verify', text: 'All 3 agents run sequentially. Scores printed. output/ has all files. No manual intervention needed.' }
            ]},
            { title: 'Document and push', subtitle: 'README + GitHub push', duration: '5 min', instructions: [
                { type: 'prompt', text: 'Create README: explain multi-agent patterns (4 types), our architecture, agent specs, setup, example output.' },
                { type: 'command', cmd: 'git init && git add . && git commit -m "3-agent research pipeline"\ngit remote add origin https://github.com/YOUR_USERNAME/multi-agent-research.git\ngit push -u origin main' },
                { type: 'verify', text: 'Repo has DESIGN.md, pipeline.py, README, output/. Visitor understands patterns and can run the pipeline.' }
            ]}
        ]
    }
}

];
