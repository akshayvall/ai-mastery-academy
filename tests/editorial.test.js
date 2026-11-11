const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('local review notes never turn an overdue published claim into a current fact', () => {
    const file = path.join(__dirname, '..', 'js', 'editorial-engine.js');
    assert.ok(fs.existsSync(file), 'Editorial queue must exist');
    const engine = require(file);
    const sources = [{ id: 'models', due: '2026-10-14', owner: 'Maintainer', verification: 'source-reviewed' }];
    const queue = engine.queue(sources, { models: { reviewed: '2026-11-11', decision: 'reviewed', notes: 'Local note' } }, '2026-11-11');
    assert.equal(queue[0].status, 'overdue');
    assert.equal(queue[0].localReview.decision, 'reviewed');
    assert.equal(queue[0].verification, 'source-reviewed');
});

test('queue prioritizes blockers and overdue claims without claiming external execution', () => {
    const file = path.join(__dirname, '..', 'js', 'editorial-engine.js');
    assert.ok(fs.existsSync(file));
    const engine = require(file);
    const queue = engine.queue([
        { id: 'next', due: '2026-12-01', verification: 'source-reviewed' },
        { id: 'old', due: '2026-10-01', verification: 'source-reviewed' },
        { id: 'blocked', due: '2026-12-01', blocked: true, verification: 'source-unmodified' }
    ], {}, '2026-11-11');
    assert.deepEqual(queue.map(item => item.status), ['blocked', 'overdue', 'scheduled']);
    assert.ok(queue.every(item => !item.verification.includes('provider-executed')));
});
