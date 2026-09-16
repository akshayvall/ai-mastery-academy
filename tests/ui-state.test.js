const assert = require('node:assert/strict');
const test = require('node:test');

const UIStateManager = require('../js/ui-state.js');

const makeStorage = initial => {
    const values = new Map(initial ? [[UIStateManager.STORAGE_KEY, initial]] : []);
    return {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key)
    };
};

test('path, session length, mode, and bounded drafts survive reload', () => {
    global.localStorage = makeStorage();
    UIStateManager.setPreferences({ activePath: 'ai-building', sessionMinutes: 10 });
    UIStateManager.saveMode('phase4-memory-rag', 'browse');
    UIStateManager.saveDraft('phase4-memory-rag', { artifact: 'case analysis', reflection: 'x'.repeat(5000) });
    UIStateManager.saveDraft('phase4-memory-rag', { artifact: 'updated analysis' });
    const stored = UIStateManager.get(['phase4-memory-rag']);
    assert.equal(stored.activePath, 'ai-building');
    assert.equal(stored.sessionMinutes, 10);
    assert.equal(stored.moduleModeByModule['phase4-memory-rag'], 'browse');
    assert.equal(stored.drafts['phase4-memory-rag'].artifact, 'updated analysis');
    assert.equal(stored.drafts['phase4-memory-rag'].reflection.length, 4000);
});

test('failed draft writes return false and invalid session choices normalize safely', () => {
    global.localStorage = { ...makeStorage(), setItem() { throw new Error('quota'); } };
    assert.equal(UIStateManager.saveDraft('phase4-memory-rag', { artifact: 'pending draft' }), false);
    assert.equal(UIStateManager.normalize({ version: 1, sessionMinutes: -30 }).sessionMinutes, 25);
});

test('UI state uses a separate versioned academy key', () => {
    assert.equal(UIStateManager.STORAGE_KEY, 'ai-academy-ui-state:v1');
    assert.equal(UIStateManager.defaultState().version, 1);
});

test('corrupt or unknown state falls back without touching mastery progress', () => {
    global.localStorage = makeStorage('{bad json');
    assert.deepEqual(UIStateManager.get(['phase4-memory-rag']), UIStateManager.defaultState());

    global.localStorage = makeStorage(JSON.stringify({ version: 99, lastModuleId: 'bad-id' }));
    assert.deepEqual(UIStateManager.get(['phase4-memory-rag']), UIStateManager.defaultState());
});

test('module, tab, and exact section survive normalized persistence', () => {
    global.localStorage = makeStorage();
    UIStateManager.touchModule('phase4-memory-rag', 'lab', '2026-07-29T10:00:00.000Z');
    UIStateManager.saveSection('phase4-memory-rag', 'chunking-strategies', '2026-07-29T10:00:00.000Z');
    const saved = UIStateManager.get(['phase4-memory-rag']);

    assert.equal(saved.lastModuleId, 'phase4-memory-rag');
    assert.equal(saved.lastTabByModule['phase4-memory-rag'], 'lab');
    assert.equal(saved.lastSectionByModule['phase4-memory-rag'], 'chunking-strategies');
    assert.equal(saved.lastTouchedAtByModule['phase4-memory-rag'], '2026-07-29T10:00:00.000Z');
});