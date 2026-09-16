const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadProgressManager({ failWrites = false, values = new Map(), faults = {}, globals = {} } = {}) {
    const context = {
        Blob,
        console: failWrites ? { error() {} } : console,
        Date,
        FileReader: class FileReader {
            readAsText(file) {
                this.onload({ target: { result: file.contents } });
            }
        },
        localStorage: {
            getItem: key => {
                if (faults.failReads && key === faults.key) throw new Error('Storage read denied');
                return values.has(key) ? values.get(key) : null;
            },
            removeItem: key => {
                if (faults.failDeletes && key === faults.key) throw new Error('Storage delete denied');
                if (!faults.ignoreDeletes) values.delete(key);
            },
            setItem: (key, value) => {
                if (failWrites || (faults.failWrites && key === faults.key)) {
                    faults.rejectedWrites = (faults.rejectedWrites || 0) + 1;
                    throw new Error('Storage quota exceeded');
                }
                values.set(key, String(value));
            }
        },
        URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
        ...globals
    };
    vm.createContext(context);
    const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'progress.js'), 'utf8');
    vm.runInContext(`${source}\n;globalThis.__progressManager = ProgressManager;`, context);
    return context.__progressManager;
}

function progressFile(data, overrides = {}) {
    const contents = typeof data === 'string' ? data : JSON.stringify(data);
    return { name: 'progress.json', type: 'application/json', size: Buffer.byteLength(contents), contents, ...overrides };
}

function seedDueReview(manager, moduleId = 'phase4-memory-rag') {
    const progress = manager.defaultProgress();
    progress.moduleMastery[moduleId] = manager.normalizeMasteryEntry({
        contentReviewed: true,
        quiz: { firstScore: 9, latestScore: 9, total: 10, criticalMisses: 0, completedAt: '2026-07-26T10:00:00.000Z' },
        lab: { completed: true, completedAt: '2026-07-26T10:00:00.000Z' },
        transfer: { score: 4, max: 4, reflection: 'Independent artifact with test evidence.', completedAt: '2026-07-26T10:00:00.000Z' },
        review: { nextDue: '2026-07-27T10:00:00.000Z' }
    });
    manager.saveProgress(progress);
}

test('quota-rejected imports preserve the committed record and report failure', async () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    const previous = manager.defaultProgress();
    previous.completedModules = ['phase4-memory-rag'];
    assert.equal(manager.saveProgress(previous), true);
    const key = manager.STORAGE_KEY;
    const raw = values.get(key);
    faults.key = key;
    faults.failWrites = true;

    await assert.rejects(manager.importProgress(progressFile(manager.defaultProgress())), /save|storage/i);

    assert.equal(faults.rejectedWrites, 1);
    assert.equal(values.get(key), raw);
    assert.deepEqual(Array.from(manager.getProgress().completedModules), ['phase4-memory-rag']);
    assert.equal(manager.getStorageStatus().saved, false);
});

test('quota-rejected imports restore the previous pending snapshot for retry', async () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    manager.saveProgress(manager.defaultProgress());
    const key = manager.STORAGE_KEY;
    const raw = values.get(key);
    faults.key = key;
    faults.failWrites = true;
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    const pending = JSON.stringify(manager.getProgress());

    await assert.rejects(manager.importProgress(progressFile(manager.defaultProgress())), /save|storage/i);

    assert.equal(faults.rejectedWrites, 2);
    assert.equal(values.get(key), raw);
    assert.equal(JSON.stringify(manager.getProgress()), pending);
    assert.equal(manager.getStorageStatus().saved, false);
    faults.failWrites = false;
    assert.equal(manager.retrySave(), true);
    assert.equal(values.get(key), pending);
});

test('failed saves are signaled and retain exportable work', () => {
    const manager = loadProgressManager({ failWrites: true });
    const progress = manager.defaultProgress();
    progress.completedModules = ['module-a'];

    assert.equal(manager.saveProgress(progress), false);
    assert.deepEqual(Array.from(manager.getProgress().completedModules), ['module-a']);
    assert.equal(manager.getStorageStatus().saved, false);
});

test('successful saves explicitly confirm persistence', () => {
    const manager = loadProgressManager();

    assert.equal(manager.saveProgress(manager.defaultProgress()), true);
    assert.equal(manager.getStorageStatus().saved, true);
});

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

    seedDueReview(manager, 'module-a');
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

