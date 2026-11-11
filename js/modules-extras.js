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
    subtitle: 'A simplified map of modern generative language models',
    icon: '⬡',
    estimatedTime: '5m',
    learn: `<div class="learn-section"><p>A simplified map, not a complete taxonomy. The nested boxes show modern generative language models within deep learning, ML, and AI. Generative methods also exist outside deep learning, and language models are not all chat generators.</p></div>`,
    diagrams: [
        {
            id: 'ai-stack-standalone',
            type: 'ai-stack',
            title: 'The AI Technology Stack',
            description: 'A simplified map of a modern generative-model subset, not a complete taxonomy of AI. The boxes do not imply that all generative AI uses deep learning or that all language models generate chat.',
            steps: [
                'AI — anything that simulates human intelligence (chess engines, spam filters).',
                'ML — AI that learns patterns from data instead of being hand-coded.',
                'DL — ML using layered neural networks.',
                'Generative deep models — the subset shown here creates text, images, or other content; generative methods also exist outside deep learning.',
                'Generative language models — the subset used in this course predicts tokens; language-model families also include non-generative encoders.'
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
            description: 'Illustrative candidate probabilities, not measured output. Vocabulary size and sampling controls depend on the tokenizer and model.',
            steps: [
                '"sat" is the most likely next token at 42% — the obvious continuation.',
                '"jumped" at 18% — plausible alternative.',
                '"ran" at 12% — less common but valid.',
                '"slept" at 8% — fine in a story context.',
                '"walked" at 5% — getting unusual.',
                'All other tokens share 15% in this illustrative distribution. Top-p keeps a set whose cumulative probability reaches its threshold.'
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
                'Generate a source-based answer, then verify its claims and citations; abstain when retrieved evidence is insufficient.'
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
    learn: `<div class="learn-section"><p>One multi-agent pattern: an orchestrator decomposes work and dispatches independent subtasks in parallel. Dependent work must wait for its inputs. Compare quality, latency, and cost with a single-agent or fixed workflow baseline; specialization is not a guarantee of better results.</p></div>`,
    diagrams: [
        {
            id: 'multi-agent-standalone',
            type: 'multi-agent',
            title: 'Orchestrator–Worker pattern',
            description: 'Independent workers may run in parallel; dependent workers wait for inputs. The orchestrator validates and merges results.',
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
    learn: `<div class="learn-section"><p>Model Context Protocol in one picture. Reuse depends on protocol and transport compatibility, capability negotiation, authentication, permissions, and host support; a common wire format alone is not enough.</p></div>`,
    diagrams: [
        {
            id: 'mcp-architecture-standalone',
            type: 'mcp-architecture',
            title: 'MCP — client / server architecture',
            description: 'JSON-RPC over an agreed transport. Capability negotiation determines supported surfaces; check protocol versions, authentication, permissions, and host support.',
            steps: [
                'Client side: an LLM agent runs inside a host app and uses the MCP runtime to discover and call servers.',
                'Transport: JSON-RPC messages use the standard stdio or Streamable HTTP transport; custom transports require explicit interoperability design.',
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
    learn: `<div class="learn-section"><p>A long context limit does not guarantee accurate use of every passage. Position effects vary by model and task. This synthetic curve illustrates a possible failure, not measured performance.</p></div>`,
    diagrams: [
        {
            id: 'context-decay-standalone',
            type: 'context-decay',
            title: 'Lost in the middle — recall vs context position',
            description: 'Illustrative position-effect curve, not a benchmark. Test evidence at several positions on your model; evaluate retrieval, chunking, and summaries rather than assuming they solve the problem.',
            steps: [
                'This illustrative curve starts high; test your model rather than assuming early evidence is recalled.',
                'The middle dip represents a possible retrieval failure, not a universal decay rate.',
                'An end-position gain is possible. Move the same evidence between positions and compare accuracy.'
            ]
        }
    ]
}

];
