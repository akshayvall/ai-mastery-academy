const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const sourceDirectory = path.join(__dirname, '..', 'js');
const expectedIds = [
    'phase0-orientation', 'phase1-prompting', 'phase2-platforms', 'phase3-ai-from-code',
    'landscape-2026-ai-systems', 'zero-to-claude-companion',
    'phase4-memory-rag', 'phase5-tool-use', 'phase6-agents', 'phase7-claude-code',
    'phase8-multi-agent', 'phase9-mcp-skills', 'phase10-fullstack', 'phase11-product',
    'phase12-expert', 'phase13-capstone', 'pm-evals', 'pm-unit-economics',
    'pm-build-buy-wait', 'pm-discovery-ship', 'pm-comms', 'pm-trust-safety',
    'pm-analytics', 'pm-roadmap', 'builder-mcp-assistant', 'builder-multi-agent',
    'builder-eval-pipeline', 'builder-rag-guardrails', 'builder-audit-agent',
    'builder-finetune', 'builder-knowledge-graph'
];
const artifactIds = [
    'pm-build-buy-wait', 'pm-discovery-ship', 'pm-comms',
    'pm-trust-safety', 'pm-analytics', 'pm-roadmap'
];

function loadContent() {
    const filename = path.join(sourceDirectory, 'learning-content.js');
    assert.ok(fs.existsSync(filename), 'The standalone learning-content.js overlay must exist');
    const context = vm.createContext({});
    vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    assert.equal(vm.runInContext('Object.isFrozen(LEARNING_CONTENT)', context), true);
    return JSON.parse(vm.runInContext('JSON.stringify(LEARNING_CONTENT)', context));
}

function loadCatalog() {
    const context = vm.createContext({});
    for (const filename of [
        'landscape.js', 'modules-100.js', 'modules-200.js', 'modules-300.js',
        'modules-pm.js', 'modules-builder.js', 'mastery-content.js'
    ]) {
        vm.runInContext(fs.readFileSync(path.join(sourceDirectory, filename), 'utf8'), context, { filename });
    }
    return JSON.parse(vm.runInContext(`JSON.stringify({
        modules: [...MODULES_100, ...MODULES_200, ...MODULES_300, ...MODULES_PM, ...MODULES_BUILDER],
        mastery: ACADEMY_MASTERY,
        landscape: MODEL_LANDSCAPE
    })`, context));
}

function assertText(value, label, minimum = 20) {
    assert.equal(typeof value, 'string', label);
    assert.ok(value.trim().length >= minimum, `${label} needs substantive text`);
    assert.doesNotMatch(value, /\b(?:TODO|TBD|lorem ipsum)\b|\[object Object\]|\bundefined\b/i, label);
}

function assertTextList(values, label, minimumItems = 2) {
    assert.ok(Array.isArray(values), label);
    assert.ok(values.length >= minimumItems, label);
    values.forEach((value, index) => assertText(value, `${label}[${index}]`));
    assert.equal(new Set(values).size, values.length, `${label} must not repeat instructions`);
}

test('standalone coaching content covers exactly the 31 real modules', () => {
    const content = loadContent();
    const catalog = loadCatalog();
    assert.equal(content.version, '2026-09-14');
    assert.deepEqual(Object.keys(content).sort(), ['modules', 'paths', 'version']);
    assert.equal(catalog.modules.length, 31);
    assert.equal(new Set(catalog.modules.map(module => module.id)).size, 31);
    assert.deepEqual(Object.keys(content.modules).sort(), [...expectedIds].sort());
    assert.deepEqual(catalog.modules.map(module => module.id).sort(), [...expectedIds].sort());
    for (const activityId of catalog.mastery.activityIds) {
        assert.equal(Object.hasOwn(content.modules, activityId), false, activityId);
    }
});