test('exports identify the academy and round trip all existing progress fields', async () => {
    const values = new Map();
    const manager = loadProgressManager({ values });
    const progress = manager.defaultProgress();
    progress.completedModules = ['phase4-memory-rag'];
    progress.quizScores['phase4-memory-rag'] = { score: 8, total: 10, criticalMisses: 1, date: '2026-07-26' };
    progress.notes['phase4-memory-rag'] = 'Keep this note and its evidence.';
    progress.labSteps['phase4-memory-rag'] = [true, null, true];
    progress.visitedSections['phase4-memory-rag'] = ['retrieval'];
    progress.lastVisited = 'phase4-memory-rag';
    manager.saveProgress(progress);
    const raw = values.get(manager.STORAGE_KEY);
    const exported = manager.createExport();

    assert.equal(exported.academyId, 'ai-mastery');
    assert.equal(exported.exportVersion, 1);
    assert.equal(exported.schemaVersion, 2);
    assert.ok(Number.isFinite(Date.parse(exported.exportedAt)));
    assert.equal(Object.hasOwn(exported, 'data'), false);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
    const target = loadProgressManager();
    await target.importProgress(progressFile(exported));
    assert.equal(JSON.stringify(target.getProgress()), JSON.stringify(manager.getProgress()));
});

test('exportProgress downloads the versioned payload without mutating storage', async () => {
    const values = new Map();
    let downloadedBlob;
    let clicks = 0;
    const anchor = { click() { clicks += 1; } };
    const manager = loadProgressManager({ values, globals: {
        document: { createElement: () => anchor },
        URL: { createObjectURL(blob) { downloadedBlob = blob; return 'blob:test'; }, revokeObjectURL() {} }
    } });
    manager.saveQuizScore('phase4-memory-rag', 8, 10, 1);
    const raw = values.get(manager.STORAGE_KEY);

    manager.exportProgress();

    const payload = JSON.parse(await downloadedBlob.text());
    assert.equal(payload.academyId, 'ai-mastery');
    assert.equal(payload.exportVersion, 1);
    assert.equal(payload.quizScores['phase4-memory-rag'].criticalMisses, 1);
    assert.match(anchor.download, /^ai-academy-progress-\d{4}-\d{2}-\d{2}\.json$/);
    assert.equal(clicks, 1);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
});

test('invalid imports leave stored and pending data untouched', async () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    const raw = values.get(manager.STORAGE_KEY);
    faults.key = manager.STORAGE_KEY;
    faults.failWrites = true;
    manager.completeLab('phase4-memory-rag');
    const pending = JSON.stringify(manager.getProgress());
    const empty = { completedModules: [], quizScores: {} };
    const envelope = { ...empty, academyId: 'ai-mastery', exportVersion: 1, exportedAt: '2026-09-14T10:00:00.000Z' };
    const invalid = [
        null, [], {}, { completedModules: {}, quizScores: {} },
        { completedModules: [], quizScores: null }, { completedModules: [], quizScores: [] },
        { ...envelope, academyId: 'azure-networking' },
        { ...empty, exportVersion: 1 },
        ...[0, -1, 1.5, 3, '2', null].map(schemaVersion => ({ ...empty, schemaVersion })),
        ...[undefined, 0, 2, '1', null].map(exportVersion => ({ ...envelope, exportVersion })),
        ...[undefined, null, 'invalid'].map(exportedAt => ({ ...envelope, exportedAt }))
    ];

    for (const data of invalid) {
        await assert.rejects(manager.importProgress(progressFile(data)), /format|academy|version|date/i);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
        assert.equal(JSON.stringify(manager.getProgress()), pending);
    }
    assert.equal(faults.rejectedWrites, 1);
});

test('bare legacy versions accept valid and empty progress', async () => {
    for (const schemaVersion of [undefined, 1, 2]) {
        for (const completedModules of [[], ['phase4-memory-rag']]) {
            const manager = loadProgressManager();
            const result = await manager.importProgress(progressFile({ schemaVersion, completedModules, quizScores: {} }));
            assert.equal(result.schemaVersion, 2);
            assert.deepEqual(Array.from(result.completedModules), completedModules);
        }
    }
});

test('legacy imports validate module IDs across evidence and navigation fields', async () => {
    const manager = loadProgressManager();
    const empty = { completedModules: [], quizScores: {} };
    const foreign = 'azure-dns';
    const invalid = [
        { completedModules: [foreign] }, { completedLabs: [foreign] }, { lastVisited: foreign },
        { quizScores: { [foreign]: { score: 8, total: 10 } } },
        ...['notes', 'labSteps', 'visitedSections', 'moduleMastery', 'practiceChecks', 'artifactPractice']
            .map(field => ({ [field]: { [foreign]: {} } })),
        { diagnostic: { recommendedModuleId: foreign } },
        { completedModules: ['module-a'] }, { completedModules: ['__proto__'] }
    ];

    for (const fields of invalid) {
        await assert.rejects(manager.importProgress(progressFile({ ...empty, ...fields })), /module|academy|format/i);
    }
    const catalog = loadProgressManager({ globals: { MODULES: [{ id: 'catalog-only-module' }] } });
    await catalog.importProgress(progressFile({ ...empty, completedModules: ['catalog-only-module'] }));
    await assert.rejects(catalog.importProgress(progressFile({ ...empty, completedModules: ['phase4-memory-rag'] })), /module|academy/i);
    await catalog.importProgress(progressFile(empty));
});

