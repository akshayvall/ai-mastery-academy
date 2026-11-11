const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const directory = path.join(__dirname, '..', 'js');
const context = vm.createContext({});
for (const name of ['landscape', 'modules-100', 'modules-200', 'modules-300', 'modules-pm', 'modules-extras']) {
    vm.runInContext(fs.readFileSync(path.join(directory, `${name}.js`), 'utf8'), context);
}
const catalog = JSON.parse(vm.runInContext(`JSON.stringify({
    modules: [...MODULES_100, ...MODULES_200, ...MODULES_300, ...MODULES_PM, ...MODULES_EXTRAS],
    landscape: MODEL_LANDSCAPE
})`, context));
const moduleById = id => catalog.modules.find(module => module.id === id);
const text = id => JSON.stringify(moduleById(id));

test('orientation distinguishes learned parameters, request context, and application memory', () => {
    const orientation = text('phase0-orientation');
    assert.ok(!/entire internet|forget EVERYTHING|zero memory|Always try in this order|90% of use cases/.test(orientation));
    assert.match(orientation, /parameters|weights/i);
    assert.match(orientation, /application.*memory|memory.*application/i);
    assert.match(orientation, /simplified.*not.*taxonomy/i);
    assert.match(text('ai-stack'), /simplified.*not.*taxonomy/i);
    assert.ok(!/AI has (?:ZERO|zero|no persistent) memory/.test(text('phase3-ai-from-code')));
});

test('prompt teaching and its assessment avoid universal quality and reasoning guarantees', () => {
    const prompting = text('phase1-prompting');
    assert.ok(!/80% of the value|10x the output|every time|forces reasoning/.test(prompting));
    assert.match(prompting, /model-specific/i);
    assert.match(prompting, /hidden reasoning/i);
    const answer = moduleById('phase1-prompting').quiz[2];
    assert.match(answer.options[answer.correct], /model|test/i);
    assert.ok(!/dramatically improves|longer, more detailed reasoning chains produce better/.test(text('phase5-tool-use')));
    assert.match(text('phase5-tool-use'), /does not guarantee.*identical/i);
});

test('source-grounded teaching includes unsupported answers and citation verification', () => {
    const platforms = text('phase2-platforms');
    assert.ok(!/no training-data hallucination|ONLY answers from YOUR|source-only/.test(platforms));
    assert.match(platforms, /unsupported|not in the sources/i);
    assert.match(platforms, /citations.*(?:verify|check)|(?:verify|check).*citations/i);
    assert.match(text('phase4-memory-rag'), /retrieval.*(?:fail|miss)|(?:fail|miss).*retrieval/i);
    assert.ok(!/no hallucination, no making things up/.test(text('phase13-capstone')));
});

test('eval lessons and correct quiz answers use task-specific calibration, not price or dataset ceilings', () => {
    const evals = moduleById('pm-evals');
    assert.ok(!/Cheap models make terrible|Past 500|ROI drops fast|100 examples is enough|~80% agreement/.test(text(evals.id)));
    assert.match(evals.learn, /held-out/i);
    assert.match(evals.learn, /uncertainty/i);
    assert.match(evals.quiz[4].options[evals.quiz[4].correct], /risk|task|slice/i);
    assert.match(evals.quiz[6].options[evals.quiz[6].correct], /risk|coverage|uncertainty/i);
    assert.ok(!/Self-hosting is rarely worth it below several million/.test(text('pm-unit-economics')));
    assert.ok(!/optional supported provider pin/.test(text('phase11-product')));
});

test('shadow mode teaches minimized telemetry and remaining data and cost risks', () => {
    const shipping = text('pm-discovery-ship');
    assert.ok(!/log everything|without user risk/.test(shipping));
    for (const safeguard of [/redact/i, /retention/i, /access control/i, /cost/i, /approved data/i]) {
        assert.match(shipping, safeguard);
    }
});

test('agent and routing decisions require measured benefits over a simpler baseline', () => {
    const multi = moduleById('phase8-multi-agent').quiz[0];
    assert.ok(!/Specialised roles = better results/.test(text('phase8-multi-agent')));
    assert.match(multi.options[multi.correct], /measured|eval/i);
    const expert = text('phase12-expert');
    assert.ok(!/saves 50-70%|78% savings|showing 78%/.test(expert));
    assert.match(expert, /cost per successful task/i);
    for (const id of ['pm-unit-economics', 'pm-build-buy-wait', 'pm-analytics']) {
        assert.ok(!/almost zero risk|Below that scale, hosted APIs are cheaper|most expensive mistake|saturated commodity/.test(text(id)), id);
    }
});

test('diagram narratives label illustrations and require MCP capability negotiation', () => {
    for (const id of ['phase1-prompting', 'next-token']) {
        const diagrams = JSON.stringify(moduleById(id).diagrams);
        assert.ok(!/50K-ish|~100K tokens/.test(diagrams));
        assert.match(diagrams, /illustrative/i);
    }
    for (const id of ['phase9-mcp-skills', 'mcp-architecture']) {
        assert.ok(!/any compatible client can use any server/.test(text(id)));
        assert.match(text(id), /capabilit.*negotiat|negotiat.*capabilit/i);
    }
    for (const id of ['phase12-expert', 'context-decay']) {
        assert.match(JSON.stringify(moduleById(id).diagrams), /illustrative/i);
    }
    const renderer = fs.readFileSync(path.join(directory, 'diagrams.js'), 'utf8');
    assert.ok(!/any client can use any server/.test(renderer));
    assert.match(renderer, /Illustrative.*not a benchmark/i);
});

test('registry source review is current, dated and distinct from provider execution and lab pins', () => {
    const registry = catalog.landscape;
    assert.equal(registry.verifiedDate, '2026-11-11');
    assert.ok(registry.nextReviewDate > registry.verifiedDate);
    assert.equal(registry.verificationStatus, 'source-reviewed');
    assert.match(registry.verificationNote, /not (?:been )?executed/i);
    assert.match(registry.verificationNote, /lab pins/i);
    for (const source of Object.values(registry.sources)) {
        assert.equal(source.verifiedDate, registry.verifiedDate);
        assert.match(source.lifecycle, /^https:\/\//);
    }
    assert.ok(!/Gemini 2\.5(?: models)? (?:also )?remains? supported/.test(JSON.stringify(registry) + text('phase0-orientation')));
    assert.match(registry.google.supported25, /December 1, 2026/);
    assert.match(registry.google.supported25, /billing|billed/i);
});