test('product and building paths include their prerequisites in order without locks', () => {
    const content = loadContent();
    const { mastery } = loadCatalog();
    assert.ok(Array.isArray(content.paths));
    assert.ok(content.paths.length >= 2);
    assert.equal(new Set(content.paths.map(route => route.id)).size, content.paths.length);
    assert.ok(content.paths.some(route => route.id === 'ai-product-judgment'));
    assert.ok(content.paths.some(route => route.id === 'ai-building'));
    for (const route of content.paths) {
        assert.deepEqual(Object.keys(route).sort(), ['description', 'id', 'moduleIds', 'title']);
        assertText(route.title, `${route.id} title`, 8);
        assertText(route.description, `${route.id} description`);
        assert.ok(Array.isArray(route.moduleIds));
        assert.ok(route.moduleIds.length >= 4);
        const visited = new Set();
        for (const moduleId of route.moduleIds) {
            assert.ok(expectedIds.includes(moduleId), `${route.id}: unknown ${moduleId}`);
            assert.equal(visited.has(moduleId), false, `${route.id}: duplicate ${moduleId}`);
            for (const prerequisite of mastery.modules[moduleId].prerequisites) {
                assert.ok(visited.has(prerequisite), `${route.id}: ${moduleId} needs ${prerequisite} first`);
            }
            visited.add(moduleId);
        }
    }
});

test('each module declares original critical indexes and a valid scenario prediction', () => {
    const content = loadContent();
    const { modules } = loadCatalog();
    let nonFirstPolicies = 0;
    const predictionPositions = new Set();
    for (const module of modules) {
        const coaching = content.modules[module.id];
        assert.deepEqual(Object.keys(coaching).sort(), [
            'criticalQuestions', 'exemplar', 'lab', 'prediction', 'transfer', 'workedExample'
        ]);
        assert.ok(Array.isArray(coaching.criticalQuestions), module.id);
        assert.ok(coaching.criticalQuestions.length >= 1, module.id);
        assert.equal(new Set(coaching.criticalQuestions).size, coaching.criticalQuestions.length, module.id);
        for (const index of coaching.criticalQuestions) {
            assert.ok(Number.isInteger(index) && index >= 0 && index < module.quiz.length, module.id);
            assertText(module.quiz[index].question, `${module.id} original critical question`, 1);
        }
        if (coaching.criticalQuestions.some(index => index > 0)) nonFirstPolicies += 1;
        const prediction = coaching.prediction;
        assertText(prediction.prompt, `${module.id} prediction`);
        assertTextList(prediction.options, `${module.id} prediction options`, 3);
        assert.ok([3, 4].includes(prediction.options.length), module.id);
        assert.ok(Number.isInteger(prediction.correct), module.id);
        assert.ok(prediction.correct >= 0 && prediction.correct < prediction.options.length, module.id);
        assertText(prediction.explanation, `${module.id} explanation`, 80);
        predictionPositions.add(prediction.correct);
    }
    assert.ok(nonFirstPolicies >= 16, 'Critical policy must not blindly select question zero');
    assert.ok(predictionPositions.size >= 3, 'Predictions must not teach a fixed answer position');
});

test('worked examples teach distinct reasoning and transfers require observable checks', () => {
    const content = loadContent();
    for (const [moduleId, coaching] of Object.entries(content.modules)) {
        const worked = coaching.workedExample;
        assertText(worked.title, `${moduleId} worked title`, 8);
        assertText(worked.scenario, `${moduleId} scenario`, 80);
        assertTextList(worked.steps, `${moduleId} reasoning`, 3);
        assertText(worked.result, `${moduleId} result`, 60);
        const words = [worked.scenario, ...worked.steps, worked.result].join(' ').trim().split(/\s+/);
        assert.ok(words.length >= 120, `${moduleId}: ${words.length} worked words; needs a substantive example`);
        assert.match(worked.scenario, /fictional|synthetic/i, moduleId);
        assertText(coaching.transfer.prompt, `${moduleId} changed problem`, 65);
        assertTextList(coaching.transfer.checks, `${moduleId} transfer checks`, 3);
        assert.notEqual(coaching.transfer.prompt, coaching.prediction.prompt, moduleId);
    }
    const entries = Object.values(content.modules);
    for (const [label, values] of [
        ['scenarios', entries.map(entry => entry.workedExample.scenario)],
        ['results', entries.map(entry => entry.workedExample.result)],
        ['predictions', entries.map(entry => entry.prediction.prompt)],
        ['transfers', entries.map(entry => entry.transfer.prompt)],
        ['samples', entries.map(entry => entry.exemplar.sample)]
    ]) {
        assert.equal(new Set(values).size, 31, `${label} must be module-specific`);
    }
});