test('file validation rejects malformed, incompatible, and oversized input', async () => {
    const manager = loadProgressManager();
    const empty = { completedModules: [], quizScores: {} };
    assert.equal(manager.MAX_IMPORT_BYTES, 1024 * 1024);
    for (const file of [
        null,
        progressFile(empty, { name: 'progress.html' }),
        progressFile(empty, { type: 'text/html' }),
        progressFile(empty, { size: manager.MAX_IMPORT_BYTES + 1 }),
        progressFile(empty, { size: -1 }),
        progressFile(empty, { size: NaN }),
        progressFile('{broken json'),
        progressFile({ ...empty, notes: { 'phase4-memory-rag': 'x'.repeat(manager.MAX_IMPORT_BYTES) } }, { size: 1 })
    ]) {
        await assert.rejects(manager.importProgress(file));
    }
    await manager.importProgress(progressFile(empty, { name: 'BACKUP.JSON', type: '' }));
    await manager.importProgress(progressFile(empty, { name: undefined, type: undefined }));
});

test('corrupt and unsupported stored records block automatic writes and remain recoverable', () => {
    const invalid = ['', '{broken json', 'null', '[]', '{}',
        ...[0, 3, '2', null].map(schemaVersion => JSON.stringify({ schemaVersion, completedModules: [], quizScores: {} }))];
    for (const raw of invalid) {
        const values = new Map();
        const manager = loadProgressManager({ values });
        values.set(manager.STORAGE_KEY, raw);
        assert.equal(manager.getStorageStatus().saved, false);
        assert.equal(manager.getStorageStatus().recoveryRequired, true);
        assert.match(manager.getStorageStatus().message, /export.*(?:import|reset)/i);

        manager.setLastVisited('phase4-memory-rag');
        manager.saveQuizScore('phase4-memory-rag', 8, 10);

        assert.equal(manager.retrySave(), false);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
        assert.equal(manager.createExport().quizScores['phase4-memory-rag'].score, 8);
        assert.equal(manager.getStorageStatus().saved, false);
    }
});

test('saveProgress checks unreadable storage even before the first read', () => {
    const values = new Map();
    const manager = loadProgressManager({ values });
    values.set(manager.STORAGE_KEY, '{broken json');

    assert.equal(manager.saveProgress(manager.defaultProgress()), false);
    assert.equal(values.get(manager.STORAGE_KEY), '{broken json');
});

test('storage read errors cannot replace the previous record with default progress', () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    const raw = values.get(manager.STORAGE_KEY);
    faults.key = manager.STORAGE_KEY;
    faults.failReads = true;

    manager.completeLab('phase4-memory-rag');

    assert.equal(manager.getStorageStatus().saved, false);
    assert.match(manager.getStorageStatus().message, /read|access/i);
    assert.equal(manager.retrySave(), false);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
});

test('recovery export contains exact raw data and separately identified pending progress', async () => {
    const values = new Map();
    let downloadedBlob;
    const anchor = { click() {} };
    const manager = loadProgressManager({ values, globals: {
        document: { createElement: () => anchor },
        URL: { createObjectURL(blob) { downloadedBlob = blob; return 'blob:test'; }, revokeObjectURL() {} }
    } });
    const raw = '{unreadable: "<script>do not execute</script>"';
    values.set(manager.STORAGE_KEY, raw);
    manager.saveQuizScore('phase4-memory-rag', 8, 10);

    manager.exportProgress();

    const recovery = JSON.parse(await downloadedBlob.text());
    assert.equal(recovery.rawProgress, raw);
    assert.equal(recovery.recoveryVersion, 1);
    assert.equal(recovery.academyId, 'ai-mastery');
    assert.equal(recovery.pendingProgress.quizScores['phase4-memory-rag'].score, 8);
    assert.equal(recovery.pendingProgress.exportVersion, 1);
    assert.match(anchor.download, /recovery.*\.json$/);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
    await assert.rejects(manager.importProgress(progressFile(recovery)), /format|recovery/i);
});

