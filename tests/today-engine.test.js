const assert = require('node:assert/strict');
const test = require('node:test');

const TodayEngine = require('../js/today-engine.js');

const modules = [
    { id: 'foundations', title: 'Foundations', estimatedTime: '20 min', lab: { steps: [{}, {}] } },
    { id: 'systems', title: 'Systems', estimatedTime: '30 min', lab: { steps: [{}, {}, {}] } },
    { id: 'capstone', title: 'Capstone', estimatedTime: '1 hour' }
];
const metadata = {
    foundations: { prerequisites: [] },
    systems: { prerequisites: ['foundations'] },
    capstone: { prerequisites: ['systems'] }
};

const state = overrides => ({
    modules,
    metadata,
    statuses: {
        foundations: { state: 'not_started', missing: ['quiz', 'lab'] },
        systems: { state: 'not_started', missing: ['quiz', 'lab'] },
        capstone: { state: 'not_started', missing: ['quiz'] }
    },
    progress: { diagnostic: null, lastVisited: null, labSteps: {}, moduleMastery: {} },
    uiState: { lastModuleId: null, lastSectionByModule: {}, lastTabByModule: {}, lastTouchedAtByModule: {} },
    activityIds: [],
    now: '2026-07-29T12:00:00.000Z',
    ...overrides
});

test('new learners receive the diagnostic as the only primary action', () => {
    const result = TodayEngine.select(state());
    assert.equal(result.primary.kind, 'diagnostic');
    assert.equal(result.primary.actionLabel, 'Start diagnostic');
});

test('an unfinished active lab beats an overdue review', () => {
    const result = TodayEngine.select(state({
        progress: {
            diagnostic: { recommendedModuleId: 'foundations' },
            lastVisited: 'systems',
            labSteps: { systems: [true, null, null] },
            moduleMastery: { foundations: { review: { nextDue: '2026-07-20T12:00:00.000Z' }, transfer: { score: 3, max: 4 } } }
        },
        uiState: { lastModuleId: 'systems', lastSectionByModule: {}, lastTabByModule: { systems: 'lab' }, lastTouchedAtByModule: { systems: '2026-07-29T11:00:00.000Z' } }
    }));
    assert.equal(result.primary.kind, 'active_lab');
    assert.equal(result.primary.moduleId, 'systems');
    assert.equal(result.alsoDue[0].moduleId, 'foundations');
});

test('overdue reviews sort by due date then curriculum order', () => {
    const result = TodayEngine.select(state({
        progress: {
            diagnostic: { recommendedModuleId: 'foundations' },
            lastVisited: null,
            labSteps: {},
            moduleMastery: {
                foundations: { review: { nextDue: '2026-07-21T12:00:00.000Z' }, transfer: { score: 3, max: 4 } },
                systems: { review: { nextDue: '2026-07-20T12:00:00.000Z' }, transfer: { score: 3, max: 4 } }
            }
        }
    }));
    assert.equal(result.primary.kind, 'overdue_review');
    assert.equal(result.primary.moduleId, 'systems');
    assert.equal(result.alsoDue[0].moduleId, 'foundations');
});

test('a review due today beats an active lesson and preserves the resume section', () => {
    const result = TodayEngine.select(state({
        progress: {
            diagnostic: { recommendedModuleId: 'foundations' },
            lastVisited: 'systems',
            labSteps: {},
            moduleMastery: { foundations: { review: { nextDue: '2026-07-29T18:00:00.000Z' }, transfer: { score: 3, max: 4 } } }
        },
        uiState: { lastModuleId: 'systems', lastSectionByModule: { systems: 'retrieval' }, lastTabByModule: { systems: 'learn' }, lastTouchedAtByModule: { systems: '2026-07-29T11:00:00.000Z' } }
    }));
    assert.equal(result.primary.kind, 'review_due_today');
    assert.equal(result.primary.moduleId, 'foundations');
    assert.equal(result.alsoDue[0].sectionId, 'retrieval');
});

test('the next module requires learned prerequisites', () => {
    const result = TodayEngine.select(state({
        progress: { diagnostic: { recommendedModuleId: 'systems' }, lastVisited: null, labSteps: {}, moduleMastery: {} },
        statuses: {
            foundations: { state: 'learned', missing: ['lab'] },
            systems: { state: 'not_started', missing: ['quiz', 'lab'] },
            capstone: { state: 'not_started', missing: ['quiz'] }
        }
    }));
    assert.equal(result.primary.kind, 'diagnostic_recommendation');
    assert.equal(result.primary.moduleId, 'systems');
    assert.deepEqual(result.milestones.map(item => item.moduleId), ['systems', 'capstone']);
});