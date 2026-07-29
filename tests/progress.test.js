const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadProgressManager() {
    const values = new Map();
    const context = {
        Blob: class Blob {},
        console,
        Date,
        localStorage: {
            getItem: key => values.has(key) ? values.get(key) : null,
            removeItem: key => values.delete(key),
            setItem: (key, value) => values.set(key, String(value))
        },
        URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} }
    };
    vm.createContext(context);
    const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'progress.js'), 'utf8');
    vm.runInContext(`${source}\n;globalThis.__progressManager = ProgressManager;`, context);
    return context.__progressManager;
}

test('default progress uses the versioned mastery schema', () => {
    const manager = loadProgressManager();
    const progress = manager.defaultProgress();

    assert.equal(progress.schemaVersion, 2);
    assert.equal(Object.keys(progress.moduleMastery).length, 0);
});

test('quiz and lab evidence advance a module from learned to practiced', () => {
    const manager = loadProgressManager();
    const requirements = { quiz: true, lab: true, transfer: true };

    manager.saveQuizScore('module-a', 8, 10);
    assert.equal(manager.getMasteryStatus('module-a', requirements).state, 'learned');

    manager.completeLab('module-a');
    assert.equal(manager.getMasteryStatus('module-a', requirements).state, 'practiced');
});

test('viewing content does not count as learned when its quiz is still missing', () => {
    const manager = loadProgressManager();
    manager.markContentReviewed('module-a');

    const status = manager.getMasteryStatus('module-a', { quiz: true, lab: true, transfer: true });

    assert.equal(status.state, 'not_started');
    assert.deepEqual(Array.from(status.missing), ['quiz', 'lab', 'transfer']);
});

test('transfer evidence advances a practiced module to demonstrated', () => {
    const manager = loadProgressManager();
    const requirements = { quiz: true, lab: true, transfer: true };

    manager.saveQuizScore('module-a', 9, 10);
    manager.completeLab('module-a');
    manager.saveTransferResult('module-a', 3, 4, 'Explained the design and attached test evidence.');

    assert.equal(manager.getMasteryStatus('module-a', requirements).state, 'demonstrated');
});

test('four successful spaced reviews make demonstrated mastery durable', () => {
    const manager = loadProgressManager();
    const requirements = { quiz: true, lab: true, transfer: true };

    manager.saveQuizScore('module-a', 9, 10);
    manager.completeLab('module-a');
    manager.saveTransferResult('module-a', 4, 4, 'Independent task with evidence.');
    ['2026-07-27', '2026-07-30', '2026-08-06', '2026-08-27'].forEach(date => {
        manager.recordReview('module-a', true, `${date}T10:00:00.000Z`);
    });

    assert.equal(manager.getMasteryStatus('module-a', requirements).state, 'durable');
});

test('legacy completion is preserved but marked for revalidation', () => {
    const manager = loadProgressManager();
    const migrated = manager.normalizeProgress({
        completedModules: ['legacy-module'],
        quizScores: {},
        completedLabs: []
    });

    assert.equal(migrated.schemaVersion, 2);
    assert.equal(migrated.moduleMastery['legacy-module'].legacy, true);
    assert.equal(migrated.moduleMastery['legacy-module'].state, 'learned');
});

test('a due review appears only after demonstrated mastery', () => {
    const manager = loadProgressManager();
    manager.saveQuizScore('module-a', 9, 10);
    manager.completeLab('module-a');
    manager.saveTransferResult('module-a', 4, 4, 'Independent task with test evidence and a design explanation.');

    const nextDue = manager.getProgress().moduleMastery['module-a'].review.nextDue;
    const due = manager.getDueReviews(nextDue);

    assert.deepEqual(Array.from(due), ['module-a']);
});

test('diagnostic results persist with a recommended starting module', () => {
    const manager = loadProgressManager();
    manager.saveDiagnosticResult('phase4-memory-rag', 7, 10, [1, 2, 0]);

    const result = manager.getProgress().diagnostic;

    assert.equal(result.recommendedModuleId, 'phase4-memory-rag');
    assert.equal(result.score, 7);
    assert.equal(result.total, 10);
    assert.deepEqual(Array.from(result.answers), [1, 2, 0]);
});
