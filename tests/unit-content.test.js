const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const crypto = require('node:crypto');

const filename = path.join(__dirname, '..', 'js', 'unit-content.js');
const expectedModules = {
    'phase0-orientation': ['answer-needs-evidence', 'context-is-not-memory'],
    'phase1-prompting': ['write-a-task-contract', 'examples-have-limits'],
    'phase2-platforms': ['choose-a-workflow-surface', 'compare-before-you-commit'],
    'phase3-ai-from-code': ['read-a-request', 'handle-a-failed-request'],
    'phase4-memory-rag': ['find-the-first-failure', 'retrieve-only-allowed-evidence'],
    'pm-evals': ['build-a-fair-test-set', 'calibrate-a-release-decision'],
    'landscape-2026-ai-systems': ['map-capabilities-to-work', 'plan-a-version-change'],
    'zero-to-claude-companion': ['inspect-a-project-safely', 'learn-with-a-coding-companion'],
    'phase5-tool-use': ['validate-a-tool-proposal', 'make-actions-safe-to-repeat'],
    'phase6-agents': ['choose-workflow-or-agent', 'bound-an-agent-run'],
    'phase7-claude-code': ['give-a-coding-agent-a-boundary', 'review-a-planted-defect'],
    'phase8-multi-agent': ['split-only-independent-work', 'validate-a-worker-handoff'],
    'phase9-mcp-skills': ['separate-discovery-from-permission', 'choose-an-integration-contract'],
    'phase10-fullstack': ['trace-a-fullstack-request', 'release-with-a-return-path'],
    'phase11-product': ['separate-tenants-and-entitlements', 'design-a-service-fallback'],
    'phase12-expert': ['diagnose-an-unfamiliar-design', 'choose-the-next-experiment'],
    'phase13-capstone': ['assemble-a-builder-evidence-chain', 'defend-a-changed-capstone'],
    'pm-unit-economics': ['count-cost-per-success', 'test-cost-sensitivity'],
    'pm-build-buy-wait': ['find-the-differentiating-work', 'preserve-a-reversible-choice'],
    'pm-discovery-ship': ['test-the-user-problem', 'stage-a-learning-release'],
    'pm-trust-safety': ['turn-a-threat-into-a-control', 'review-residual-risk'],
    'pm-analytics': ['measure-the-user-outcome', 'collect-only-needed-signals'],
    'pm-roadmap': ['sequence-learning-before-scale', 'set-a-review-trigger'],
    'pm-comms': ['write-an-evidence-based-decision', 'defend-the-scope-of-a-claim'],
    'builder-mcp-assistant': ['build-a-read-only-tool-contract', 'handle-a-denied-tool-call'],
    'builder-multi-agent': ['compare-one-worker-with-many', 'recover-a-partial-team-result'],
    'builder-eval-pipeline': ['catch-a-planted-regression', 'keep-evaluation-evidence-reproducible'],
    'builder-rag-guardrails': ['treat-retrieved-instructions-as-data', 'balance-answer-and-abstention'],
    'builder-audit-agent': ['record-a-minimal-audit-event', 'investigate-without-overclaiming'],
    'builder-finetune': ['choose-data-or-model-repair', 'evaluate-an-adapted-model'],
    'builder-knowledge-graph': ['choose-graph-or-search', 'check-an-extracted-relationship']
};
const pilotModules = Object.keys(expectedModules).slice(0, 6);
const optionalUnits = {
    'phase2-platforms': ['inspect-multimodal-evidence', 'design-a-voice-turn'],
    'phase6-agents': ['bound-computer-use', 'resume-a-durable-workflow'],
    'phase9-mcp-skills': ['distinguish-mcp-and-a2a', 'review-a-portable-skill'],
    'phase10-fullstack': ['assess-a-managed-runtime'],
    'builder-finetune': ['assess-an-open-weight-deployment']
};
const specialistOutcomes = {
    'inspect-multimodal-evidence': /image|document/i,
    'design-a-voice-turn': /interruption|voice/i,
    'bound-computer-use': /screen|computer/i,
    'resume-a-durable-workflow': /restart|durable/i,
    'distinguish-mcp-and-a2a': /MCP.*A2A|A2A.*MCP/,
    'review-a-portable-skill': /skill/i,
    'assess-a-managed-runtime': /managed|Foundry/i,
    'assess-an-open-weight-deployment': /local|open.weight/i
};

function loadContent() {
    assert.ok(fs.existsSync(filename), 'Authored pilot unit-content.js must exist');
    const context = vm.createContext({});
    vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    return JSON.parse(vm.runInContext('JSON.stringify(ACADEMY_UNITS)', context));
}