test('only a successful explicit import clears a recovery block', async () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    const raw = '{broken json';
    values.set(manager.STORAGE_KEY, raw);
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    const pending = JSON.stringify(manager.getProgress());
    faults.key = manager.STORAGE_KEY;
    faults.failWrites = true;

    await assert.rejects(manager.importProgress(progressFile({ completedModules: [], quizScores: {} })), /save|storage/i);
    assert.equal(faults.rejectedWrites, 1);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
    assert.equal(JSON.stringify(manager.getProgress()), pending);
    assert.equal(manager.getStorageStatus().recoveryRequired, true);
    faults.failWrites = false;
    await manager.importProgress(progressFile({ completedModules: ['phase4-memory-rag'], quizScores: {} }));
    assert.equal(manager.getStorageStatus().saved, true);
    assert.equal(manager.getStorageStatus().recoveryRequired, false);
    assert.deepEqual(Array.from(manager.getProgress().completedModules), ['phase4-memory-rag']);
    assert.equal(manager.retrySave(), true);
});

test('reset clears pending work only after storage deletion is confirmed', () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    const raw = values.get(manager.STORAGE_KEY);
    faults.key = manager.STORAGE_KEY;
    faults.failWrites = true;
    manager.completeLab('phase4-memory-rag');
    const pending = JSON.stringify(manager.getProgress());
    faults.failDeletes = true;

    assert.equal(manager.resetAll(), false);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
    assert.equal(JSON.stringify(manager.getProgress()), pending);
    assert.equal(manager.getStorageStatus().saved, false);
    faults.failDeletes = false;
    faults.ignoreDeletes = true;
    assert.equal(manager.resetAll(), false);
    assert.equal(JSON.stringify(manager.getProgress()), pending);
    faults.ignoreDeletes = false;
    assert.equal(manager.resetAll(), true);
    assert.equal(values.has(manager.STORAGE_KEY), false);
    assert.equal(manager.getProgress().completedLabs.length, 0);
    assert.equal(Object.keys(manager.getProgress().quizScores).length, 0);
    assert.equal(manager.getStorageStatus().saved, true);
});

test('explicit reset releases corrupted storage without resurrecting pending work', () => {
    const values = new Map();
    const manager = loadProgressManager({ values });
    values.set(manager.STORAGE_KEY, '{broken json');
    manager.saveQuizScore('phase4-memory-rag', 8, 10);

    assert.equal(manager.resetAll(), true);
    assert.equal(manager.getStorageStatus().recoveryRequired, false);
    assert.equal(manager.retrySave(), true);
    assert.equal(Object.keys(manager.getProgress().quizScores).length, 0);
});

test('storage events never expose a rejected import or log success on failure', async () => {
    const events = [];
    const messages = [];
    const faults = {};
    let manager;
    manager = loadProgressManager({ faults, globals: {
        console: { log: (...args) => messages.push(args), info: (...args) => messages.push(args), error() {} },
        CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } },
        document: { dispatchEvent(event) { events.push({ ...event, progress: JSON.stringify(manager.getProgress()) }); } }
    } });
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    faults.key = manager.STORAGE_KEY;
    faults.failWrites = true;
    const before = JSON.stringify(manager.getProgress());

    await assert.rejects(manager.importProgress(progressFile(manager.defaultProgress())), /save|storage/i);

    const failure = events.at(-1);
    assert.equal(failure.type, 'academy-storage-change');
    assert.equal(failure.detail.saved, false);
    assert.equal(failure.progress, before);
    assert.equal(messages.length, 0);
    faults.failWrites = false;
    assert.equal(manager.retrySave(), true);
    assert.equal(events.at(-1).detail.saved, true);
});

test('formative practice records attempts without awarding quiz or mastery evidence', async () => {
    const manager = loadProgressManager();
    assert.equal(manager.savePracticeResult('phase4-memory-rag', false), true);
    assert.equal(manager.savePracticeResult('phase4-memory-rag', true), true);
    const progress = manager.getProgress();
    const practice = progress.practiceChecks['phase4-memory-rag'];

    assert.equal(practice.passed, true);
    assert.equal(practice.attempts, 2);
    assert.ok(Number.isFinite(Date.parse(practice.completedAt)));
    assert.equal(Object.keys(progress.quizScores).length, 0);
    assert.equal(Object.keys(progress.moduleMastery).length, 0);
    assert.equal(progress.completedModules.length, 0);
    assert.equal(manager.getMasteryStatus('phase4-memory-rag', { quiz: true, lab: true, transfer: true }).state, 'not_started');
    const target = loadProgressManager();
    await target.importProgress(progressFile(manager.createExport()));
    assert.equal(JSON.stringify(target.getProgress().practiceChecks), JSON.stringify(progress.practiceChecks));
});