test('exemplars are fictional self-assessments with four scores and a named limitation', () => {
    for (const [moduleId, { exemplar }] of Object.entries(loadContent().modules)) {
        assertText(exemplar.artifact, `${moduleId} artifact`, 8);
        assertText(exemplar.sample, `${moduleId} sample`, 120);
        assert.match(exemplar.sample, /fictional|illustrative/i, moduleId);
        assert.match(exemplar.sample, /self.assess/i, moduleId);
        assert.ok(Array.isArray(exemplar.scores), moduleId);
        assert.equal(exemplar.scores.length, 4, moduleId);
        assert.ok(exemplar.scores.every(score => Number.isInteger(score) && score >= 0 && score <= 4), moduleId);
        assert.ok(exemplar.scores.some(score => score < 4), `${moduleId}: show a believable limitation`);
        assertText(exemplar.rationale, `${moduleId} rubric rationale`, 100);
        assert.match(exemplar.rationale, /limitation|failed|missing|untested|not tested|not measured/i, moduleId);
        assert.doesNotMatch(exemplar.sample, /learner (?:has )?(?:passed|completed)|independently verified/i, moduleId);
    }
});

test('lab metadata specifies local fixtures, verification, cleanup, cost and data boundaries', () => {
    const content = loadContent();
    const catalog = loadCatalog();
    for (const [moduleId, { lab }] of Object.entries(content.modules)) {
        assert.deepEqual(Object.keys(lab).sort(), [
            'cleanup', 'cost', 'environment', 'expected', 'failure', 'mode', 'safety', 'status', 'verify'
        ]);
        assert.ok(['local', 'cloud-optional', 'artifact'].includes(lab.mode), moduleId);
        assert.equal(lab.status, 'source-reviewed', moduleId);
        for (const field of ['environment', 'expected', 'failure', 'cost', 'safety']) {
            assertText(lab[field], `${moduleId} ${field}`, 40);
        }
        assert.match(lab.environment, /PowerShell|browser|Node|Python|editor/i, moduleId);
        assert.match(lab.environment, /fixture|mock|deterministic|tabletop|offline/i, moduleId);
        assertTextList(lab.verify, `${moduleId} verification`);
        assertTextList(lab.cleanup, `${moduleId} cleanup`, 1);
        assert.match(lab.cost, /\$0|no (?:API |cloud |paid )?charges|no paid|no provider/i, moduleId);
        assert.match(lab.safety, /synthetic|public/i, moduleId);
        assert.match(lab.safety, /secret|credential|API key/i, moduleId);
        if (lab.mode === 'cloud-optional') assert.match(lab.cost, /approv|opt.in|budget/i, moduleId);
        if (artifactIds.includes(moduleId)) {
            assert.equal(lab.mode, 'artifact', moduleId);
            assert.ok(!catalog.modules.find(module => module.id === moduleId).lab, moduleId);
        }
    }
    assert.equal(Object.values(content.modules).filter(entry => entry.lab.mode === 'artifact').length, 6);
});