function text(value, label) {
    assert.equal(typeof value, 'string', label);
    assert.ok(value.trim().length >= 8, `${label} must contain meaningful text`);
    assert.doesNotMatch(value, /<\/?[a-z][^>]*>|\b(?:TODO|TBD|lorem ipsum)\b/i, label);
}

function question(value, label) {
    text(value.question, `${label}.question`);
    assert.equal(value.options.length, 3, label);
    assert.equal(new Set(value.options).size, 3, `${label} distinct choices`);
    assert.equal(value.explanations.length, 3, `${label} feedback for every choice`);
    assert.equal(new Set(value.explanations).size, 3, `${label} tailored feedback`);
    assert.ok(Number.isInteger(value.correct) && value.correct >= 0 && value.correct < 3, label);
    value.options.forEach((option, i) => text(option, `${label}.options[${i}]`));
    value.explanations.forEach((explanation, i) => {
        text(explanation, `${label}.explanations[${i}]`);
        assert.ok(explanation.split(/\s+/).length >= 10, `${label} explains why choice ${i} works or fails`);
    });
}

test('authored content covers all 31 real modules with 62 core and eight optional units', () => {
    const content = loadContent();
    assert.deepEqual(Object.keys(content.modules).sort(), Object.keys(expectedModules).sort());
    const units = Object.values(content.modules).flat();
    assert.equal(units.length, 70);
    assert.equal(units.filter(unit => !unit.optional).length, 62);
    assert.equal(new Set(units.map(unit => unit.id)).size, units.length);
    assert.equal(new Set(units.map(unit => unit.outcome)).size, units.length);
    assert.equal(new Set(units.map(unit => unit.paragraphs.join(' '))).size, units.length);
    assert.equal(new Set(units.map(unit => unit.check.question)).size, units.length);
    for (const [moduleId, ids] of Object.entries(expectedModules)) {
        assert.deepEqual(content.modules[moduleId].filter(unit => !unit.optional).map(unit => unit.id), ids);
    }
});

for (const [moduleId, ids] of Object.entries(expectedModules)) {
    for (const id of [...ids, ...(optionalUnits[moduleId] || [])]) {
        test(`${moduleId}/${id} teaches before two distinct scenario questions`, () => {
            const unit = (loadContent().modules[moduleId] || []).find(candidate => candidate.id === id);
            assert.ok(unit, `Missing ${id}`);
            const keys = [
                'id', 'title', 'minutes', 'outcome', 'misconception', 'paragraphs', 'example',
                'trace', 'practice', 'check', 'teachBack', 'takeaway', 'sources', 'reviewed'
            ];
            if ((optionalUnits[moduleId] || []).includes(id)) keys.push('optional');
            assert.deepEqual(Object.keys(unit).sort(), keys.sort());
            ['title', 'outcome', 'misconception', 'takeaway'].forEach(key => text(unit[key], `${id}.${key}`));
            assert.ok([8, 10, 12].includes(unit.minutes));
            assert.ok(unit.paragraphs.length >= 2 && unit.paragraphs.length <= 3);
            unit.paragraphs.forEach(paragraph => text(paragraph, `${id}.paragraph`));
            const words = unit.paragraphs.join(' ').split(/\s+/).length;
            assert.ok(words >= 120 && words <= 220, `${id}: ${words} teaching words; expected 120–220`);
            text(unit.example.title, `${id}.example.title`);
            text(unit.example.text, `${id}.example.text`);
            assert.ok(unit.trace.length >= 3 && unit.trace.length <= 4);
            assert.equal(new Set(unit.trace.map(node => node.label)).size, unit.trace.length);
            unit.trace.forEach(node => {
                text(node.label, `${id}.trace.label`);
                text(node.detail, `${id}.trace.detail`);
            });

            question(unit.practice, `${id}.practice`);
            question(unit.check, `${id}.check`);
            assert.notEqual(unit.practice.question, unit.check.question);
            assert.notDeepEqual(unit.practice.options, unit.check.options, 'Transfer must not repeat the practice choices');
            assert.match(unit.check.question, /library|museum/i, 'Check transfers learning outside MapleDesk');
            text(unit.teachBack.prompt, `${id}.teachBack.prompt`);
            text(unit.teachBack.example, `${id}.teachBack.example`);
            assert.ok(unit.sources.length >= 1 && unit.sources.length <= 3);
            unit.sources.forEach(source => {
                text(source.title, `${id}.source.title`);
                assert.equal(new URL(source.url).protocol, 'https:');
            });
            assert.equal(unit.reviewed, '2026-11-11');
        });
    }
}

test('the original twelve pilot units remain byte-equivalent as serialized data', () => {
    const content = loadContent();
    const pilot = pilotModules.flatMap(moduleId => content.modules[moduleId].slice(0, 2));
    const digest = crypto.createHash('sha256').update(JSON.stringify(pilot)).digest('hex');
    assert.equal(digest, 'b9bd9650ab8dfe78c53fd9def7df545c40b55c327caa06cb34410a16ee11cb54');
});