test('artifact practice is self-attested lab evidence and never completes an external lab', async () => {
    const manager = loadProgressManager();
    const requirements = { quiz: true, lab: true, transfer: true };
    const evidence = 'I predicted the retrieval result, checked a local fixture, and explained the discrepancy.';
    assert.equal(manager.saveArtifactPractice('phase4-memory-rag', `  ${evidence}  `), true);
    assert.equal(manager.getMasteryStatus('phase4-memory-rag', requirements).state, 'not_started');
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    const status = manager.getMasteryStatus('phase4-memory-rag', requirements);

    assert.equal(status.state, 'practiced');
    assert.equal(status.labPassed, true);
    assert.equal(status.labProvenance, 'self-attested');
    assert.equal(status.entry.lab.completed, false);
    assert.equal(manager.getProgress().completedLabs.length, 0);
    assert.equal(manager.getStats().labsCompleted, 0);
    assert.equal(manager.getProgress().artifactPractice['phase4-memory-rag'].evidence, evidence);
    const target = loadProgressManager();
    await target.importProgress(progressFile(manager.createExport()));
    assert.equal(JSON.stringify(target.getProgress().artifactPractice), JSON.stringify(manager.getProgress().artifactPractice));
    assert.equal(target.getMasteryStatus('phase4-memory-rag', requirements).labProvenance, 'self-attested');
});

test('artifact validation rejects short evidence and reports quota failure honestly', () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    manager.saveProgress(manager.defaultProgress());
    const raw = values.get(manager.STORAGE_KEY);
    for (const evidence of ['', ' '.repeat(50), 'x'.repeat(39), null, 42, { evidence: 'x'.repeat(40) }]) {
        assert.equal(manager.saveArtifactPractice('phase4-memory-rag', evidence), false);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
    }
    assert.equal(manager.saveArtifactPractice('phase4-memory-rag', 'x'.repeat(40)), true);
    const saved = values.get(manager.STORAGE_KEY);
    faults.key = manager.STORAGE_KEY;
    faults.failWrites = true;

    assert.equal(manager.saveArtifactPractice('phase4-memory-rag', '  ' + 'y'.repeat(5000) + '  '), false);
    assert.equal(faults.rejectedWrites, 1);
    assert.equal(values.get(manager.STORAGE_KEY), saved);
    assert.equal(manager.getStorageStatus().saved, false);
    assert.equal(manager.getProgress().artifactPractice['phase4-memory-rag'].evidence.length, 4000);
    faults.failWrites = false;
    assert.equal(manager.retrySave(), true);
});

test('practice normalization requires usable artifacts and integer attempt counts', () => {
    const manager = loadProgressManager();
    const progress = manager.normalizeProgress({
        practiceChecks: { prediction: { passed: 'false', attempts: -3.5 }, repeated: { passed: true, attempts: 2.9 } },
        artifactPractice: {
            short: { evidence: 'x'.repeat(39) },
            blank: { evidence: ' '.repeat(50) },
            invalid: { evidence: 5000 },
            valid: { evidence: '  ' + 'x'.repeat(5000) + '  ', completedAt: '2026-09-14T10:00:00.000Z' }
        }
    });

    assert.equal(progress.practiceChecks.prediction.passed, false);
    assert.equal(progress.practiceChecks.prediction.attempts, 1);
    assert.equal(progress.practiceChecks.repeated.attempts, 2);
    assert.deepEqual(Object.keys(progress.artifactPractice), ['valid']);
    assert.equal(progress.artifactPractice.valid.evidence.length, 4000);
    manager.saveProgress({ ...manager.defaultProgress(), artifactPractice: { 'phase4-memory-rag': { evidence: 'short' } } });
    assert.equal(manager.getMasteryStatus('phase4-memory-rag', { lab: true }).labPassed, false);
});

test('transfer provenance defaults to self-assessed and legacy evidence stays identifiable', () => {
    const manager = loadProgressManager();
    const reflection = 'Named a reviewer in the reflection without supplying reviewer metadata.';
    manager.saveTransferResult('phase4-memory-rag', 3, 4, reflection, [3, 3, 3, 3]);
    const transfer = manager.getProgress().moduleMastery['phase4-memory-rag'].transfer;
    assert.equal(transfer.provenance, 'self-assessed');
    assert.equal(Object.hasOwn(transfer, 'reviewer'), false);
    const legacy = manager.normalizeMasteryEntry({ transfer: { score: 3, max: 4, reflection, scores: [3, 3, 3, 3] } });
    assert.equal(legacy.transfer.provenance, 'legacy-self-assessed');
    assert.equal(legacy.transfer.reflection, reflection);
});

