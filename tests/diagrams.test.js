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

test('AI mobile diagrams preserve a readable local canvas width', () => {
    const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');

    assert.match(css, /\.diagram-canvas svg\s*\{[^}]*min-width:\s*56rem;[^}]*width:\s*56rem;/s);
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
