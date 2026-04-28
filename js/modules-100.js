/* ============================================
   LEVEL 100 — FOUNDATIONS (April 2026)
   Phase 0: Orientation | Phase 1: Prompting
   Phase 2: Platforms   | Phase 3: AI from Code
   
   Uses Lab Engine v2 with rich structured steps
   ============================================ */

const MODULES_100 = [

// ══════════════════════════════════════════════
// MODULE 1 — PHASE 0: AI Orientation
// ══════════════════════════════════════════════
{
    id: 'phase0-orientation',
    level: 100,
    title: 'Phase 0: AI Orientation',
    subtitle: 'What LLMs really are, how they work under the hood, the 2026 landscape, and your learning roadmap',
    icon: '🧭',
    estimatedTime: '45m',
    diagrams: [
        {
            id: 'ai-stack-diagram',
            type: 'ai-stack',
            title: 'The AI Technology Stack',
            description: 'AI is a stack of nested fields. LLMs are a specific kind of generative AI, which is a specific kind of deep learning, which is a specific kind of machine learning, which is a specific kind of AI.',
            steps: [
                'AI — any system that simulates human intelligence (chess engines, spam filters).',
                'Machine Learning — AI that learns patterns from data instead of being hand-coded.',
                'Deep Learning — ML using layered neural networks (image / speech recognition).',
                'Generative AI — DL that creates new content (text, images, video).',
                'Large Language Models — generative AI specialised in text. The thing you talk to.'
            ]
        },
        {
            id: 'tokenisation-diagram',
            type: 'tokenisation',
            title: 'Tokenisation — what the model actually sees',
            description: 'You type words; the model sees integer token IDs. Roughly 4 characters per token in English. This is why your prompts have a token cost, and why prices are quoted per million tokens.',
            steps: [
                'Token 1: "The — capitalised, includes opening quote.',
                'Token 2: cat — note the leading space, which is part of the token.',
                'Token 3: sat — common verb, single token.',
                'Token 4: on — short preposition, also one token.',
                'Token 5: the — same letters as Token 1 but different ID (no quote, lower-case).',
                'Token 6: mat — same pattern: leading space + word.',
                'Token 7: " — closing quote, its own token.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>What is an LLM — Really?</h2>
    <p>A Large Language Model is a neural network trained on trillions of words. It learned statistical patterns — which words follow which, in which contexts. When you give it a prompt, it <strong>predicts the next most likely token</strong>, one at a time, like autocomplete on steroids.</p>
    <p>This means LLMs are astonishingly good at language tasks — writing, coding, summarising, translating — because "pick the most plausible continuation" produces great results for text. But they have <strong>no ground-truth knowledge</strong> and <strong>no persistent memory</strong>. They hallucinate because plausible ≠ correct.</p>
    
    <div class="concept-box">
        <h4>🧠 The Intern Mental Model</h4>
        <p><strong>LLM = a very smart intern who has read the entire internet but has zero memory and no life experience.</strong></p>
        <ul>
            <li>They know a lot but cannot verify anything they say</li>
            <li>They follow instructions but can misinterpret ambiguity</li>
            <li>They are eager to help but will <strong>confidently fabricate information</strong></li>
            <li>They perform dramatically better with clear, structured instructions</li>
            <li>They forget EVERYTHING between conversations</li>
        </ul>
        <p>Treat them accordingly: give good instructions, verify critical outputs, never trust blindly.</p>
    </div>

    <div class="tip-box">
        <h4>🎯 For PMs — the upgrade path</h4>
        <p>Once this Phase clicks, jump to <strong>PM Playbook: Communicating AI to Execs</strong> for the exec-friendly vocabulary, then <strong>Build vs Buy vs Wait</strong>. Together they let you defend any AI roadmap call.</p>
    </div>
</div>

<div class="learn-section">
    <h2>The AI Technology Stack</h2>
    <p>AI is not one thing — it is a stack. Understanding each layer helps you know what LLMs can and cannot do:</p>
    <table class="content-table">
        <tr><th>Layer</th><th>What It Is</th><th>Examples</th></tr>
        <tr><td><strong>Artificial Intelligence</strong></td><td>Machines simulating human intelligence</td><td>Chess engines, spam filters, self-driving cars</td></tr>
        <tr><td><strong>Machine Learning</strong></td><td>AI that learns patterns from data</td><td>Netflix recommendations, fraud detection</td></tr>
        <tr><td><strong>Deep Learning</strong></td><td>ML using layered neural networks</td><td>Image recognition, speech-to-text</td></tr>
        <tr><td><strong>Generative AI</strong></td><td>DL that creates new content</td><td>ChatGPT, Midjourney, Sora, Claude</td></tr>
        <tr><td><strong>Large Language Models</strong></td><td>GenAI for text understanding and generation</td><td>GPT-5.4, Claude Opus 4.6, Gemini 3.1</td></tr>
    </table>
</div>

<div class="learn-section">
    <h2>How LLMs Work — Under the Hood</h2>
    
    <h3>The Pre-Training Pipeline</h3>
    <table class="content-table">
        <tr><th>Stage</th><th>What Happens</th><th>Details</th></tr>
        <tr><td><strong>1. Data Collection</strong></td><td>Crawl the internet at massive scale</td><td>Common Crawl: petabytes of web data. Also books, papers, code repos.</td></tr>
        <tr><td><strong>2. Data Cleaning</strong></td><td>Filter junk, duplicates, toxic content</td><td>RefinedWeb, Dolma, FineWeb — curated datasets removing noise.</td></tr>
        <tr><td><strong>3. Tokenisation (BPE)</strong></td><td>Break text into tokens</td><td>Byte-Pair Encoding: "unhappiness" → ["un","happi","ness"]. ~50K-100K token vocabulary.</td></tr>
        <tr><td><strong>4. Architecture</strong></td><td>Transformer with attention mechanism</td><td>GPT family (decoder-only), Llama (open-source), T5 (encoder-decoder).</td></tr>
        <tr><td><strong>5. Training</strong></td><td>Predict next token, adjust weights</td><td>Thousands of GPUs running for weeks. Cost: $10M-$100M+ for frontier models.</td></tr>
        <tr><td><strong>6. Alignment</strong></td><td>Make helpful, harmless, honest</td><td>RLHF (Reinforcement Learning from Human Feedback), Constitutional AI (Anthropic).</td></tr>
    </table>

    <h3>Key Technical Concepts</h3>
    <table class="content-table">
        <tr><th>Concept</th><th>What It Means</th><th>Why You Care</th></tr>
        <tr><td><strong>Tokens</strong></td><td>Text units of ~3-4 characters. 1,000 tokens ≈ 750 words.</td><td>All pricing and context limits are in tokens.</td></tr>
        <tr><td><strong>Context Window</strong></td><td>Max tokens visible at once (input + output combined)</td><td>Claude 4.6: 1M · GPT-5.4: 270K · Gemini 3.1: 1M+</td></tr>
        <tr><td><strong>Temperature</strong></td><td>Controls randomness. 0 = deterministic. 1 = creative.</td><td>Low for facts, high for brainstorming.</td></tr>
        <tr><td><strong>System Prompt</strong></td><td>Hidden instructions defining AI behaviour</td><td>The single most powerful lever for controlling output.</td></tr>
        <tr><td><strong>Hallucination</strong></td><td>Generating plausible but factually wrong text</td><td>Always verify critical facts. The model is sometimes confidently wrong.</td></tr>
        <tr><td><strong>Extended Thinking</strong></td><td>Models show step-by-step reasoning before answering</td><td>Dramatically improves accuracy on complex problems. Available in Claude 4.6 and GPT-5.4.</td></tr>
    </table>

    <h3>Generation Strategies</h3>
    <p>When the model outputs probability distributions, HOW it picks the next token matters:</p>
    <table class="content-table">
        <tr><th>Strategy</th><th>How</th><th>Use</th></tr>
        <tr><td><strong>Greedy</strong></td><td>Always pick highest-probability token</td><td>Deterministic but can loop</td></tr>
        <tr><td><strong>Top-K</strong></td><td>Only consider K most probable tokens</td><td>Prevents wild improbable outputs</td></tr>
        <tr><td><strong>Top-P (Nucleus)</strong></td><td>Sample tokens until cumulative prob reaches P</td><td>Adaptive: more options when uncertain</td></tr>
        <tr><td><strong>Beam Search</strong></td><td>Track multiple candidate sequences</td><td>Better quality for translation</td></tr>
    </table>

    <h3>The Adaptation Hierarchy</h3>
    <p>Always try in this order — each step is more expensive:</p>
    <table class="content-table">
        <tr><th>Technique</th><th>What</th><th>Cost</th><th>When</th></tr>
        <tr><td><strong>Prompt Engineering</strong></td><td>Control via instructions</td><td>Free</td><td>90% of use cases — always try first</td></tr>
        <tr><td><strong>RAG</strong></td><td>Retrieve docs, inject into prompt</td><td>Low-Medium</td><td>Model needs your specific knowledge</td></tr>
        <tr><td><strong>LoRA / PEFT</strong></td><td>Train small adapter layers</td><td>Medium</td><td>Need to change behaviour efficiently</td></tr>
        <tr><td><strong>Full Fine-Tuning</strong></td><td>Retrain the model on your data</td><td>High</td><td>Need deep behavioural changes</td></tr>
    </table>
</div>

<div class="learn-section">
    <h2>The Big Three Platforms — April 2026</h2>
    <div class="comparison-grid">
        <div class="comparison-card">
            <h4>🟢 OpenAI / ChatGPT</h4>
            <ul>
                <li><strong>Models:</strong> GPT-5.4 ($2.50/1M), mini ($0.75), nano ($0.20)</li>
                <li><strong>Context:</strong> 270K tokens</li>
                <li><strong>Products:</strong> Custom GPTs, Canvas, Codex (cloud agent), Sora (video), GPT-image-1.5</li>
                <li><strong>Best at:</strong> General purpose, images, video, consumer UX</li>
                <li><strong>Plans:</strong> Free / Plus $20 / Pro $200</li>
            </ul>
        </div>
        <div class="comparison-card">
            <h4>🟣 Anthropic / Claude</h4>
            <ul>
                <li><strong>Models:</strong> Opus 4.6 ($5/1M), Sonnet 4.6 ($3), Haiku 4.5 ($1)</li>
                <li><strong>Context:</strong> 1M tokens (Opus & Sonnet)</li>
                <li><strong>Products:</strong> Claude Code, Cowork, Projects, Artifacts, Managed Agents, MCP</li>
                <li><strong>Best at:</strong> Coding, agents, complex instructions, long documents</li>
                <li><strong>Plans:</strong> Free / Pro $20 / Max $100</li>
            </ul>
        </div>
        <div class="comparison-card">
            <h4>🔵 Google / Gemini</h4>
            <ul>
                <li><strong>Models:</strong> Gemini 3.1 Pro, 3 Flash, 2.5 Pro/Flash</li>
                <li><strong>Context:</strong> 1M+ tokens</li>
                <li><strong>Products:</strong> NotebookLM, Deep Research, AI Studio (free), Veo 3.1, Computer Use</li>
                <li><strong>Best at:</strong> Research, multimodal, huge documents, Google Workspace</li>
                <li><strong>Plans:</strong> Free / Advanced $20</li>
            </ul>
        </div>
    </div>
    <div class="warning-box">
        <h4>⚠️ No Single "Best" AI</h4>
        <p>Expert AI users know when to reach for which tool: Claude for coding and agents, ChatGPT for images and creative tasks, Gemini for research and massive documents. <strong>Use all three.</strong></p>
    </div>
</div>

<div class="learn-section">
    <h2>🧱 How to Structure an AI Project</h2>
    <p>Throughout this course you will build 10+ projects. Here is the standard structure for any AI project:</p>
    <div class="code-block">my-ai-project/
├── CLAUDE.md .............. AI dev instructions (if using Claude Code)
├── README.md .............. What this is, how to run, architecture
├── product-brief.md ....... Who, what pain, why AI, success metric
├── requirements.txt ....... Python dependencies
├── .env.example ........... Template for API keys
├── .gitignore ............. Exclude .env, __pycache__, etc.
├── .claude/ ............... Claude Code config (skills, commands, rules)
├── src/ ................... Source code
│   ├── main.py
│   ├── agents/ ............ Agent definitions
│   └── tools/ ............. Tool/function definitions
├── tests/ ................. pytest tests
├── docs/ .................. Knowledge base docs (for RAG projects)
└── output/ ................ Generated artifacts</div>
    
    <h3>The 3 Identities You Develop</h3>
    <table class="content-table">
        <tr><th>Identity</th><th>Core Question</th><th>What It Means</th></tr>
        <tr><td><strong>🛠 Builder</strong></td><td>Can you build it?</td><td>Agents, APIs, RAG, deployment — hands-on technical skill</td></tr>
        <tr><td><strong>🧭 Product Thinker</strong></td><td>Should you build it?</td><td>User problems, value, metrics, Jobs-To-Be-Done</td></tr>
        <tr><td><strong>🏗 Product Leader</strong></td><td>Can you scale it?</td><td>Vision, teams, roadmaps, strategy</td></tr>
    </table>
</div>

<div class="learn-section">
    <h2>🎓 Official Anthropic Learning Resources</h2>
    <p>Anthropic provides free, high-quality courses and tutorials. Complete these alongside this academy for the deepest understanding.</p>

    <h3>Anthropic Academy Courses (Free + Certificate)</h3>
    <table class="content-table">
        <tr><th>Course</th><th>Content</th><th>Duration</th><th>Best For Phase</th></tr>
        <tr>
            <td><strong><a href="https://anthropic.skilljar.com/claude-code-101" target="_blank">Claude Code 101</a></strong></td>
            <td>Agentic loop, installing Claude Code, Explore→Plan→Code→Commit workflow, CLAUDE.md, subagents, skills, MCP, hooks</td>
            <td>12 lectures, 1.5 hrs video, 1 quiz</td>
            <td>Phase 7</td>
        </tr>
        <tr>
            <td><strong><a href="https://anthropic.skilljar.com/claude-with-the-anthropic-api" target="_blank">Building with the Claude API</a></strong></td>
            <td>API fundamentals, prompt engineering, tool use, RAG, MCP servers, Claude Code + Computer Use, agent architectures</td>
            <td>84 lectures, 8.1 hrs video, 10 quizzes</td>
            <td>Phases 3-9</td>
        </tr>
    </table>

    <h3>Claude Tutorials Hub</h3>
    <p>Written guides and video lessons at <a href="https://claude.com/resources/tutorials" target="_blank">claude.com/resources/tutorials</a>. Key picks by category:</p>
    <table class="content-table">
        <tr><th>Category</th><th>Tutorial</th><th>Link</th></tr>
        <tr><td><strong>Getting Started</strong></td><td>Getting Good at Claude: A Research-Backed Curriculum</td><td><a href="https://claude.com/resources/tutorials/getting-good-at-claude-a-research-backed-curriculum" target="_blank">Open</a></td></tr>
        <tr><td><strong>Getting Started</strong></td><td>Navigating the Claude Desktop App: Chat, Cowork, Claude Code</td><td><a href="https://claude.com/resources/tutorials/navigating-the-claude-desktop-app" target="_blank">Open</a></td></tr>
        <tr><td><strong>Models</strong></td><td>Choosing the Right Claude Model: Haiku, Sonnet, Opus</td><td><a href="https://claude.com/resources/tutorials/choosing-the-right-claude-model" target="_blank">Open</a></td></tr>
        <tr><td><strong>Models</strong></td><td>Get the Most from Claude Opus 4.6</td><td><a href="https://claude.com/resources/tutorials/get-the-most-from-claude-opus-4-6" target="_blank">Open</a></td></tr>
        <tr><td><strong>Claude Code</strong></td><td>What Are Skills?</td><td><a href="https://claude.com/resources/tutorials/what-are-skills" target="_blank">Open</a></td></tr>
        <tr><td><strong>Claude Code</strong></td><td>How Skills Compare to Other Claude Code Features</td><td><a href="https://claude.com/resources/tutorials/how-skills-compare-to-other-claude-code-features" target="_blank">Open</a></td></tr>
        <tr><td><strong>Claude Code</strong></td><td>Using Claude Code Remote Control</td><td><a href="https://claude.com/resources/tutorials/using-claude-code-remote-control" target="_blank">Open</a></td></tr>
        <tr><td><strong>Agents</strong></td><td>What is Claude Managed Agents?</td><td><a href="https://claude.com/resources/tutorials/what-is-claude-managed-agents" target="_blank">Open</a></td></tr>
        <tr><td><strong>Cowork</strong></td><td>Set Up Claude Cowork to Work the Way You Do</td><td><a href="https://claude.com/resources/tutorials/cowork-onboarding-guide" target="_blank">Open</a></td></tr>
        <tr><td><strong>Cowork</strong></td><td>How to Build a Plugin from Scratch in Claude Cowork</td><td><a href="https://claude.com/resources/tutorials/how-to-build-a-plugin-from-scratch-in-cowork" target="_blank">Open</a></td></tr>
        <tr><td><strong>Cowork</strong></td><td>Dispatch in Claude Cowork: Assign Tasks from Mobile</td><td><a href="https://claude.com/resources/tutorials/dispatch-in-claude-cowork" target="_blank">Open</a></td></tr>
        <tr><td><strong>Education</strong></td><td>Visuals That Appear as You Study with Claude</td><td><a href="https://claude.com/resources/tutorials/imagine-with-claude-student-guide" target="_blank">Open</a></td></tr>
        <tr><td><strong>Productivity</strong></td><td>Simplify Browsing with Claude for Chrome</td><td><a href="https://claude.com/resources/tutorials/simplify-your-browsing-experience-with-claude-for-chrome" target="_blank">Open</a></td></tr>
    </table>
    <div class="warning-box"><h4>💡 Recommended Study Order</h4>
    <p>1. Read "Getting Good at Claude" tutorial first — it gives you the research-backed learning path.<br>
    2. Take Claude Code 101 when you reach Phase 7.<br>
    3. Take Building with the Claude API alongside Phases 3-9 (each section maps to a phase).<br>
    4. Explore Cowork tutorials after Phase 8 for the managed autonomous agent perspective.</p></div>
</div>
`,
    quiz: [
        { question: 'What does an LLM do technically?', options: ['Searches a database of facts', 'Predicts the next most likely token based on training patterns', 'Runs logical rules', 'Stores and retrieves memories'], correct: 1, explanation: 'LLMs are token-prediction engines. One token at a time. Plausible ≠ correct.' },
        { question: 'What is the "intern mental model"?', options: ['Perfect memory', 'Smart but no memory, confidently wrong, needs clear instructions', 'Always correct', 'A search engine'], correct: 1, explanation: 'Knows a lot, forgets between conversations, can fabricate. Give clear instructions.' },
        { question: 'What is BPE tokenisation?', options: ['Word splitting', 'Iteratively merging frequent character pairs into tokens', 'Sentence splitting', 'Random chunking'], correct: 1, explanation: 'Start with characters, merge frequent pairs. Creates efficient vocabulary.' },
        { question: 'Which platform has 1M+ context?', options: ['GPT-5.4 only', 'Claude Opus 4.6 and Gemini 3.1', 'All are equal', 'None above 100K'], correct: 1, explanation: 'Claude Opus/Sonnet 4.6: 1M. Gemini 3.1: 1M+. GPT-5.4: 270K.' },
        { question: 'What does temperature control?', options: ['Response speed', 'Randomness — 0 = precise, 1 = creative', 'Cost', 'Context size'], correct: 1, explanation: 'Temperature 0 = always most probable token. 1 = sample from distribution.' },
        { question: 'What is hallucination?', options: ['A visual bug', 'Generating confident but factually wrong output', 'When AI refuses', 'A model type'], correct: 1, explanation: 'Plausible ≠ correct. Always verify critical outputs.' },
        { question: 'Adaptation hierarchy order?', options: ['Fine-tune first', 'Prompt Eng → RAG → LoRA → Fine-Tune', 'RAG first always', 'Random'], correct: 1, explanation: 'Try cheapest first. Most problems solved by prompting or RAG.' },
        { question: 'What makes agents different from chatbots?', options: ['Faster', 'They take real actions (edit files, run code, browse web)', 'Cheaper', 'No difference'], correct: 1, explanation: 'Chatbots: text in/out. Agents: plan, use tools, execute, iterate until done.' }
    ],
    interactive: [
        { type: 'drag-drop', id: 'platform-products', title: 'Match Product → Company', description: 'Drag each product to its company.', items: ['Claude Code', 'Codex', 'NotebookLM', 'Custom GPTs', 'Cowork', 'Deep Research', 'Sora', 'MCP'], targets: { 'Anthropic': ['Claude Code', 'Cowork', 'MCP'], 'OpenAI': ['Codex', 'Custom GPTs', 'Sora'], 'Google': ['NotebookLM', 'Deep Research'] } },
        { type: 'flashcards', id: 'orientation-cards', title: 'Core Concepts Flashcards', cards: [
            { front: 'LLM mental model?', back: 'Smart intern: read the internet, no memory, confidently wrong, needs clear instructions. Verify critical outputs.' },
            { front: 'What is a token?', back: '~3-4 characters. 1000 tokens ≈ 750 words. All pricing and context limits are measured in tokens.' },
            { front: 'Context windows 2026?', back: 'Claude 4.6: 1M. Gemini 3.1: 1M+. GPT-5.4: 270K. Larger = process longer documents.' },
            { front: 'Adaptation hierarchy?', back: 'Prompt Engineering → RAG → LoRA/PEFT → Fine-Tuning. Always try cheapest first.' },
            { front: 'AI project structure?', back: 'CLAUDE.md + README + product-brief.md + .env.example + .gitignore + src/ + tests/ + docs/ + output/' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Build Your AI Learning Journal',
        scenario: 'Create a learning journal repository, run a structured model comparison across ChatGPT, Claude, and Gemini, document your findings professionally, and push to GitHub. This is portfolio project #1.',
        duration: '30-45 minutes',
        cost: 'Free (all platforms have free tiers)',
        difficulty: 'Beginner',
        prerequisites: ['A GitHub account (github.com)', 'Git installed (git --version to check)', 'A text editor (VS Code recommended)'],
        steps: [
            {
                title: 'Create your repository',
                subtitle: 'Set up the project structure on your local machine',
                duration: '5 min',
                instructions: [
                    { type: 'heading', text: 'Create the folder structure' },
                    'Open your terminal (PowerShell on Windows, Terminal on Mac/Linux) and run these commands:',
                    { type: 'command', cmd: 'mkdir ai-learning-journal\ncd ai-learning-journal\ngit init\nmkdir journal' },
                    { type: 'heading', text: 'Create the README' },
                    'Open a text editor (VS Code: code README.md) and write:',
                    { type: 'code', language: 'markdown', code: '# AI Learning Journal\n**Author:** [Your Name]\n**Goal:** Go from AI user to AI builder\n**Started:** [Today\'s Date]\n\n## Planned Entries\n- Day 1: Model comparison (ChatGPT vs Claude vs Gemini)\n- Day 2: Prompt engineering experiments\n- Day 3: Platform tools (Custom GPT, Claude Project, NotebookLM)\n- Day 4: First Python AI script\n- ... (one entry per phase of the course)' },
                    'Save the file.',
                    { type: 'verify', text: 'Run <strong>ls</strong> (or <strong>dir</strong> on Windows) — you should see README.md and journal/. Run <strong>git status</strong> — should show "untracked files". Run <strong>cat README.md</strong> — should display your content.' }
                ]
            },
            {
                title: 'Run the 3-model comparison',
                subtitle: 'Test the same prompt across ChatGPT, Claude, and Gemini',
                duration: '10 min',
                instructions: [
                    { type: 'heading', text: 'Open all three platforms' },
                    { type: 'list', items: [
                        '<a href="https://chat.openai.com" target="_blank">chat.openai.com</a> (ChatGPT)',
                        '<a href="https://claude.ai" target="_blank">claude.ai</a> (Claude)',
                        '<a href="https://gemini.google.com" target="_blank">gemini.google.com</a> (Gemini)'
                    ]},
                    'Login or create free accounts on any you do not have.',
                    { type: 'heading', text: 'Run the comparison prompt' },
                    'Copy and paste this EXACT prompt into all three (do not modify — consistency matters):',
                    { type: 'prompt', text: 'Explain TCP/IP like I am 10 years old. Use a real-world analogy. Keep it under 200 words.' },
                    { type: 'heading', text: 'Evaluate each response' },
                    'For each response, score on paper (1-5):',
                    { type: 'list', items: [
                        '<strong>Audience match:</strong> Did it actually write for a 10-year-old, or did it use jargon?',
                        '<strong>Analogy quality:</strong> Was the analogy vivid, memorable, and accurate?',
                        '<strong>Constraint following:</strong> Did it stay under 200 words? (Copy into a word counter to check)',
                        '<strong>Overall clarity:</strong> If you read this aloud to a child, would they understand?'
                    ]},
                    { type: 'tip', text: 'At least one model will probably break the 200-word limit. Note which one — this tells you about instruction adherence.' },
                    { type: 'verify', text: 'You have 3 different responses saved. You have scores for each on 4 criteria. You noticed differences in tone, depth, and constraint following.' }
                ]
            },
            {
                title: 'Document your observations',
                subtitle: 'Write a structured comparison report',
                duration: '10 min',
                instructions: [
                    'Create a new file:',
                    { type: 'command', cmd: 'code journal/day1-model-comparison.md' },
                    'Use this template (fill in with your actual observations):',
                    { type: 'code', language: 'markdown', code: '## Model Comparison — [Date]\n\n### Prompt Used\n"Explain TCP/IP like I am 10 years old. Use a real-world analogy. Keep it under 200 words."\n\n### ChatGPT Response\n[Paste full response]\n\n**Evaluation:**\n- Audience match: X/5 — [why]\n- Analogy quality: X/5 — [why]\n- Constraint following: X/5 — [word count: N]\n- Overall clarity: X/5\n\n### Claude Response\n[Paste full response]\n\n**Evaluation:**\n[Same format]\n\n### Gemini Response\n[Paste full response]\n\n**Evaluation:**\n[Same format]\n\n### Key Observations\n- **Best at following constraints:** [model + why]\n- **Best analogy:** [model + why]\n- **Best overall for this task:** [model + why]\n- **Surprising finding:** [something unexpected]\n- **My preference by task type:**\n  - Coding: [model]\n  - Creative writing: [model]\n  - Research: [model]' },
                    { type: 'warning', text: 'Write genuine observations based on what you actually saw — not generic placeholder text. The value is in developing your own judgment.' },
                    { type: 'verify', text: 'Open the file and confirm: all 3 responses are pasted, all evaluations have specific scores and reasons, the Key Observations section reflects YOUR genuine opinion.' }
                ]
            },
            {
                title: 'Push to GitHub',
                subtitle: 'Make your learning journal public as portfolio project #1',
                duration: '5 min',
                instructions: [
                    { type: 'heading', text: 'Create a repository on GitHub' },
                    { type: 'list', items: [
                        'Go to <a href="https://github.com/new" target="_blank">github.com/new</a>',
                        'Name: <strong>ai-learning-journal</strong>',
                        'Description: "My AI learning journey — from user to builder"',
                        'Visibility: <strong>Public</strong> (this is a portfolio piece!)',
                        'Do NOT initialise with README (you already have one)',
                        'Click "Create repository"'
                    ]},
                    { type: 'heading', text: 'Push your code' },
                    { type: 'command', cmd: 'git add .\ngit commit -m "Day 1: Model comparison across ChatGPT, Claude, Gemini"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/ai-learning-journal.git\ngit push -u origin main' },
                    { type: 'tip', text: 'Replace YOUR_USERNAME with your actual GitHub username. If you get an auth error, create a Personal Access Token: GitHub → Settings → Developer Settings → Personal Access Tokens → Generate → select "repo" scope.' },
                    { type: 'verify', text: 'Visit github.com/YOUR_USERNAME/ai-learning-journal in your browser. Your README.md should display. Click into journal/ to see your comparison file. This is live on the internet — portfolio project #1 is done.' }
                ]
            }
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 2 — PHASE 1: Prompt Engineering
// ══════════════════════════════════════════════
{
    id: 'phase1-prompting',
    level: 100,
    title: 'Phase 1: Prompt Engineering',
    subtitle: 'Control AI outputs reliably — the RTCC framework, few-shot, chain-of-thought, XML prompting, and building your prompt library',
    icon: '✍️',
    estimatedTime: '60m',
    diagrams: [
        {
            id: 'next-token-diagram',
            type: 'next-token',
            title: 'Next-token prediction & temperature',
            description: 'At every step the model produces a probability over its full vocabulary (~100K tokens). Sampling picks one — the temperature setting controls how greedy vs creative that pick is.',
            steps: [
                '"sat" is the most likely next token at 42% — the obvious continuation.',
                '"jumped" at 18% — plausible alternative.',
                '"ran" at 12% — less common but valid.',
                '"slept" at 8% — fine in a story context.',
                '"walked" at 5% — getting unusual.',
                'The remaining 50K-ish tokens collectively share 15%. Top-p sampling truncates this long tail.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>Why Prompt Engineering Matters</h2>
    <p>The difference between a useless AI output and an exceptional one is <strong>almost always the prompt</strong>. A well-structured prompt does not "ask" — it <em>instructs</em>. It tells the AI who to be, what to do, how to format the output, and what to avoid.</p>
    <p>Think of it like managing an employee. "Do the thing" gets random results. Specific instructions get specific output.</p>

    <div class="concept-box">
        <h4>🎯 The 80/20 Rule of AI</h4>
        <p>80% of the value from AI comes from prompt quality. A well-engineered prompt 10x the output quality. This module teaches you to reliably get what you want, every time.</p>
    </div>
</div>

<div class="learn-section">
    <h2>The RTCC Framework</h2>
    <p>Every production-grade prompt has four components:</p>
    <table class="content-table">
        <tr><th>Component</th><th>What It Does</th><th>Example</th></tr>
        <tr><td><strong>Role</strong></td><td>Sets persona, expertise, perspective</td><td>"You are a senior cloud architect with 15 years of Azure experience specialising in cost optimisation."</td></tr>
        <tr><td><strong>Task</strong></td><td>The specific deliverable</td><td>"Analyse this Azure bill and identify the top 5 cost-saving opportunities, ranked by monthly savings."</td></tr>
        <tr><td><strong>Context</strong></td><td>Background, constraints, audience</td><td>"Healthcare company with 200 VMs, HIPAA compliance, $50K/month budget."</td></tr>
        <tr><td><strong>Constraints</strong></td><td>Rules, format, DO NOTs</td><td>"Markdown table. Under 3 sentences each. DO NOT suggest solutions requiring downtime."</td></tr>
    </table>

    <h3>Evolution of a Prompt</h3>
    <div class="code-block">❌ Bad:    "Explain APIs"                              → vague, generic output
🟡 Better: "Explain REST APIs to a beginner"              → better but no structure
🟢 Good:   "You are a senior engineer. Explain REST APIs 
            to a PM using a restaurant analogy. 
            Under 200 words. NO jargon."                   → specific, usable output
✅ Great:  [All of above + example of desired format]      → consistent, production-ready</div>
</div>

<div class="learn-section">
    <h2>Advanced Techniques</h2>

    <h3>1. Few-Shot Prompting</h3>
    <p>Provide 2-3 examples of the input→output pattern. The AI learns the pattern and applies it consistently.</p>
    <div class="code-block">Convert informal notes to action items:

Note: "talked to jim about server, needs fixing friday"
Action: "[P1] Resolve server issue — Owner: Jim, Due: Friday"

Note: "sarah mentioned caching might help"
Action: "[P3] Evaluate caching solutions — Owner: Sarah, Due: TBD"

Now do:
Note: "mike says db is slow, customers complaining"</div>

    <h3>2. Chain-of-Thought (CoT)</h3>
    <p>Adding "Think step by step" dramatically improves accuracy on complex reasoning tasks. The model lays out its logic, catching errors it would otherwise miss.</p>

    <h3>3. XML Tags (Claude-Optimised)</h3>
    <p>Claude was specifically trained to parse XML structure. Tags help it understand the priority and role of each section:</p>
    <div class="code-block">&lt;role&gt;SOC 2 compliance expert&lt;/role&gt;
&lt;task&gt;Review this security policy for gaps&lt;/task&gt;
&lt;context&gt;FinTech startup, 200 employees, pre-audit&lt;/context&gt;
&lt;policy&gt;[paste document here]&lt;/policy&gt;
&lt;format&gt;Gap | Control | Severity | Fix | Effort (days)&lt;/format&gt;</div>

    <h3>4. Meta-Prompting</h3>
    <p>"Write me the optimal prompt for [task]" — AI writes better prompts than most people can manually.</p>

    <h3>5. Prompt Chaining</h3>
    <p>Break complex tasks into a pipeline: Step 1 output → Step 2 input → Step 3 input.</p>

    <h3>6. Negative Constraints</h3>
    <p>"DO NOT use buzzwords. DO NOT add closing pleasantries." Blocks default patterns the AI would otherwise include.</p>

    <div class="tip-box">
        <h4>💡 Iterative Refinement</h4>
        <p>Never expect perfection on try #1. Follow up: "More concise." "Add depth to section 3." "Make it more professional." Great prompting is a conversation, not a single shot.</p>
    </div>
</div>
`,
    quiz: [
        { question: 'What is the RTCC framework?', options: ['Run, Test, Check, Commit', 'Role, Task, Context, Constraints', 'Read, Think, Code, Compile', 'Request, Template, Content, Check'], correct: 1, explanation: 'Role (who), Task (what), Context (background), Constraints (rules, format, DO NOTs).' },
        { question: 'What is few-shot prompting?', options: ['Short prompts', 'Providing examples of the desired input/output pattern', 'Using AI briefly', 'Limiting tokens'], correct: 1, explanation: 'Show 2-3 examples → AI learns the pattern → applies consistently.' },
        { question: 'When use chain-of-thought?', options: ['Simple greetings', 'Complex reasoning, math, multi-step analysis', 'Never', 'Creative writing only'], correct: 1, explanation: '"Think step by step" forces reasoning, catches errors.' },
        { question: 'Which AI works best with XML tags?', options: ['ChatGPT', 'Claude — trained to parse XML structure', 'Gemini', 'All equally'], correct: 1, explanation: 'Claude was specifically trained on XML-tagged prompts.' },
        { question: 'What is meta-prompting?', options: ['Metadata', 'Asking AI to write a better prompt for you', 'Using code', 'Chaining models'], correct: 1, explanation: 'AI knows what makes good prompts. Let it write them for you.' },
        { question: 'Why DO NOT constraints work?', options: ['Speed', 'Explicitly prevent default patterns AI would include', 'Cost', 'Not effective'], correct: 1, explanation: '"DO NOT add pleasantries" blocks a pattern the AI defaults to.' },
        { question: 'What is prompt chaining?', options: ['One long prompt', 'Pipeline: output 1 → input 2 → input 3', 'Copying prompts', 'Repeating'], correct: 1, explanation: 'Break complex tasks into sequential steps.' },
        { question: 'What makes a prompt production-grade?', options: ['Length', 'Consistently produces usable output with minimal editing', 'Jargon', 'Works on one AI'], correct: 1, explanation: 'Reliable, consistent, immediately actionable across multiple runs.' }
    ],
    interactive: [
        { type: 'drag-drop', id: 'prompt-techniques-dd', title: 'Match Technique → Example', description: 'Drag each example.', items: ['Think step by step', 'You are a senior engineer', 'Here are 3 examples:', 'Write me a better prompt', 'DO NOT use buzzwords'], targets: { 'Chain-of-Thought': ['Think step by step'], 'Role Prompting': ['You are a senior engineer'], 'Few-Shot': ['Here are 3 examples:'], 'Meta-Prompting': ['Write me a better prompt'], 'Negative Constraint': ['DO NOT use buzzwords'] } },
        { type: 'flashcards', id: 'prompt-cards', title: 'Prompt Engineering Cards', cards: [
            { front: 'Bad → Good prompt?', back: 'Bad: "Explain APIs." Good: "You are a senior engineer. Explain REST APIs using a restaurant analogy. Under 200 words. DO NOT use jargon."' },
            { front: 'Prompt chaining?', back: 'Step 1: extract decisions → Step 2: identify owners → Step 3: format as Jira tickets. Pipeline.' },
            { front: 'Iterative refinement?', back: 'Follow up: "More concise." "Add depth." "Professional tone." Prompting = conversation, not one-shot.' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Build Your Prompt Playground',
        scenario: 'Build a reusable prompt library with production-grade prompts for real work tasks. Test across platforms, iterate, and publish.',
        duration: '45-60 minutes',
        cost: 'Free',
        difficulty: 'Beginner',
        prerequisites: ['Completed Phase 0', 'Accounts on ChatGPT, Claude, and Gemini'],
        steps: [
            {
                title: 'Start with a bad prompt and evolve it',
                subtitle: 'See how prompt quality transforms output quality',
                duration: '10 min',
                instructions: [
                    { type: 'command', cmd: 'mkdir prompt-playground\ncd prompt-playground' },
                    'Create a file called prompts.md.',
                    { type: 'heading', text: 'Round 1: The bad prompt' },
                    'Paste this into ChatGPT, Claude, AND Gemini:',
                    { type: 'prompt', text: 'Explain APIs' },
                    'Copy all 3 responses into prompts.md under "## Round 1: Zero Context".',
                    'Notice: all 3 are vague, generic, and unusable for any real task.',
                    { type: 'heading', text: 'Round 2-4: Iterate with RTCC' },
                    'Run each in Claude. Document each output:',
                    { type: 'code', language: 'text', code: 'ROUND 2 (add Role + Audience):\n"You are a senior backend engineer. Explain REST APIs\nto a non-technical product manager."\n\nROUND 3 (add Format + Constraints):\n"...using a restaurant analogy. Under 200 words.\nDO NOT use technical jargon without defining it."\n\nROUND 4 (add Few-Shot example):\n"...Format:\n**What it is:** [1-sentence definition]\n**Analogy:** [real-world comparison]\n**Why it matters:** [1-sentence relevance]"' },
                    { type: 'verify', text: 'Compare Round 1 output to Round 4. Round 4 should be specific, structured, and immediately usable in a real Slack message. This is the power of RTCC.' }
                ]
            },
            {
                title: 'Build 5 production prompts for YOUR job',
                subtitle: 'Create prompts you will actually use every week',
                duration: '20 min',
                instructions: [
                    'Create 5 prompts using the full RTCC framework for tasks YOU do at work:',
                    { type: 'code', language: 'text', code: 'PROMPT 1 — STATUS REPORT:\n"You are an executive communicator. Convert bullet-point\nupdates into a status report with:\n## Highlights (top 3 wins)\n## Risks & Blockers (with mitigations)\n## Next Week Focus\nUnder 2 sentences each. DO NOT add info I did not provide."\n\nPROMPT 2 — EMAIL DRAFT:\n"Draft a [polite/firm] email. Context: [X].\nKey points: [1,2,3]. Under 150 words.\nEnd with a specific call to action."\n\nPROMPT 3 — CODE REVIEW:\n"Review this code for: bugs, security (OWASP Top 10),\nperformance. Format: | Issue | Severity | File:Line | Fix |"\n\nPROMPT 4 — MEETING PREP:\n"Given agenda + past notes, prepare:\n1) 5 talking points 2) 3 tough questions\n3) Recommended responses"\n\nPROMPT 5 — DOCUMENT SUMMARY:\n"5 bullets. Each: one insight + supporting evidence.\nDO NOT include opinions."' },
                    'Add each prompt to prompts.md. Test each with real data.',
                    { type: 'tip', text: 'Run each prompt 3 times with different inputs. If the output is consistently usable with minimal editing, it is production-grade. If not, add more constraints.' },
                    { type: 'verify', text: 'You have 5 prompts in prompts.md. Each produces usable output. You tested each at least twice.' }
                ]
            },
            {
                title: 'Cross-platform comparison + push',
                subtitle: 'Test prompts across ChatGPT and Claude, document findings',
                duration: '15 min',
                instructions: [
                    'Run your 3 best prompts on both ChatGPT and Claude. Score each:',
                    { type: 'code', language: 'markdown', code: '## Platform Comparison\n\n### Prompt: Status Report\n| Criteria | ChatGPT | Claude |\n|---------|---------|--------|\n| Followed constraints? | X/5 | X/5 |\n| Format correct? | X/5 | X/5 |\n| Immediately usable? | X/5 | X/5 |\n| Natural tone? | X/5 | X/5 |\n| **Total** | X/20 | X/20 |\n\n**Winner for this task:** [model]' },
                    'Push to GitHub:',
                    { type: 'command', cmd: 'git init\ngit add .\ngit commit -m "Prompt library: 5 production prompts + platform comparison"\ngit remote add origin https://github.com/YOUR_USERNAME/prompt-playground.git\ngit push -u origin main' },
                    { type: 'verify', text: 'GitHub repo has prompts.md with: Round 1-4 iterations, 5 production prompts, and Platform Comparison scorecards. A visitor could immediately reuse your prompts.' }
                ]
            }
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 3 — PHASE 2: Platform Mastery
// ══════════════════════════════════════════════
{
    id: 'phase2-platforms',
    level: 100,
    title: 'Phase 2: Platform Mastery',
    subtitle: 'Build real tools on ChatGPT, Claude, and Gemini that you will use every week',
    icon: '🔧',
    estimatedTime: '60m',
    learn: `
<div class="learn-section">
    <h2>Platform Deep Dives</h2>
    
    <h3>ChatGPT / OpenAI</h3>
    <ul>
        <li><strong>Custom GPTs:</strong> Specialised bots with instructions + knowledge files + API actions. Go to chat.openai.com/gpts/editor to build.</li>
        <li><strong>Canvas:</strong> Side-by-side co-editing workspace for writing and code.</li>
        <li><strong>Codex:</strong> Cloud-based coding agent running autonomously in parallel sandboxes.</li>
        <li><strong>Sora:</strong> Video generation from text, GPT-image-1.5 for images.</li>
    </ul>

    <h3>Claude / Anthropic</h3>
    <ul>
        <li><strong>Projects:</strong> Upload files + instructions. All conversations share context. Up to 1M tokens of knowledge.</li>
        <li><strong>Artifacts:</strong> Rendered preview panels for code/HTML/docs. Iterate and download.</li>
        <li><strong>Claude Code:</strong> Terminal agent that reads codebase, edits files, runs tests (Phase 7).</li>
        <li><strong>Managed Agents:</strong> Deploy autonomous agents in cloud sessions (Phase 7).</li>
        <li><strong>Extended Thinking:</strong> Visible step-by-step reasoning before answering.</li>
    </ul>

    <h3>Gemini / Google</h3>
    <ul>
        <li><strong>NotebookLM:</strong> ONLY answers from YOUR sources. Inline citations. Audio Overviews (AI podcast).</li>
        <li><strong>Deep Research:</strong> Autonomous agent → searches 100s of sources → cited interactive report.</li>
        <li><strong>AI Studio:</strong> FREE developer playground + API key generation.</li>
        <li><strong>Gems:</strong> Custom Gemini personas. Computer Use: AI clicks on screens (preview).</li>
    </ul>

    <div class="tip-box">
        <h4>💡 NotebookLM vs Claude Projects</h4>
        <p><strong>NotebookLM:</strong> Pure research — source-only answers, citations, Audio Overviews. <strong>Claude Projects:</strong> Action — code, artifacts, complex instructions. Use NotebookLM for trust and research. Claude for creation and execution.</p>
    </div>
</div>
`,
    quiz: [
        { question: 'What are Custom GPTs?', options: ['Custom models', 'Specialised bots with instructions + knowledge + API actions', 'Hardware', 'Plugins'], correct: 1, explanation: 'Combine instructions, files, and API connections.' },
        { question: 'What is a Claude Project?', options: ['To-do app', 'Workspace with files + instructions shared across conversations', 'Git repo', 'Billing'], correct: 1, explanation: 'Persistence across conversations.' },
        { question: 'NotebookLM unique feature?', options: ['Faster', 'ONLY answers from YOUR sources with inline citations', 'Better code', 'Free always'], correct: 1, explanation: 'Source-grounded = no training-data hallucination.' },
        { question: 'Audio Overview?', options: ['TTS', 'Podcast-style AI discussion about your documents', 'Music', 'Transcription'], correct: 1, explanation: 'Two AI hosts discuss your material naturally.' },
        { question: 'Codex?', options: ['Editor', 'Cloud coding agent in parallel sandboxes', 'Linter', 'Theme'], correct: 1, explanation: 'Autonomous development tasks.' },
        { question: 'Artifacts?', options: ['Bugs', 'Rendered preview panels for code/HTML/docs', 'Saved chats', 'Tokens'], correct: 1, explanation: 'Live preview alongside response.' },
        { question: 'AI Studio cost?', options: ['$20/mo', '$10/mo', 'Free with rate limits', 'Per call'], correct: 2, explanation: 'Free including API key generation.' },
        { question: 'Deep Research?', options: ['Search engine', 'Autonomous agent: 100s of sources → cited report', 'Fact checker', 'Database'], correct: 1, explanation: 'Plans → searches → synthesises → cites.' }
    ],
    interactive: [
        { type: 'drag-drop', id: 'platform-features-dd', title: 'Feature → Platform', description: 'Match features.', items: ['Audio Overview', 'Artifacts panel', 'Custom GPTs', 'Cowork agents', 'Canvas editing', 'Deep Research'], targets: { 'ChatGPT': ['Custom GPTs', 'Canvas editing'], 'Claude': ['Artifacts panel', 'Cowork agents'], 'Gemini': ['Audio Overview', 'Deep Research'] } },
        { type: 'flashcards', id: 'platform-cards', title: 'Platform Cards', cards: [
            { front: 'Projects vs GPTs?', back: 'Projects: files shared across many chats. GPTs: standalone bots shareable by link.' },
            { front: 'NotebookLM vs Claude?', back: 'NotebookLM: research (source-only, citations). Claude: action (code, artifacts).' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Build One Real Tool on Each Platform',
        scenario: 'Build a Custom GPT, a Claude Project, and a NotebookLM notebook — tools you will use weekly, not throwaway exercises.',
        duration: '45-60 minutes',
        cost: 'Free (or ChatGPT Plus $20/mo for Custom GPTs)',
        difficulty: 'Beginner',
        prerequisites: ['Completed Phases 0-1', 'Accounts on all 3 platforms'],
        steps: [
            {
                title: 'Build a Custom GPT: Meeting → Actions',
                subtitle: 'ChatGPT tool that converts meeting notes into action items',
                duration: '15 min',
                instructions: [
                    'Go to <a href="https://chat.openai.com/gpts/editor" target="_blank">chat.openai.com/gpts/editor</a> (requires Plus).',
                    { type: 'heading', text: 'Configure the GPT' },
                    { type: 'list', items: ['Name: <strong>Meeting Action Extractor</strong>', 'Description: Converts raw meeting notes into structured action items'] },
                    'In the Instructions field, paste:',
                    { type: 'prompt', text: '## Purpose\nConvert raw meeting notes into structured action items.\n\n## Output Format\n| # | Action Item | Owner | Deadline | Priority |\n|---|------------|-------|----------|----------|\n| 1 | [action] | [name or TBD] | [date or TBD] | P1/P2/P3 |\n\nAfter the table, add:\n## Decisions Made\n- [list any decisions from the notes]\n\n## Rules\n- Extract EVERY commitment, decision, and follow-up\n- P1 = urgent. P2 = important. P3 = nice-to-have\n- If no owner mentioned, write "TBD"\n- If no deadline, write "TBD"\n\n## DO NOT\n- Do not invent actions not discussed\n- Do not add summary paragraphs\n- Do not add closing pleasantries' },
                    'Save and test with this sample:',
                    { type: 'prompt', text: 'John said we need to finish the API migration by March 15. Sarah volunteered to handle the database schema changes. We decided to use PostgreSQL instead of MySQL. Mike mentioned we should probably update the docs at some point. The team agreed to daily standups starting Monday.' },
                    { type: 'verify', text: 'Output has 4-5 action items in a table. John has API migration (March 15). Sarah has schema (TBD deadline). PostgreSQL decision is listed. "Update docs" is P3. No extra fluff.' }
                ]
            },
            {
                title: 'Build a Claude Project: Knowledge Base',
                subtitle: 'A persistent knowledge workspace you can query',
                duration: '15 min',
                instructions: [
                    'Go to <a href="https://claude.ai" target="_blank">claude.ai</a> → left sidebar → Projects → Create Project.',
                    'Name it for a real topic (e.g., "My Team Knowledge Base").',
                    { type: 'heading', text: 'Upload 3-5 documents' },
                    'Upload real docs: team standards, architecture docs, onboarding guides, meeting notes. If you do not have real docs, create 3 markdown files with 500+ words each on realistic topics.',
                    { type: 'heading', text: 'Set instructions' },
                    'In Project Settings → Custom Instructions:',
                    { type: 'prompt', text: 'You are my team knowledge assistant.\n1. ALWAYS cite which uploaded document you reference\n2. Use bullet points for summaries\n3. If the answer is NOT in the docs, say: "This is not covered in the uploaded documents."\n4. Note any contradictions between documents' },
                    { type: 'heading', text: 'Test with 4 queries' },
                    { type: 'list', items: [
                        '"What are our coding standards?" (should cite your doc)',
                        '"Explain the architecture" (should cite architecture doc)',
                        '"Latest pizza recipe?" (should say NOT in documents)',
                        '"Any contradictions between docs?" (should analyse across docs)'
                    ]},
                    { type: 'verify', text: 'Responses cite specific document names. Out-of-scope query correctly declined. New conversations in the same project inherit all files without re-uploading.' }
                ]
            },
            {
                title: 'Build a NotebookLM Research Notebook',
                subtitle: 'Source-grounded research with Audio Overview podcast',
                duration: '15 min',
                instructions: [
                    'Go to <a href="https://notebooklm.google.com" target="_blank">notebooklm.google.com</a> → Create Notebook.',
                    'Choose a topic you are actively researching.',
                    { type: 'heading', text: 'Add 5+ sources (mix types)' },
                    { type: 'list', items: ['2 PDF documents (research papers or reports)', '2 web URLs (articles about your topic)', '1 YouTube video URL'] },
                    { type: 'heading', text: 'Test cross-source analysis' },
                    'Ask: "What are the 5 most important themes across ALL sources? Cite which source supports each."',
                    'Click through the inline citations to verify they point to the correct source and section.',
                    { type: 'heading', text: 'Generate Audio Overview' },
                    'Click the Audio Overview button. Wait 1-3 minutes. Listen to the 10-15 minute podcast.',
                    { type: 'verify', text: 'Citations are clickable and point to correct sources. Audio Overview sounds like natural conversation, not text-to-speech. It covers the main themes from your sources.' }
                ]
            },
            {
                title: 'Document and push',
                subtitle: 'Add to your learning journal and push to GitHub',
                duration: '5 min',
                instructions: [
                    'Add to your ai-learning-journal:',
                    { type: 'command', cmd: 'cd ../ai-learning-journal\ncode journal/day2-platform-tools.md' },
                    'Document: what you built, strengths/weaknesses of each platform, when you would use which.',
                    { type: 'command', cmd: 'git add . && git commit -m "Day 2: Platform tools on ChatGPT, Claude, NotebookLM" && git push' },
                    { type: 'verify', text: 'journal/day2-platform-tools.md exists with genuine evaluations. Pushed to GitHub.' }
                ]
            }
        ]
    }
},

// ══════════════════════════════════════════════
// MODULE 4 — PHASE 3: Calling AI from Code
// ══════════════════════════════════════════════
{
    id: 'phase3-ai-from-code',
    level: 100,
    title: 'Phase 3: Calling AI from Code',
    subtitle: 'The inflection point — APIs, tokens, cost, the Claude developer journey, and building a CLI assistant with Claude Code',
    icon: '💻',
    estimatedTime: '90m',
    diagrams: [
        {
            id: 'tool-calling-diagram',
            type: 'tool-calling',
            title: 'How an API call with tools actually flows',
            description: 'When you give the model a list of tools, it can choose to emit a structured tool_call instead of a final answer. Your code executes the tool and feeds the result back.',
            steps: [
                'User asks the model a question that needs fresh info.',
                'Model emits a JSON tool_call instead of an answer.',
                'Your app executes the real API call.',
                'API returns data to your app.',
                'Your app sends the result back to the model as a tool_result message.',
                'Model produces the final natural-language answer.'
            ]
        }
    ],
    learn: `
<div class="learn-section">
    <h2>From Chat → Code: The Inflection Point</h2>
    <p>This is where you stop being an AI <em>user</em> and start being an AI <em>builder</em>. APIs let you automate, build apps, and process thousands of requests.</p>
    <table class="content-table">
        <tr><th>Chat (consumer)</th><th>API (developer)</th></tr>
        <tr><td>Manual, one conversation</td><td>Programmatic, automated</td></tr>
        <tr><td>Monthly subscription</td><td>Pay per token</td></tr>
        <tr><td>Fixed UI</td><td>Full control</td></tr>
        <tr><td>Limited to pre-built features</td><td>Build anything</td></tr>
    </table>
</div>

<div class="learn-section">
    <h2>The API Pattern</h2>
    <div class="code-block">response = client.generate(
    model = "model-name",
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is Kubernetes?"}
    ],
    temperature = 0.7,
    max_tokens = 500
)</div>
    <p><strong>The messages array IS the memory.</strong> AI has no persistent memory. You send the FULL conversation each request. Managing this array is how chatbots "remember."</p>

    <h3>Code Examples (April 2026)</h3>
    <div class="code-block"># OpenAI: pip install openai
from openai import OpenAI
client = OpenAI()  # reads OPENAI_API_KEY env var
r = client.chat.completions.create(model="gpt-5.4-nano", messages=[...])

# Anthropic: pip install anthropic
import anthropic
client = anthropic.Anthropic()
msg = client.messages.create(model="claude-sonnet-4-6", max_tokens=1024, messages=[...])

# Google Gemini (FREE): pip install google-generativeai
import google.generativeai as genai
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")
r = model.generate_content("What is Kubernetes?")</div>
</div>

<div class="learn-section">
    <h2>Tokens & Cost</h2>
    <table class="content-table">
        <tr><th>Model</th><th>Input $/1M</th><th>Output $/1M</th><th>Best For</th></tr>
        <tr><td>GPT-5.4 nano</td><td>$0.20</td><td>$1.25</td><td>High-volume simple tasks</td></tr>
        <tr><td>Gemini 2.5 Flash</td><td>~$0.15</td><td>~$0.60</td><td>Cheapest option</td></tr>
        <tr><td>Claude Haiku 4.5</td><td>$1.00</td><td>$5.00</td><td>Fast + reliable</td></tr>
        <tr><td>Google AI Studio</td><td>FREE</td><td>FREE</td><td>Prototyping</td></tr>
    </table>
    <div class="warning-box"><h4>⚠️ NEVER hardcode API keys</h4><p>Use environment variables or .env files. Add .env to .gitignore. Leaked keys = massive bills within hours.</p></div>
</div>

<div class="learn-section">
    <h2>The Claude Developer Journey</h2>
    <h3>1. Get Started</h3>
    <p>API key → Choose model → Install SDK (Python/TS/Go/Java/Ruby/PHP/C#) → Try Workbench</p>
    <h3>2. Build</h3>
    <p>Messages API · Extended Thinking · Vision · Tool Use · <strong>Web Search (built-in)</strong> · <strong>Code Execution (built-in)</strong> · Structured Outputs · Prompt Caching · Streaming</p>
    <h3>3. Evaluate & Ship</h3>
    <p>Golden dataset evals · Batch testing (50% off) · Safety & guardrails · Rate limits · Cost optimisation</p>
    <h3>4. Operate</h3>
    <p>Workspaces · API key management · Usage monitoring · Model migration</p>
    <h3>Two Paths</h3>
    <table class="content-table">
        <tr><th></th><th>Messages API</th><th>Managed Agents</th></tr>
        <tr><td><strong>You control</strong></td><td>Every turn, state, tools</td><td>Agent definition — Anthropic runs it</td></tr>
        <tr><td><strong>Best for</strong></td><td>Custom apps, full control</td><td>Production autonomous agents</td></tr>
    </table>
</div>

<div class="learn-section">
    <h2>📚 Go Deeper: Anthropic Academy — Building with the Claude API</h2>
    <p><a href="https://anthropic.skilljar.com/claude-with-the-anthropic-api" target="_blank">Free course — 84 lectures, 8.1 hrs video, 10 quizzes, certificate</a></p>
    <p>This comprehensive course covers everything from basic API calls to production agent architectures. Section 1 (Getting Started) maps directly to what you just learned:</p>
    <table class="content-table">
        <tr><th>Course Section</th><th>Lessons</th><th>Maps to Academy Phase</th></tr>
        <tr><td>Getting Started with Claude</td><td>16 — API auth, requests, conversations, system prompts, structured output</td><td><strong>Phase 3</strong> (this module)</td></tr>
        <tr><td>Prompt Engineering & Evaluation</td><td>16 — Prompting strategies, eval frameworks, systematic testing</td><td>Phase 1 (Prompting)</td></tr>
        <tr><td>Tool Use with Claude</td><td>14 — Function calling, multi-turn tools, batch calling, built-in utilities</td><td>Phase 5 (Tool Use)</td></tr>
        <tr><td>Retrieval Augmented Generation</td><td>10 — Chunking, embeddings, hybrid search, BM25, reranking</td><td>Phase 4 (RAG)</td></tr>
        <tr><td>Model Context Protocol (MCP)</td><td>12 — Custom tools/resources, MCP servers/clients, full lifecycle</td><td>Phase 9 (MCP)</td></tr>
        <tr><td>Claude Code & Computer Use</td><td>8 — Dev workflows, UI automation, MCP integration</td><td>Phase 7 (Claude Code)</td></tr>
        <tr><td>Agents and Workflows</td><td>11 — Parallel execution, chaining, routing, debugging</td><td>Phases 6-8 (Agents)</td></tr>
    </table>
    <div class="warning-box"><h4>💡 Study Strategy</h4><p>Take Section 1 (Getting Started) right now alongside this phase. Then take each subsequent section as you reach the matching phase in this academy. By the end you will have completed both courses in parallel.</p></div>
</div>
`,
    quiz: [
        { question: 'Why APIs over chat?', options: ['Worse models', 'Automation, build apps, thousands of requests', 'More expensive', 'No difference'], correct: 1, explanation: 'APIs let you automate and build products.' },
        { question: 'Messages array?', options: ['Errors', 'Conversation history = the memory', 'SMS', 'Logs'], correct: 1, explanation: 'AI has zero memory. Your code sends the full history.' },
        { question: 'API key storage?', options: ['In code', 'Environment variables — NEVER in source', 'README', 'Comments'], correct: 1, explanation: 'Leaked keys = massive bills.' },
        { question: 'Cheapest prototyping?', options: ['GPT-5.4', 'Opus', 'Google AI Studio (free) or nano ($0.20/1M)', 'GPT-realtime'], correct: 2, explanation: 'AI Studio is free. Nano is cheap.' },
        { question: 'max_tokens?', options: ['Cost', 'Maximum output length', 'Model', 'Temperature'], correct: 1, explanation: 'Caps response. Does not affect quality.' },
        { question: 'How chatbots remember?', options: ['Model stores', 'Your code stores & re-sends messages', 'Auto DB', 'Cannot'], correct: 1, explanation: 'You manage the messages array.' },
        { question: 'Message roles?', options: ['Input, Output', 'system, user, assistant', 'Header, Body', 'Req, Res'], correct: 1, explanation: 'system: instructions. user: human. assistant: AI.' },
        { question: 'Output costs more because?', options: ['Does not', 'Generating requires more computation than reading', 'Marketing', 'No reason'], correct: 1, explanation: 'Input = reading. Output = generating. Different compute.' }
    ],
    interactive: [
        { type: 'flashcards', id: 'api-cards', title: 'API Fundamentals', cards: [
            { front: 'API pattern?', back: 'Send: model + messages + temperature + max_tokens. Get: generated text.' },
            { front: 'Messages = memory?', back: 'AI has ZERO memory. Your code stores and re-sends. Messages array IS the memory.' },
            { front: 'Cheapest?', back: 'Google AI Studio: FREE. GPT-5.4 nano: $0.20/1M. Gemini Flash: ~$0.15/1M.' }
        ]}
    ],
    lab: {
        title: 'Hands-On: Build a CLI AI Assistant',
        scenario: 'Build a real command-line chatbot in Python using Claude Code. It takes input, calls an AI API, prints responses, and remembers the last 5 messages.',
        duration: '30-45 minutes',
        cost: 'Free (using Google AI Studio)',
        difficulty: 'Intermediate',
        prerequisites: ['Python 3 installed', 'A text editor', 'Completed Phases 0-2'],
        steps: [
            {
                title: 'Get a free API key from Google AI Studio',
                subtitle: 'Set up your development environment',
                duration: '5 min',
                instructions: [
                    'Go to <a href="https://aistudio.google.com" target="_blank">aistudio.google.com</a>.',
                    'Click "Get API Key" → "Create API Key in new project" → copy the key.',
                    { type: 'heading', text: 'Set environment variable' },
                    'Mac/Linux (add to ~/.bashrc or ~/.zshrc for persistence):',
                    { type: 'command', cmd: 'export GEMINI_API_KEY="paste-your-key-here"' },
                    'Windows PowerShell (add to $PROFILE for persistence):',
                    { type: 'command', cmd: '$env:GEMINI_API_KEY="paste-your-key-here"' },
                    { type: 'heading', text: 'Verify' },
                    { type: 'command', cmd: 'echo $GEMINI_API_KEY    # Mac/Linux\necho $env:GEMINI_API_KEY  # Windows' },
                    { type: 'tip', text: 'The key starts with "AIza". If echo prints nothing, re-run the export command.' },
                    { type: 'verify', text: 'Echo prints your key (not blank). Close and reopen terminal — echo still works (persistence).' }
                ]
            },
            {
                title: 'Build the chatbot with Claude Code',
                subtitle: 'Use Claude Code as an AI pair programmer to create the project',
                duration: '10 min',
                instructions: [
                    { type: 'heading', text: 'Install Claude Code' },
                    'Mac/Linux:',
                    { type: 'command', cmd: 'curl -fsSL https://claude.ai/install.sh | bash' },
                    'Windows PowerShell:',
                    { type: 'command', cmd: 'irm https://claude.ai/install.ps1 | iex' },
                    'Verify: claude --version',
                    { type: 'heading', text: 'Create the project' },
                    { type: 'command', cmd: 'mkdir cli-ai-assistant\ncd cli-ai-assistant\nclaude' },
                    'You are now in Claude Code. Paste this entire prompt:',
                    { type: 'prompt', text: 'Build a Python CLI chatbot with these specs:\n\n1. DEPS: google-generativeai library. GEMINI_API_KEY from env var.\n2. LOOP: Print welcome message. Prompt "You: ". Send to Gemini 2.5 Flash. Print "AI: [response]". Loop until /quit.\n3. MEMORY: Store last 5 user+assistant exchanges. Include in each API call. Drop oldest when exceeding 5.\n4. COMMANDS: /quit (exit), /clear (reset memory), /history (show count), /cost (estimate tokens used)\n5. ERRORS: Missing API key → clear instructions. API failure → print error, continue.\n6. SYSTEM PROMPT: "You are a helpful AI assistant. Be concise and direct."\n7. FILES: main.py, requirements.txt, .gitignore, .env.example, README.md with setup + usage + example conversation.' },
                    'Let Claude Code build, install, and test.',
                    { type: 'verify', text: 'After Claude Code finishes: ls shows main.py, requirements.txt, README.md. No import errors when running.' }
                ]
            },
            {
                title: 'Test the chatbot thoroughly',
                subtitle: 'Run 6 specific test scenarios',
                duration: '10 min',
                instructions: [
                    { type: 'command', cmd: 'pip install -r requirements.txt\npython main.py' },
                    { type: 'heading', text: 'Test scenarios' },
                    { type: 'list', items: [
                        '<strong>TEST 1 — Basic:</strong> "Hello! My name is Akshay." → AI acknowledges',
                        '<strong>TEST 2 — Memory:</strong> "What is my name?" → Should say "Akshay"',
                        '<strong>TEST 3 — Context:</strong> "I work on Azure Front Door." then "What team?" → "Azure Front Door"',
                        '<strong>TEST 4 — Memory limit:</strong> Have 10+ exchanges. Ask about msg #1 → Should forget',
                        '<strong>TEST 5 — Commands:</strong> /history → count. /clear → reset. /history → 0. /quit → exit.',
                        '<strong>TEST 6 — Error:</strong> Unset API key, run chatbot → should print setup instructions, not crash'
                    ]},
                    { type: 'tip', text: 'If any test fails, go back to Claude Code (type "claude") and describe the issue. It will fix it.' },
                    { type: 'verify', text: 'All 6 tests pass. Memory works for recent messages. Old messages are forgotten. Commands work. Errors handled gracefully.' }
                ]
            },
            {
                title: 'Polish and push to GitHub',
                subtitle: 'Make it portfolio-ready and publish',
                duration: '5 min',
                instructions: [
                    'Check README.md has: description, setup instructions, usage, example conversation. If not:',
                    { type: 'command', cmd: 'claude\n"Update README with setup instructions and example conversation"' },
                    { type: 'heading', text: 'Push to GitHub' },
                    { type: 'command', cmd: 'git init\ngit add .\ngit commit -m "feat: CLI AI assistant with conversation memory"\ngit remote add origin https://github.com/YOUR_USERNAME/cli-ai-assistant.git\ngit push -u origin main' },
                    { type: 'verify', text: 'GitHub repo has README with setup instructions. A visitor could clone, get an API key, and run the chatbot in under 5 minutes. Portfolio project #2 done.' }
                ]
            }
        ]
    }
}

];