test('separately supplied reviewer metadata survives export without certifying identity', async () => {
    const manager = loadProgressManager();
    const reflection = 'Compared an independent artifact to each rubric criterion.';
    manager.saveTransferResult('phase4-memory-rag', 3, 4, reflection, [3, 3, 3, 3], undefined,
        { provenance: 'reviewer-assessed', reviewer: '  Jo  ' });
    const transfer = manager.getProgress().moduleMastery['phase4-memory-rag'].transfer;
    assert.equal(transfer.provenance, 'reviewer-assessed');
    assert.equal(transfer.reviewer, 'Jo');
    assert.equal(Object.hasOwn(transfer, 'verified'), false);
    const target = loadProgressManager();
    await target.importProgress(progressFile(manager.createExport()));
    assert.equal(JSON.stringify(target.getProgress().moduleMastery['phase4-memory-rag'].transfer), JSON.stringify(transfer));
    manager.saveTransferResult('phase4-memory-rag', 4, 4, reflection, [], { provenance: 'reviewer-assessed', reviewer: 'A'.repeat(100) });
    assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].transfer.reviewer.length, 100);
});

test('invalid reviewer metadata cannot replace evidence or claim automatic verification', () => {
    const values = new Map();
    const manager = loadProgressManager({ values });
    const reflection = 'An independent artifact with enough evidence to review.';
    manager.saveTransferResult('phase4-memory-rag', 3, 4, reflection);
    const raw = values.get(manager.STORAGE_KEY);
    const invalid = [
        { provenance: 'automatically-verified' }, { provenance: 'unknown' },
        ...[undefined, '', ' A ', 42, 'A'.repeat(101)].map(reviewer => ({ provenance: 'reviewer-assessed', reviewer }))
    ];
    for (const metadata of invalid) {
        assert.equal(manager.saveTransferResult('phase4-memory-rag', 4, 4, reflection, [], undefined, metadata), false);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
    }
    for (const metadata of invalid) {
        const entry = manager.normalizeMasteryEntry({ transfer: { score: 3, max: 4, reflection, ...metadata } });
        assert.equal(entry.transfer.provenance, 'legacy-self-assessed');
        assert.equal(entry.transfer.reflection, reflection);
        assert.equal(Object.hasOwn(entry.transfer, 'reviewer'), false);
    }
});

test('invalid quiz and transfer numbers never become passing evidence', () => {
    const values = new Map();
    const manager = loadProgressManager({ values });
    const reflection = 'An independent artifact with enough evidence to review.';
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    manager.saveTransferResult('phase4-memory-rag', 3, 4, reflection);
    const raw = values.get(manager.STORAGE_KEY);
    for (const [score, total] of [[-1, 10], [11, 10], [0, 0], [1, -1], [NaN, 10], [Infinity, 10], [1, Infinity]]) {
        assert.equal(manager.saveQuizScore('phase4-memory-rag', score, total), false);
        assert.equal(manager.saveTransferResult('phase4-memory-rag', score, total, reflection), false);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
        const normalized = manager.normalizeProgress({
            quizScores: { invalid: { score, total } },
            moduleMastery: { invalid: { quiz: { firstScore: score, latestScore: score, total }, transfer: { score, max: total, reflection } } }
        });
        assert.equal(Object.keys(normalized.quizScores).length, 0);
        assert.equal(normalized.moduleMastery.invalid.quiz, null);
        assert.equal(normalized.moduleMastery.invalid.transfer, null);
    }
});

test('quiz statistics require eighty percent and no critical misses', () => {
    const manager = loadProgressManager();
    manager.saveQuizScore('phase4-memory-rag', 8, 10);
    manager.saveQuizScore('phase5-tool-use', 7, 10);
    manager.saveQuizScore('phase6-agents', 10, 10, 1);

    assert.equal(manager.getStats().quizzesPassed, 1);
});

test('the first quiz schedules one day ahead and later quiz attempts keep that due window', () => {
    const clock = { now: '2026-07-26T10:00:00.000Z' };
    class ClockDate extends Date {
        constructor(...args) { super(...(args.length ? args : [clock.now])); }
        static now() { return Date.parse(clock.now); }
    }
    const manager = loadProgressManager({ globals: { Date: ClockDate } });
    manager.saveQuizScore('phase4-memory-rag', 9, 10);
    manager.saveTransferResult('phase4-memory-rag', 4, 4, 'Independent artifact with test evidence.');
    assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].review.nextDue, '2026-07-27T10:00:00.000Z');
    clock.now = '2026-07-27T10:00:00.000Z';
    manager.saveQuizScore('phase4-memory-rag', 5, 10);
    assert.equal(manager.isReviewDue('phase4-memory-rag'), true);
    manager.recordReview('phase4-memory-rag', false);
    assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].review.nextDue, '2026-07-28T10:00:00.000Z');
});

test('early reviews cannot create scheduled credit or mutate progress', () => {
    const values = new Map();
    const manager = loadProgressManager({ values });
    seedDueReview(manager);
    const raw = values.get(manager.STORAGE_KEY);

    assert.equal(manager.recordReview('phase4-memory-rag', true, '2026-07-27T09:59:59.999Z'), false);
    assert.equal(manager.recordReview('phase4-memory-rag', false, '2026-07-27T09:59:59.999Z'), false);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
});