test('November registry distinguishes current models, supported pins, lifecycle, and source review', () => {
    const { landscape } = loadCatalog();
    assert.equal(landscape.verifiedDate, '2026-11-11');
    assert.equal(landscape.verificationStatus, 'source-reviewed');
    assert.equal(landscape.nextReviewDate, '2026-11-17');
    assertText(landscape.reviewOwner, 'catalog review owner', 1);
    assert.match(landscape.verificationNote, /not (?:been )?executed/i);
    assert.match(landscape.verificationNote, /lab pins/);
    assert.match(landscape.verificationNote, /promotional through November 30, 2026/);
    assert.match(landscape.verificationNote, /100K.*\$0\.50\/\$2\.50/);
    assert.equal(landscape.openai.frontier, 'GPT-6 Astra');
    assert.equal(landscape.openai.frontierId, 'gpt-6-astra');
    assert.equal(landscape.openai.contextTokens, 1050000);
    assert.deepEqual(landscape.openai.frontierPrice, { input: '$10', output: '$50' });
    assert.equal(landscape.openai.supported, 'GPT-5.6 Sol');
    assert.equal(landscape.openai.supportedId, 'gpt-5.6-sol');
    assert.deepEqual(landscape.openai.supportedPrice, { input: '$4', output: '$20' });
    assert.equal(landscape.openai.balancedId, 'gpt-6.1-sol');
    assert.equal(landscape.openai.smallId, 'gpt-6-luna');
    assert.deepEqual(landscape.openai.balancedPrice, { input: '$2', output: '$10' });
    assert.deepEqual(landscape.openai.smallPrice, { input: '$0.10', output: '$0.50' });
    assert.equal(landscape.anthropic.frontier, 'Claude Fable 5.2');
    assert.equal(landscape.anthropic.frontierId, 'claude-fable-5-2');
    assert.equal(landscape.anthropic.reasoningId, 'claude-opus-5-5');
    assert.equal(landscape.anthropic.balancedId, 'claude-sonnet-5-5');
    assert.equal(landscape.anthropic.smallId, 'claude-haiku-5-5');
    assert.equal(landscape.anthropic.smallContextTokens, 1000000);
    assert.deepEqual(landscape.anthropic.frontierPrice, { input: '$8', output: '$40' });
    assert.deepEqual(landscape.anthropic.reasoningPrice, { input: '$4', output: '$20' });
    assert.deepEqual(landscape.anthropic.balancedPrice, { input: '$2', output: '$10' });
    assert.deepEqual(landscape.anthropic.balancedStandardPrice, { input: '$2', output: '$10' });
    assert.deepEqual(landscape.anthropic.smallPrice, { input: '$0.10', output: '$0.50' });
    assert.match(landscape.anthropic.balancedPriceStatus, /Older Sonnet 5.*active.*cancelled/);
    assert.equal(Object.hasOwn(landscape.anthropic, 'balancedIntroThrough'), false);
    assert.equal(landscape.google.stable, 'Gemini 3.8 Flash');
    assert.equal(landscape.google.stableId, 'gemini-3.8-flash');
    assert.equal(landscape.google.supported, 'Gemini 3.6 Flash');
    assert.equal(landscape.google.supportedId, 'gemini-3.6-flash');
    assert.equal(landscape.google.frontierId, 'gemini-4-carbon');
    assert.equal(landscape.google.frontierStatus, 'Current catalogue; verify account availability');
    assert.equal(landscape.google.smallId, 'gemini-3.5-flash-lite');
    assert.match(landscape.google.supported25, /deprecated.*existing API users/);
    assert.match(landscape.google.supported25, /December 1, 2026.*billing/);
    assert.match(landscape.google.supported25, /Flash-Lite is not deprecated.*access-limited/);
    for (const source of Object.values(landscape.sources)) {
        assert.equal(source.verifiedDate, '2026-11-11');
        assert.match(source.models, /^https:\/\//);
        assert.match(source.lifecycle, /^https:\/\//);
    }
});

test('dependent November lessons distinguish catalogue facts and historical lab pins without changing arithmetic', () => {
    const { modules } = loadCatalog();
    const byId = Object.fromEntries(modules.map(module => [module.id, module]));
    for (const moduleId of ['phase0-orientation', 'landscape-2026-ai-systems', 'pm-unit-economics']) {
        const text = JSON.stringify(byId[moduleId]);
        assert.doesNotMatch(text, /introductory.{0,120}August 31|Post-promotion|\$3\/\$15|Big Three Platforms.{0,10}(?:July|September) 2026/i, moduleId);
        assert.doesNotMatch(text, /\bundefined\b/, moduleId);
        assert.match(text, /Fable 5\.2/, moduleId);
        assert.match(text, /Sonnet 5\.5/, moduleId);
        assert.match(text, /not (?:been )?executed|no provider lab was executed/i, moduleId);
    }
    assert.match(byId['phase0-orientation'].learn, /GPT-6 Astra/);
    assert.match(byId['phase0-orientation'].learn, /GPT-5\.6 Sol/);
    assert.match(byId['phase0-orientation'].learn, /Gemini 3\.8 Flash/);
    assert.match(byId['phase0-orientation'].learn, /Gemini 4 Carbon/);
    assert.match(byId['phase0-orientation'].learn, /Haiku 4\.5.*200K/);
    assert.match(byId['phase3-ai-from-code'].learn, /model="gemini-3\.6-flash"/);
    assert.match(JSON.stringify(byId['phase3-ai-from-code'].lab), /gemini-3\.6-flash/);
    assert.match(JSON.stringify(byId['phase11-product'].lab), /Gemini 2\.5 Flash/);
    assert.match(JSON.stringify(byId['phase11-product'].lab), /deprecated.*December 1, 2026.*billing/);
    const economics = byId['pm-unit-economics'].learn;
    assert.match(economics, /Older Sonnet 5.*active at \$2\/\$10/);
    assert.match(economics, /cancelled September increase/);
    assert.match(economics, /\$0\.0092 per query/);
    assert.match(economics, /\$0\.0132/);
    assert.match(economics, /\$0\.0156/);
    assert.match(economics, /\$0\.37/);
    assert.ok(Math.abs((2600 * 2 + 800 * 10) / 1000000 - 0.0132) < 1e-12);
    assert.ok(Math.abs((1800 * 2 + 1200 * 10) / 1000000 - 0.0156) < 1e-12);
});

test('MCP definitions use project-root mcp config while genuine hooks and permissions remain settings', () => {
    const { modules } = loadCatalog();
    const phase7 = modules.find(module => module.id === 'phase7-claude-code');
    const phase8 = modules.find(module => module.id === 'phase8-multi-agent');
    const phase9 = modules.find(module => module.id === 'phase9-mcp-skills');
    for (const module of [phase7, phase9]) {
        assert.match(module.learn, /https:\/\/code\.claude\.com\/docs\/en\/mcp#project-scope/);
        assert.match(module.learn, /~\/\.claude\.json/);
        const instructions = module.lab.steps.flatMap(step => step.instructions);
        const configs = instructions.filter(instruction => instruction.type === 'code' && instruction.language === 'json')
            .map(instruction => ({ instruction, config: JSON.parse(instruction.code) }))
            .filter(({ config }) => config.mcpServers);
        assert.equal(configs.length, 1, module.id);
        const { instruction, config } = configs[0];
        assert.deepEqual(Object.keys(config), ['mcpServers'], module.id);
        const index = instructions.indexOf(instruction);
        assert.match(instructions[index - 1], /project.root \.mcp\.json/i, module.id);
        assert.doesNotMatch(JSON.stringify(module), /register MCP servers in \.claude\/settings\.json|Add to \.claude\/settings\.json|Permissions \+ MCP/i, module.id);
    }
    assert.match(phase7.learn, /# In \.claude\/settings\.json\s*\{\s*"hooks"/);
    assert.match(JSON.stringify(phase7.interactive), /Permissions \+ hooks/);
    assert.match(phase7.quiz[7].options[phase7.quiz[7].correct], /\.mcp\.json/);
    assert.doesNotMatch(phase8.learn, /~\/\.claude\/settings\.json<\/td><td>Personal servers/);
    assert.match(phase8.learn, /<strong>Local<\/strong>/);
});

test('SaaS uses synthetic fixtures and consistent monthly quotas; authenticated rate-limit tests reach their target', () => {
    const { modules } = loadCatalog();
    const product = modules.find(module => module.id === 'phase11-product');
    const fullstack = modules.find(module => module.id === 'phase10-fullstack');
    const productText = JSON.stringify(product);
    assert.doesNotMatch(productText, /real inputs from your work|5 generations\/day|daily_used|daily_limit/i);
    assert.match(productText, /synthetic fixture/i);
    assert.match(productText, /5 generations\/month/);
    assert.match(productText, /monthly_used/);
    assert.match(productText, /monthly_limit/);
    assert.match(productText, /UTC calendar month/);
    const protectionStep = fullstack.lab.steps[1];
    const commands = protectionStep.instructions.filter(instruction => instruction.type === 'command').map(instruction => instruction.cmd).join('\n');
    assert.match(commands, /Authorization/);
    assert.match(commands, /LOCAL_TEST_TOKEN/);
    assert.match(commands, /localhost:8000\/api\/run-agent/);
    assert.match(JSON.stringify(protectionStep), /mock|stub/i);
    assert.match(JSON.stringify(protectionStep), /Bearer/);
});