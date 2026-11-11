const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadDiagramSystem() {
    const jsDir = path.join(__dirname, '..', 'js');
    const files = [
        'landscape.js', 'modules-100.js', 'modules-200.js', 'modules-300.js',
        'modules-extras.js', 'modules-pm.js', 'modules-builder.js', 'diagrams.js'
    ];
    const context = {};
    vm.createContext(context);
    const source = files.map(file => fs.readFileSync(path.join(jsDir, file), 'utf8')).join('\n');
    vm.runInContext(`${source}\n;globalThis.__result = {
        modules: [...MODULES_100, ...MODULES_200, ...MODULES_300, ...MODULES_EXTRAS, ...MODULES_PM, ...MODULES_BUILDER],
        engine: DiagramEngine
    };`, context);
    return context.__result;
}

function getInstances(modules) {
    return Array.from(modules, module =>
        Array.from(module.diagrams || [], diagram => ({ module, diagram }))
    ).flat();
}

function getMaximumSvgStep(markup) {
    const steps = Array.from(markup.matchAll(/data-step=["'](\d+)["']/g), match => Number(match[1]));
    return steps.length ? Math.max(...steps) : 0;
}

function getTextBoxes(markup, text) {
    return Array.from(markup.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g))
        .filter(match => match[2] === text)
        .map(match => {
            const x = Number((match[1].match(/\bx=["']([^"']+)/) || [])[1]);
            const y = Number((match[1].match(/\by=["']([^"']+)/) || [])[1]);
            const fontSize = Number((match[1].match(/font-size=["']([^"']+)/) || [])[1]) || 12;
            const anchor = (match[1].match(/text-anchor=["']([^"']+)/) || [])[1] || 'start';
            const width = match[2].length * fontSize * 0.58;
            const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
            return { left, right: left + width, top: y - fontSize, bottom: y + fontSize * 0.2 };
        });
}

function boxesIntersect(left, right) {
    return Math.min(left.right, right.right) > Math.max(left.left, right.left)
        && Math.min(left.bottom, right.bottom) > Math.max(left.top, right.top);
}

test('every declared AI diagram has an explicit builder', () => {
    const { modules, engine } = loadDiagramSystem();
    const missing = [...new Set(getInstances(modules)
        .filter(({ diagram }) => !engine.builders[diagram.type])
        .map(({ diagram }) => diagram.type))];

    assert.deepEqual(missing, []);
});

test('every explicit AI diagram builder is used by the curriculum', () => {
    const { modules, engine } = loadDiagramSystem();
    const usedTypes = new Set(getInstances(modules).map(({ diagram }) => diagram.type));
    const unused = Object.keys(engine.builders)
        .filter(type => !type.startsWith('_') && !usedTypes.has(type));

    assert.deepEqual(unused, []);
});

test('AI diagram IDs are unique across the runtime curriculum', () => {
    const { modules } = loadDiagramSystem();
    const counts = new Map();
    getInstances(modules).forEach(({ diagram }) => counts.set(diagram.id, (counts.get(diagram.id) || 0) + 1));

    assert.deepEqual([...counts.entries()].filter(([, count]) => count > 1), []);
});

test('AI diagram step copy matches rendered SVG steps', () => {
    const { modules, engine } = loadDiagramSystem();
    const mismatches = getInstances(modules)
        .filter(({ diagram }) => engine.builders[diagram.type])
        .map(({ module, diagram }) => {
            const markup = engine.builders[diagram.type].call(engine, diagram);
            return {
                moduleId: module.id,
                diagramId: diagram.id,
                declared: (diagram.steps || []).length,
                rendered: getMaximumSvgStep(markup)
            };
        })
        .filter(result => result.declared !== result.rendered);

    assert.deepEqual(mismatches, []);
});

test('every narrated step has a detailed SVG highlight, without gaps', () => {
    const { modules, engine } = loadDiagramSystem();
    const missing = [];
    getInstances(modules).forEach(({ diagram }) => {
        const svg = engine.builders[diagram.type].call(engine, diagram);
        const steps = new Set(Array.from(svg.matchAll(/data-step=["'](\d+)["']/g), match => Number(match[1])));
        diagram.steps.forEach((_, index) => {
            if (!steps.has(index + 1)) missing.push(`${diagram.id}: step ${index + 1}`);
        });
    });
    assert.deepEqual(missing, []);
});

test('every AI diagram builder returns a valid bounded SVG', () => {
    const { modules, engine } = loadDiagramSystem();
    getInstances(modules).forEach(({ module, diagram }) => {
        const builder = engine.builders[diagram.type];
        if (!builder) return;
        const markup = builder.call(engine, diagram);
        assert.match(markup, /^<svg\b/);
        assert.match(markup, /viewBox=["'][^"']+["']/);
        assert.ok(!markup.includes('undefined'), `${module.id}/${diagram.id} contains undefined`);
        assert.ok(!markup.includes('NaN'), `${module.id}/${diagram.id} contains NaN`);
    });
});

test('embedding-space labels do not collide', () => {
    const { engine } = loadDiagramSystem();
    const markup = engine.builders['embedding-space'].call(engine, {});
    const pairs = [
        ['horse', 'sheep'],
        ['cow', 'query: "kitten"'],
        ['javascript', 'java']
    ];

    pairs.forEach(([leftText, rightText]) => {
        const left = getTextBoxes(markup, leftText)[0];
        const right = getTextBoxes(markup, rightText)[0];
        assert.ok(left && right, `Expected ${leftText} and ${rightText}`);
        assert.ok(!boxesIntersect(left, right), `${leftText} overlaps ${rightText}`);
    });
});

test('AI diagram canvases are keyboard-focusable scroll regions', () => {
    const { modules, engine } = loadDiagramSystem();
    const diagram = getInstances(modules)[0].diagram;
    const html = engine.renderDiagram(diagram, 0);

    assert.match(html, /class="diagram-canvas"[^>]*tabindex="0"/);
    assert.match(html, /class="diagram-canvas"[^>]*aria-label="Scrollable diagram:/);
});

test('every instance teaches a complete compact relationship before optional SVG detail', () => {
    const { modules, engine } = loadDiagramSystem();
    getInstances(modules).forEach(({ diagram }) => {
        const html = engine.renderDiagram(diagram, 0);
        assert.match(html, /class="diagram-overview"/, diagram.id);
        assert.match(html, /class="diagram-state-list"/, diagram.id);
        assert.match(html, /class="diagram-failure"/, diagram.id);
        assert.match(html, /<details class="diagram-detail">/, diagram.id);
        assert.ok(html.indexOf('diagram-overview') < html.indexOf('diagram-detail'), diagram.id);
        const model = engine.getLearningModel(diagram);
        assert.equal(model.states.length, diagram.steps.length, diagram.id);
        assert.ok(model.overview && model.caveat && model.failure, diagram.id);
        assert.equal(new Set(model.states.map(state => state[0])).size, model.states.length, diagram.id);
        model.states.forEach(state => {
            assert.equal(state.length, 4, diagram.id);
            assert.ok(state.every(value => typeof value === 'string' && value.length > 0), diagram.id);
            assert.ok(['data', 'control', 'approval', 'failure'].includes(state[3]), diagram.id);
        });
    });
});

test('walkthrough exposes one Next action and no cosmetic Play control', () => {
    const { modules, engine } = loadDiagramSystem();
    getInstances(modules).forEach(({ diagram }) => {
        const html = engine.renderDiagram(diagram, 0);
        assert.match(html, /data-diagram-action="step"[^>]*>Next step</);
        assert.match(html, /data-diagram-action="previous"[^>]*disabled/);
        assert.match(html, /data-diagram-action="reset"[^>]*disabled/);
        assert.doesNotMatch(html, /data-diagram-action="play"/);
    });
});

test('generated narratives stay intact beside explicit renderer corrections', () => {
    const { modules, engine } = loadDiagramSystem();
    getInstances(modules).filter(({ diagram }) => diagram.type.startsWith('b-')).forEach(({ diagram }) => {
        const before = JSON.stringify(diagram);
        const html = engine.renderDiagram(diagram, 0);
        assert.match(html, /Generated source review blocked/);
        assert.match(html, /Original source narrative/);
        assert.ok(html.includes(engine.escapeHtml(diagram.description)), diagram.id);
        diagram.steps.forEach(step => assert.ok(html.includes(engine.escapeHtml(step)), diagram.id));
        assert.equal(JSON.stringify(diagram), before);
    });
});

test('training renderer shows validation and held-out task evidence, not a diagnosis from shape alone', () => {
    const { modules, engine } = loadDiagramSystem();
    const diagram = getInstances(modules).find(({ diagram }) => diagram.type === 'b-curves').diagram;
    const svg = engine.builders['b-curves'].call(engine, diagram);
    assert.match(svg, /Training loss/);
    assert.match(svg, /Validation loss/);
    assert.match(svg, /Held-out task/);
    assert.match(svg, /Illustrative/);
    assert.doesNotMatch(svg, />healthy<|>memorizing<|>broken</);
});

test('renderer semantics include enforcement and uncertainty rather than success-only flows', () => {
    const { modules, engine } = loadDiagramSystem();
    const types = Object.fromEntries(getInstances(modules).map(({ diagram }) => [diagram.type, diagram]));
    const text = type => JSON.stringify(engine.getLearningModel(types[type]));
    assert.match(text('agent-loop'), /budget/i);
    assert.match(text('agent-loop'), /human approval/i);
    assert.match(text('tool-calling'), /authoriz/i);
    assert.match(text('tool-calling'), /timeout/i);
    assert.match(text('mcp-architecture'), /negotiat/i);
    assert.match(text('mcp-architecture'), /host/i);
    assert.match(text('b-bars'), /illustrative/i);
    assert.match(text('b-bars'), /reviewer/i);
    assert.match(text('b-graph'), /entity|resolution/i);
    const guardrail = getInstances(modules).find(({ diagram }) => diagram.id === 'b-rag-defense').diagram;
    assert.match(JSON.stringify(engine.getLearningModel(guardrail)), /not.*authorization|not.*guarantee/i);
});

test('optional detail retains approval, dependency and provenance caveats', () => {
    const { modules, engine } = loadDiagramSystem();
    const types = Object.fromEntries(getInstances(modules).map(({ diagram }) => [diagram.type, diagram]));
    const svg = type => engine.builders[type].call(engine, types[type]);
    assert.match(svg('multi-agent'), /Research.*Writer.*Reviewer/);
    assert.doesNotMatch(svg('multi-agent'), /Workers run in parallel/);
    assert.match(svg('rag-pipeline'), /abstain|Abstain/);
    assert.match(svg('claude-code-workflow'), /Human review/);
    assert.doesNotMatch(svg('claude-code-workflow'), /tests pass → git/);
    assert.match(svg('b-bars'), /Illustrative/);
    assert.match(svg('b-layers'), /not guarantees|not a guarantee|Illustrative adapter/);
});

test('timeline detail is an explicit corrective sequence with call identity and cancellation', () => {
    const { modules, engine } = loadDiagramSystem();
    getInstances(modules).filter(({ diagram }) => diagram.type === 'b-timeline').forEach(({ diagram }) => {
        const svg = engine.builders['b-timeline'].call(engine, diagram);
        assert.match(svg, /Controller/);
        assert.match(svg, /Policy/);
        assert.match(svg, /call A/);
        assert.match(svg, /call B/);
        assert.match(svg, /cancel|Cancel/);
        assert.match(svg, /Illustrative sequence correction/);
    });
});

test('AI diagrams use durable dimensions and current MCP transports', () => {
    const { modules, engine } = loadDiagramSystem();
    const phase4 = modules.find(module => module.id === 'phase4-memory-rag');
    const phase9 = modules.find(module => module.id === 'phase9-mcp-skills');
    const tokenisation = engine.builders.tokenisation.call(engine, {});
    const nextToken = engine.builders['next-token'].call(engine, {});
    const mcp = engine.builders['mcp-architecture'].call(engine, {});

    assert.doesNotMatch(tokenisation, /100K-token vocab|≈ 4 chars per token/);
    assert.doesNotMatch(nextToken, /50K others/);
    assert.doesNotMatch(`${phase4.learn} ${phase4.diagrams[1].description}`, /128K–200K|typically\) 1536-D/);
    assert.doesNotMatch(`${phase9.diagrams[0].steps.join(' ')} ${mcp}`, /WebSocket/);
    assert.match(mcp, /Streamable HTTP/);
});

test('AI diagram builders are deterministic for identical input', () => {
    const { modules, engine } = loadDiagramSystem();
    const byType = new Map();
    getInstances(modules).forEach(({ diagram }) => {
        if (!byType.has(diagram.type)) byType.set(diagram.type, diagram);
    });

    byType.forEach((diagram, type) => {
        const first = engine.builders[type].call(engine, diagram);
        const second = engine.builders[type].call(engine, diagram);
        assert.equal(second, first, `${type} changes between identical renders`);
    });
});
