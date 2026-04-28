/* ============================================
   MODULES EXTRAS — Standalone atomic modules
   One per diagram so each can be re-visited from the sidebar
   without re-loading a 60-minute phase.

   Pattern matches azure-networking-academy/js/modules-extras.js.
   ============================================ */

const MODULES_EXTRAS = [

// ─── L100 standalone diagrams ───────────────────
{
    id: 'ai-stack',
    level: 100,
    title: 'The AI Technology Stack',
    subtitle: 'Nested fields: AI ⊃ ML ⊃ DL ⊃ GenAI ⊃ LLMs',
    icon: '⬡',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>A focused diagram for the AI stack. The most useful chunk of Phase 0 to revisit.</p></div>`,
    diagrams: [
        {
            id: 'ai-stack-standalone',
            type: 'ai-stack',
            title: 'The AI Technology Stack',
            description: 'AI is a stack of nested fields. Each inner layer is a special case of the layer that contains it.',
            steps: [
                'AI — anything that simulates human intelligence (chess engines, spam filters).',
                'ML — AI that learns patterns from data instead of being hand-coded.',
                'DL — ML using layered neural networks.',
                'GenAI — DL that creates new content (text, images, video).',
                'LLMs — generative AI specialised in text. The thing you talk to.'
            ]
        }
    ]
},
{
    id: 'tokenisation',
    level: 100,
    title: 'Tokenisation Visualised',
    subtitle: 'What the model actually sees',
    icon: '🔡',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>Sub-word tokenisation explains why prompts have a token cost and why "API" + " API" are different tokens.</p></div>`,
    diagrams: [
        {
            id: 'tokenisation-standalone',
            type: 'tokenisation',
            title: 'Tokenisation — text → token IDs',
            description: 'You type words; the model sees integer token IDs. Roughly 4 characters per token in English.',
            steps: [
                'Token 1: "The (capitalised, includes opening quote).',
                'Token 2: cat (note the leading space, which is part of the token).',
                'Token 3: sat — common verb, single token.',
                'Token 4: on — short preposition, also one token.',
                'Token 5: the — same letters as token 1 but different ID (no quote, lower-case).',
                'Token 6: mat — same pattern: leading space + word.',
                'Token 7: " — closing quote, its own token.'
            ]
        }
    ]
},
{
    id: 'next-token',
    level: 100,
    title: 'Next-Token Prediction',
    subtitle: 'Probabilities + temperature',
    icon: '🎲',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>Why every LLM call is fundamentally a probability distribution. This is the entire mental model behind temperature, top-p, and "the model is just autocomplete".</p></div>`,
    diagrams: [
        {
            id: 'next-token-standalone',
            type: 'next-token',
            title: 'Next-token probability distribution',
            description: 'Top-k candidates and how sampling picks one.',
            steps: [
                '"sat" is the most likely next token at 42% — the obvious continuation.',
                '"jumped" at 18% — plausible alternative.',
                '"ran" at 12% — less common but valid.',
                '"slept" at 8% — fine in a story context.',
                '"walked" at 5% — getting unusual.',
                'The remaining 50K-ish tokens collectively share 15%. Top-p sampling truncates this long tail.'
            ]
        }
    ]
},

// ─── L200 standalone diagrams ───────────────────
{
    id: 'rag-pipeline',
    level: 200,
    title: 'RAG Pipeline Visualised',
    subtitle: 'Query → embed → retrieve → augment → generate',
    icon: '🔗',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>The 5-stage RAG pipeline as one picture. The single most important diagram for production AI systems.</p></div>`,
    diagrams: [
        {
            id: 'rag-pipeline-standalone',
            type: 'rag-pipeline',
            title: 'RAG end-to-end',
            description: 'Index once, retrieve at query time, augment the prompt, generate.',
            steps: [
                'User query arrives in natural language.',
                'Embed the query with the same model used at index time.',
                'Vector DB returns the top-k nearest chunks by cosine similarity.',
                'Augment: stuff the chunks into the prompt as context.',
                'Generate: model answers grounded in the retrieved chunks.'
            ]
        }
    ]
},
{
    id: 'embedding-space',
    level: 200,
    title: 'Embedding Space',
    subtitle: 'Why semantic search works',
    icon: '🌌',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>2-D projection of high-dimensional embeddings — similar meanings cluster together. Cosine distance turns "find related docs" into a vector lookup.</p></div>`,
    diagrams: [
        {
            id: 'embedding-space-standalone',
            type: 'embedding-space',
            title: 'Embedding space scatter',
            description: 'Each text chunk is a point. Similar meanings cluster. A query lands somewhere; the nearest neighbours are what RAG retrieves.',
            steps: [
                'Animals cluster together top-left.',
                'Vehicles cluster top-right.',
                'Programming languages cluster bottom-left.',
                'Foods cluster bottom-right.',
                'A query embedding lands somewhere in the space; cosine distance picks the nearest known points.'
            ]
        }
    ]
},
{
    id: 'tool-calling',
    level: 200,
    title: 'Function Calling Sequence',
    subtitle: 'Model ↔ app ↔ API handshake',
    icon: '🔁',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>The message-by-message handshake when a model uses a tool. The model never executes anything — your code does.</p></div>`,
    diagrams: [
        {
            id: 'tool-calling-standalone',
            type: 'tool-calling',
            title: 'Function calling — the message handshake',
            description: 'A 6-step round-trip from user question to final answer.',
            steps: [
                '1. User message in.',
                '2. Model decides: "I need a tool" → emits tool_call JSON.',
                '3. Your app reads the JSON and calls the real function or API.',
                '4. Tool returns data.',
                '5. App sends a tool_result message back to the model.',
                '6. Model produces the user-facing answer.'
            ]
        }
    ]
},
{
    id: 'agent-loop',
    level: 200,
    title: 'ReAct Agent Loop',
    subtitle: 'Thought → Action → Observation → repeat',
    icon: '🔄',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>An agent is just tool-calling wrapped in a loop. Each iteration the model decides whether to keep going.</p></div>`,
    diagrams: [
        {
            id: 'agent-loop-standalone',
            type: 'agent-loop',
            title: 'The ReAct loop',
            description: 'Reason about what to do, take an action, observe the result, repeat until done.',
            steps: [
                'Thought — the model reasons about what to do next.',
                'Action — it picks a tool and arguments.',
                'Observation — the tool result becomes new context.',
                '…then back to Thought. Loop until the model emits a final answer.'
            ]
        }
    ]
},
{
    id: 'multi-agent',
    level: 200,
    title: 'Multi-Agent Orchestrator',
    subtitle: 'Plan → fan-out → merge',
    icon: '🕸',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>The single most common multi-agent pattern: an orchestrator decomposes work and dispatches specialists in parallel.</p></div>`,
    diagrams: [
        {
            id: 'multi-agent-standalone',
            type: 'multi-agent',
            title: 'Orchestrator–Worker pattern',
            description: 'Workers run in parallel. Orchestrator merges results into a final answer.',
            steps: [
                'Orchestrator receives the user request and plans the work.',
                'Researcher gathers facts from the web.',
                'Writer drafts the prose.',
                'Coder produces working code.',
                'Reviewer critiques and the orchestrator merges everything into the final answer.'
            ]
        }
    ]
},

// ─── L300 standalone diagrams ───────────────────
{
    id: 'mcp-architecture',
    level: 300,
    title: 'MCP Architecture',
    subtitle: 'Client / server / tools / resources / prompts',
    icon: '🔌',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>Model Context Protocol in one picture. Build a tool once, any compatible client can use it.</p></div>`,
    diagrams: [
        {
            id: 'mcp-architecture-standalone',
            type: 'mcp-architecture',
            title: 'MCP — client / server architecture',
            description: 'JSON-RPC over a transport. Servers expose three surfaces (tools, resources, prompts) and any compatible client can use any server.',
            steps: [
                'Client side: an LLM agent runs inside a host app and uses the MCP runtime to discover and call servers.',
                'Transport: JSON-RPC messages travel over stdio, HTTP, or WebSocket.',
                'Server side: exposes tools (callable functions), resources (readable data), and prompts (reusable templates).'
            ]
        }
    ]
},
{
    id: 'context-decay',
    level: 300,
    title: 'Lost in the Middle',
    subtitle: 'Recall accuracy vs context position',
    icon: '📉',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>Long context windows do not mean even attention. Important facts buried in the middle frequently get missed.</p></div>`,
    diagrams: [
        {
            id: 'context-decay-standalone',
            type: 'context-decay',
            title: 'Lost in the middle — recall vs context position',
            description: 'Recall is U-shaped: high at the start and end, sagging in the middle. Mitigate with RAG, chunking, and re-stating critical info near the end.',
            steps: [
                'High recall at the start — the system prompt and earliest instructions stick.',
                'Recall sags through the middle — important facts buried here often go missed.',
                'Recency bump at the very end — the most recent turn is heavily weighted.'
            ]
        }
    ]
}

];