test('optional units explicitly mark the modern specialist outcomes and remain within existing modules', () => {
    const content = loadContent();
    for (const [moduleId, ids] of Object.entries(optionalUnits)) {
        assert.deepEqual((content.modules[moduleId] || []).filter(unit => unit.optional).map(unit => unit.id), ids);
        for (const id of ids) {
            const unit = content.modules[moduleId].find(candidate => candidate.id === id);
            assert.equal(unit.optional, true);
            assert.match(unit.outcome, specialistOutcomes[id]);
            assert.match(unit.paragraphs.join(' '), /tabletop|fictional|no .*account|not .*execut/i);
        }
    }
});

test('changed-condition assessments target expanded decisions rather than brand trivia', () => {
    const modules = loadContent().modules;
    const expectations = [
        ['phase5-tool-use', 0, /authoriz|permission/i], ['phase6-agents', 0, /workflow|fixed/i],
        ['phase7-claude-code', 1, /boundary|equal|14/i], ['phase8-multi-agent', 0, /depend|sequence/i],
        ['phase9-mcp-skills', 0, /denied|deny|permission/i], ['phase10-fullstack', 1, /rollback|revert|pause/i],
        ['phase11-product', 0, /server|tenant/i], ['phase12-expert', 0, /evidence|trace/i],
        ['phase13-capstone', 1, /hold|restrict/i], ['pm-unit-economics', 0, /successful|success/i],
        ['pm-build-buy-wait', 1, /exit|export|revers/i], ['pm-discovery-ship', 1, /stop|pause/i],
        ['pm-trust-safety', 1, /review|reassess/i], ['pm-analytics', 0, /outcome|correct|resolution/i],
        ['pm-roadmap', 1, /trigger|review|revisit/i], ['pm-comms', 1, /local|unverified|unmeasured/i],
        ['builder-mcp-assistant', 1, /deny|denied/i], ['builder-multi-agent', 1, /partial|missing|retry/i],
        ['builder-eval-pipeline', 0, /regression|block/i], ['builder-rag-guardrails', 1, /answer|supported/i],
        ['builder-audit-agent', 1, /uncertain|unknown|evidence/i], ['builder-finetune', 1, /held.out|holdout/i],
        ['builder-knowledge-graph', 1, /source|verify|evidence/i]
    ];
    for (const [moduleId, index, expected] of expectations) {
        assert.ok(modules[moduleId], `${moduleId} has authored teaching`);
        const unit = modules[moduleId][index];
        assert.match(unit.check.options[unit.check.correct], expected, unit.id);
        assert.notEqual(unit.practice.explanations[unit.practice.correct], unit.check.explanations[unit.check.correct]);
    }
});

test('content loads without dependencies as a browser script and CommonJS data', () => {
    const browser = loadContent();
    const commonjs = require(filename);
    assert.deepEqual(commonjs, browser);
    assert.equal(browser.version, '2026-11-11');
});

test('RAG changed condition moves diagnosis from missing evidence to wrong generation', () => {
    const unit = loadContent().modules['phase4-memory-rag'][0];
    assert.match(unit.practice.options[unit.practice.correct], /retriev|selection/i);
    assert.match(unit.check.options[unit.check.correct], /generation|answer/i);
    assert.match(unit.check.question, /14/);
    assert.match(unit.check.question, /30/);
});

test('API bridge explains files, JSON, HTTP, requests and distinct failure handling without execution', () => {
    const units = loadContent().modules['phase3-ai-from-code'];
    const teaching = units.flatMap(unit => [...unit.paragraphs, unit.example.text]).join(' ');
    for (const term of ['file', 'JSON', 'HTTP', 'request', 'response', '400', '429', 'timeout']) {
        assert.ok(teaching.includes(term), `Teach ${term} before asking`);
    }
    assert.match(teaching, /tabletop|nothing is sent|no account/i);
    assert.match(units[1].practice.options[units[1].practice.correct], /repair|fix/i);
    assert.match(units[1].check.options[units[1].check.correct], /retry|wait/i);
});

test('evaluation lessons teach representative cases, holdout and calibration without universal gates', () => {
    const units = loadContent().modules['pm-evals'];
    const teaching = units.flatMap(unit => unit.paragraphs).join(' ');
    assert.match(teaching, /representative/i);
    assert.match(teaching, /holdout/i);
    assert.match(teaching, /calibrat/i);
    assert.match(teaching, /no universal|not universal/i);
    assert.match(units[0].check.options[units[0].check.correct], /fresh|new|untouched/i);
    assert.match(units[1].check.options[units[1].check.correct], /hold|pause/i);
});
