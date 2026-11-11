const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function load() {
    const values = new Map();
    const context = vm.createContext({
        console, URLSearchParams,
        localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
    });
    for (const file of ['progress', 'learning-engine', 'portfolio-engine']) {
        const target = path.join(__dirname, '..', 'js', `${file}.js`);
        if (fs.existsSync(target)) vm.runInContext(fs.readFileSync(target, 'utf8'), context);
    }
    return vm.runInContext('({progress:ProgressManager, engine:typeof PortfolioEngine === "undefined" ? null : PortfolioEngine})', context);
}

test('portfolio drafts and review notes survive the existing backup without becoming mastery', () => {
    const { progress } = load();
    const state = progress.defaultProgress();
    state.portfolios = { pm: { version: 1, sections: { problem: 'Synthetic museum workflow and evidence' }, assistance: 'scaffolded', scores: [3, 0, 4, 4], provenance: 'self-assessed', reviewer: '' } };
    state.editorialReviews = { openai: { owner: 'Course maintainer', reviewed: '2026-11-11', decision: 'needs-update', notes: 'An exact model retirement notice needs a scoped migration review.' } };
    progress.saveProgress(state);
    const exported = progress.createExport();
    assert.equal(exported.portfolios?.pm?.sections.problem, state.portfolios.pm.sections.problem);
    assert.equal(exported.editorialReviews?.openai?.decision, 'needs-update');
    assert.equal(Object.keys(exported.moduleMastery).length, 0);
});

test('readiness requires every essential score and evidence section, not a compensating average', () => {
    const { engine } = load();
    assert.ok(engine, 'Portfolio engine is required');
    const sections = Object.fromEntries(engine.TRACKS.pm.sections.map(section => [section.id, 'Synthetic evidence with a result, limitation and independently inspectable artifact.']));
    const draft = { sections, scores: [0, 4, 4, 4], provenance: 'self-assessed', assistance: 'generated' };
    assert.equal(engine.readiness('pm', draft).ready, false);
    assert.equal(engine.readiness('pm', { ...draft, scores: [3, 3, 3, 3] }).ready, true);
    assert.equal(engine.readiness('pm', { ...draft, scores: [3, 3, 3, 3], sections: {} }).ready, false);
    assert.equal(engine.readiness('pm', { ...draft, scores: [3, 3, 3, 3], provenance: 'reviewer-reported', reviewer: '' }).ready, false);
    assert.equal(engine.readiness('pm', { ...draft, scores: [3, 3, 3, 3], assistance: undefined }).ready, false);
});

test('malformed dossier sections cannot replace a stored backup', () => {
    const { progress } = load();
    const record = progress.defaultProgress();
    record.portfolios = { pm: { sections: [], scores: [3, 3, 3, 3] } };
    assert.throws(() => progress.validateProgress(record), /portfolio/i);
});

test('dossier export identifies assistance, uncertainty and safely preserves untrusted text', () => {
    const { engine } = load();
    assert.ok(engine);
    const output = engine.exportText('builder', { sections: { problem: '<script>bad()</script>\n```\n# forged' }, scores: [], assistance: 'generated', provenance: 'self-assessed' });
    assert.match(output, /generated/);
    assert.match(output, /not independently verified/i);
    assert.match(output, /````text/);
    assert.match(output, /Changed requirement/);
});