test('failed due reviews reset the interval and keep all previous history and artifacts', async () => {
    const manager = loadProgressManager();
    seedDueReview(manager);
    manager.saveArtifactPractice('phase4-memory-rag', 'I checked a local fixture and explained the expected failure mode with evidence.');
    const progress = manager.getProgress();
    const review = progress.moduleMastery['phase4-memory-rag'].review;
    review.successfulReviews = 2;
    review.intervalIndex = 2;
    review.attempts = Array.from({ length: 25 }, (_, index) => ({ passed: index % 2 === 0, reviewedAt: `2026-06-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`, evidence: `Historical note ${index}` }));
    const history = JSON.stringify(review.attempts);
    const transfer = JSON.stringify(progress.moduleMastery['phase4-memory-rag'].transfer);
    const artifact = JSON.stringify(progress.artifactPractice);
    manager.saveProgress(progress);

    manager.recordReview('phase4-memory-rag', false, '2026-07-27T10:00:00.000Z');

    const result = manager.getProgress();
    const recorded = result.moduleMastery['phase4-memory-rag'].review;
    assert.equal(recorded.attempts.length, 26);
    assert.equal(JSON.stringify(recorded.attempts.slice(0, 25)), history);
    assert.equal(recorded.attempts.at(-1).passed, false);
    assert.equal(recorded.attempts.at(-1).dueAt, '2026-07-27T10:00:00.000Z');
    assert.equal(recorded.successfulReviews, 2);
    assert.equal(recorded.intervalIndex, 0);
    assert.equal(recorded.nextDue, '2026-07-28T10:00:00.000Z');
    assert.equal(JSON.stringify(result.moduleMastery['phase4-memory-rag'].transfer), transfer);
    assert.equal(JSON.stringify(result.artifactPractice), artifact);
    const target = loadProgressManager();
    await target.importProgress(progressFile(manager.createExport()));
    assert.equal(JSON.stringify(target.getProgress().moduleMastery['phase4-memory-rag'].review), JSON.stringify(recorded));
});

test('duplicate results cannot change a consumed due window', () => {
    for (const passed of [true, false]) {
        const values = new Map();
        const manager = loadProgressManager({ values });
        seedDueReview(manager);
        manager.recordReview('phase4-memory-rag', passed, '2026-07-27T10:00:00.000Z');
        const raw = values.get(manager.STORAGE_KEY);

        assert.equal(manager.recordReview('phase4-memory-rag', true, '2026-07-27T10:00:00.000Z'), false);
        assert.equal(manager.recordReview('phase4-memory-rag', false, '2026-07-27T11:00:00.000Z'), false);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
        const review = manager.getProgress().moduleMastery['phase4-memory-rag'].review;
        assert.equal(review.attempts.length, 1);
        assert.equal(review.successfulReviews, passed ? 1 : 0);
        assert.equal(review.nextDue, passed ? '2026-07-30T10:00:00.000Z' : '2026-07-28T10:00:00.000Z');
    }
});

test('reviews require a valid transfer and an existing valid due schedule', () => {
    for (const variant of ['missing-entry', 'missing-transfer', 'low-score', 'short-evidence', 'missing-due', 'invalid-due']) {
        const values = new Map();
        const manager = loadProgressManager({ values });
        seedDueReview(manager);
        const progress = manager.getProgress();
        const entry = progress.moduleMastery['phase4-memory-rag'];
        if (variant === 'missing-entry') delete progress.moduleMastery['phase4-memory-rag'];
        if (variant === 'missing-transfer') entry.transfer = null;
        if (variant === 'low-score') entry.transfer.score = 2;
        if (variant === 'short-evidence') entry.transfer.reflection = ' '.repeat(30);
        if (variant === 'missing-due') entry.review.nextDue = null;
        if (variant === 'invalid-due') entry.review.nextDue = '2026-02-30T10:00:00.000Z';
        manager.saveProgress(progress);
        const raw = values.get(manager.STORAGE_KEY);

        assert.equal(manager.isReviewDue('phase4-memory-rag', '2026-07-27T10:00:00.000Z'), false, variant);
        assert.equal(manager.recordReview('phase4-memory-rag', true, '2026-07-27T10:00:00.000Z'), false, variant);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
    }
});

test('invalid review timestamps and nonboolean results are rejected without writes', () => {
    const values = new Map();
    const manager = loadProgressManager({ values });
    seedDueReview(manager);
    const raw = values.get(manager.STORAGE_KEY);
    for (const reviewedAt of ['', null, 0, {}, 'invalid', '2026-02-30T10:00:00.000Z', '2026-13-14T10:00:00.000Z']) {
        assert.equal(manager.recordReview('phase4-memory-rag', true, reviewedAt), false);
        assert.deepEqual(Array.from(manager.getDueReviews(reviewedAt)), []);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
    }
    for (const passed of ['true', 1, null]) {
        assert.equal(manager.recordReview('phase4-memory-rag', passed, '2026-07-27T10:00:00.000Z'), false);
        assert.equal(values.get(manager.STORAGE_KEY), raw);
    }
});

