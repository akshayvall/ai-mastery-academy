const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function load(globals = {}) {
    const values = new Map();
    const faults = { writes: false };
    const context = {
        URLSearchParams, console, ...globals,
        localStorage: {
            getItem: key => values.get(key) ?? null,
            setItem: (key, value) => {
                if (faults.writes) throw new Error('Quota');
                values.set(key, value);
            }
        }
    };
    vm.createContext(context);
    for (const file of ['progress', 'learning-engine', 'unit-engine']) {
        const source = path.join(__dirname, '..', 'js', `${file}.js`);
        if (fs.existsSync(source)) vm.runInContext(fs.readFileSync(source, 'utf8'), context);
    }
    vm.runInContext('globalThis.manager = ProgressManager; globalThis.routes = LearningEngine; globalThis.units = typeof UnitEngine === "undefined" ? null : UnitEngine;', context);
    return { ...context, values, faults };
}

test('unit drafts survive normalization and export without altering legacy evidence', () => {
    const { manager } = load();
    const progress = manager.defaultProgress();
    progress.completedModules = ['phase1-prompting'];
    progress.unitLearning = {
        'phase0-orientation': { unitId: 'evidence', step: 'try', version: '2026-11-11', records: {
            evidence: { practice: 1, practiceChecked: true, check: null, checkChecked: false, passed: false, reflection: 'My explanation' }
        }}
    };
    manager.saveProgress(progress);
    const restored = manager.createExport();
    assert.equal(restored.unitLearning?.['phase0-orientation']?.step, 'try');
    assert.equal(restored.unitLearning['phase0-orientation'].records.evidence.reflection, 'My explanation');
    assert.deepEqual(Array.from(restored.completedModules), ['phase1-prompting']);
    assert.equal(Object.keys(restored.moduleMastery).includes('phase0-orientation'), false);
});

test('failed unit saves keep recoverable state and do not replace committed progress', () => {
    const { manager, faults, values } = load();
    manager.saveProgress(manager.defaultProgress());
    const before = values.get(manager.STORAGE_KEY);
    faults.writes = true;
    const progress = manager.getProgress();
    progress.unitLearning = { 'phase0-orientation': { unitId: 'evidence', step: 'check', version: '2026-11-11', records: {} } };
    assert.equal(manager.saveProgress(progress), false);
    assert.equal(values.get(manager.STORAGE_KEY), before);
    assert.equal(manager.getProgress().unitLearning?.['phase0-orientation']?.step, 'check');
    faults.writes = false;
    assert.equal(manager.retrySave(), true);
    assert.equal(manager.getProgress().unitLearning['phase0-orientation'].step, 'check');
});

test('unit routes preserve explicit position and distinguish legacy reference routes', () => {
    const { routes } = load();
    const route = routes.parseRoute('#phase0-orientation?unit=evidence&step=check');
    assert.equal(route.unitId, 'evidence');
    assert.equal(route.step, 'check');
    assert.equal(routes.formatRoute(route), '#phase0-orientation?unit=evidence&step=check');
    assert.equal(routes.parseRoute('#phase0-orientation?tab=quiz').reference, true);
    assert.equal(routes.parseRoute('#phase0-orientation?mode=browse').reference, true);
    const reference = { moduleId: 'phase0-orientation', tab: 'learn', mode: 'guided', reference: true };
    assert.equal(routes.parseRoute(routes.formatRoute(reference)).reference, true);
    assert.equal(routes.parseRoute('#path').destination, 'today');
    assert.equal(routes.parseRoute('#lab').destination, 'build');
    assert.equal(routes.parseRoute('#progress').destination, 'more');
});

test('malformed nested unit imports are rejected before replacing previous progress', () => {
    const { manager } = load();
    const progress = manager.defaultProgress();
    progress.unitLearning = { 'phase0-orientation': { unitId: 'evidence', records: [] } };
    assert.throws(() => manager.validateProgress(progress, { importing: true }), /unit/i);
});

test('a changed check cannot pass without practice and a teach-back; wrong answer stays failed', () => {
    const { units } = load();
    assert.ok(units, 'UnitEngine must implement the learning contract');
    const unit = { practice: { correct: 1, options: ['a', 'b', 'c'] }, check: { correct: 2, options: ['a', 'b', 'c'] } };
    assert.equal(units.canComplete(unit, { check: 2, reflection: 'A sufficiently clear explanation.' }), false);
    assert.equal(units.canComplete(unit, { practice: 1, practiceChecked: true, check: 0, reflection: 'A sufficiently clear explanation.' }), false);
    assert.equal(units.canComplete(unit, { practice: 1, practiceChecked: true, check: 2, reflection: '' }), false);
    assert.equal(units.canComplete(unit, { practice: 1, practiceChecked: true, check: 2, reflection: 'A sufficiently clear explanation.' }), true);
});

test('saving one unit preserves a different unit saved by another tab', () => {
    const { manager, units } = load();
    const state = { unitId: 'first', step: 'try', version: '2026-11-11', records: { first: { reflection: 'First draft' } } };
    units.current = { moduleId: 'phase0-orientation', unit: { id: 'first' }, state, record: state.records.first };
    const progress = manager.defaultProgress();
    progress.unitLearning = { 'phase0-orientation': {
        unitId: 'second', step: 'check', version: '2026-11-11',
        records: { second: { reflection: 'Second tab draft' } }
    }};
    manager.saveProgress(progress);
    units.persist();
    const records = manager.getProgress().unitLearning['phase0-orientation'].records;
    assert.equal(records.second?.reflection, 'Second tab draft');
    assert.equal(records.first.reflection, 'First draft');
});

test('selected paths do not force unrelated modules or optional specialties into the next action', () => {
    const { units } = load({
        ACADEMY_UNITS: { version: 'test', modules: { a: [], b: [], c: [] } },
        LEARNING_CONTENT: { paths: [{ id: 'pm', moduleIds: ['b', 'a'] }] },
        UIStateManager: { get: () => ({ activePath: 'pm' }) }
    });
    assert.deepEqual(Array.from(units.orderedModules()), ['b', 'a']);
    const core = { id: 'core' };
    const optional = { id: 'specialty', optional: true };
    assert.equal(units.nextUnit([core, optional], core), undefined);
    assert.equal(units.nextUnit([core, optional, { id: 'later' }], core).id, 'later');
});