test('an imported consumed due window cannot earn duplicate credit', () => {
    const manager = loadProgressManager();
    seedDueReview(manager);
    const progress = manager.getProgress();
    progress.moduleMastery['phase4-memory-rag'].review.attempts = [{ passed: true, reviewedAt: '2026-07-27T10:00:00.000Z', dueAt: '2026-07-27T10:00:00.000Z' }];
    manager.saveProgress(progress);

    assert.equal(manager.recordReview('phase4-memory-rag', true, '2026-07-28T10:00:00.000Z'), false);
    assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].review.attempts.length, 1);
});

test('failed review saves stay pending and retry without adding another attempt', () => {
    const values = new Map();
    const faults = {};
    const manager = loadProgressManager({ values, faults });
    seedDueReview(manager);
    const raw = values.get(manager.STORAGE_KEY);
    faults.key = manager.STORAGE_KEY;
    faults.failWrites = true;
    manager.recordReview('phase4-memory-rag', false, '2026-07-27T10:00:00.000Z');
    assert.equal(faults.rejectedWrites, 1);
    assert.equal(values.get(manager.STORAGE_KEY), raw);
    assert.equal(manager.getStorageStatus().saved, false);
    assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].review.attempts.length, 1);
    assert.equal(manager.recordReview('phase4-memory-rag', true, '2026-07-27T10:00:00.000Z'), false);
    faults.failWrites = false;
    assert.equal(manager.retrySave(), true);
    assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].review.attempts.length, 1);
});

test('malformed nested records cannot replace existing progress', async () => {
    const invalid = [
        { quizScores: { 'phase4-memory-rag': [] } },
        { moduleMastery: { 'phase4-memory-rag': null } },
        { moduleMastery: { 'phase4-memory-rag': { transfer: [] } } },
        { moduleMastery: { 'phase4-memory-rag': { review: { attempts: {} } } } },
        { labSteps: { 'phase4-memory-rag': {} } },
        { visitedSections: { 'phase4-memory-rag': {} } },
        { practiceChecks: { 'phase4-memory-rag': null } },
        { artifactPractice: { 'phase4-memory-rag': [] } }
    ];
    for (const fields of invalid) {
        const values = new Map();
        const manager = loadProgressManager({ values });
        manager.saveQuizScore('phase4-memory-rag', 8, 10);
        const previous = values.get(manager.STORAGE_KEY);
        const data = { ...manager.defaultProgress(), ...fields };
        await assert.rejects(manager.importProgress(progressFile(data)), /format/i);
        assert.equal(values.get(manager.STORAGE_KEY), previous);
        const corrupt = JSON.stringify(data);
        values.set(manager.STORAGE_KEY, corrupt);
        manager.setLastVisited('phase4-memory-rag');
        assert.equal(manager.getStorageStatus().recoveryRequired, true);
        assert.equal(values.get(manager.STORAGE_KEY), corrupt);
    }
});

test('versioned exports require an explicit supported progress schema', async () => {
    const manager = loadProgressManager();
    const exported = manager.createExport();
    delete exported.schemaVersion;

    await assert.rejects(manager.importProgress(progressFile(exported)), /schema|version/i);
});

test('malformed critical-miss counts cannot normalize into a passing quiz', () => {
    for (const criticalMisses of [-1, 0.5, Infinity, NaN, null, 'invalid']) {
        const manager = loadProgressManager();
        manager.saveQuizScore('phase4-memory-rag', 10, 10, criticalMisses);

        assert.equal(manager.getStats().quizzesPassed, 0);
        assert.equal(manager.getMasteryStatus('phase4-memory-rag', { quiz: true }).quizPassed, false);
    }
});

test('legacy six-argument transfer calls remain compatible', () => {
    const manager = loadProgressManager();
    for (const legacyArgument of [null, false, '2026-07-26T10:00:00.000Z']) {
        const result = manager.saveTransferResult('phase4-memory-rag', 3, 4, 'Independent artifact with test evidence.', [3, 3, 3, 3], legacyArgument);
        assert.ok(result);
        assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].transfer.provenance, 'self-assessed');
    }
    manager.saveTransferResult('phase4-memory-rag', 3, 4, 'Independent artifact with test evidence.', [3, 3, 3, 3], false,
        { provenance: 'reviewer-assessed', reviewer: 'Jo' });
    assert.equal(manager.getProgress().moduleMastery['phase4-memory-rag'].transfer.reviewer, 'Jo');
});
