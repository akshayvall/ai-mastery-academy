const assert = require('node:assert/strict');
const test = require('node:test');

test('contract validation catches valid JSON with an invented category or missing ticket', () => {
    const { validate } = require('./contract');
    const tickets = [{ id: 'T1' }, { id: 'T2' }];
    assert.deepEqual(validate(tickets, [
        { ticket_id: 'T1', category: 'access', needs_clarification: false },
        { ticket_id: 'T2', category: 'unknown', needs_clarification: true }
    ]), []);
    assert.ok(validate(tickets, [{ ticket_id: 'T1', category: 'urgent', needs_clarification: false }]).length >= 2);
    assert.ok(validate(tickets, [
        { ticket_id: 'T1', category: 'access', needs_clarification: false },
        { ticket_id: 'T1', category: 'access', needs_clarification: false }
    ]).some(error => error.includes('duplicate')));
    assert.ok(validate(tickets, 'not an array').length);
});

test('mock client retries only transient failures with bounded attempts and validates envelopes', async () => {
    const { classify } = require('./mock-client');
    let calls = 0;
    const delays = [];
    const result = await classify(async () => ++calls === 1 ?
        { status: 429, retryAfterMs: 20 } : { status: 200, body: '{"category":"access"}' },
    { wait: async delay => delays.push(delay), maxAttempts: 2 });
    assert.equal(result.category, 'access');
    assert.equal(calls, 2);
    assert.deepEqual(delays, [20]);
    calls = 0;
    await assert.rejects(classify(async () => { calls++; return { status: 401 }; }), /authentication/);
    assert.equal(calls, 1);
    await assert.rejects(classify(async () => ({ status: 200, body: 'invalid' })), /Malformed/);
    await assert.rejects(classify(async () => ({ status: 200, body: '{"category":"invented"}' })), /category/);
    calls = 0;
    await assert.rejects(classify(async () => { calls++; return { status: 503 }; },
        { maxAttempts: 2, wait: async () => {} }), /exhausted/);
    assert.equal(calls, 2);
});

test('retrieval diagnoses missing versus ignored evidence and filters access before ranking', () => {
    const { retrieve, diagnose } = require('./retrieval');
    const docs = [
        { id: 'hours', text: 'Library hours are 9 to 5', audience: 'public' },
        { id: 'policy', text: 'Library loan period is 14 days', audience: 'public' },
        { id: 'secret', text: 'Library loan internal exception', audience: 'staff' }
    ];
    const found = retrieve('library loan', docs, 'public', 1);
    assert.equal(found[0].id, 'policy');
    assert.equal(diagnose(['hours'], ['policy'], true), 'retrieval');
    assert.equal(diagnose(['policy'], ['policy'], false), 'generation');
    assert.equal(diagnose(['policy'], ['policy'], true), 'supported');
    assert.deepEqual(retrieve('nonexistent term', docs, 'public'), []);
    assert.ok(!retrieve('library loan', docs, 'public', 10).some(doc => doc.id === 'secret'));
});

test('bounded write requires a matching approval and an idempotency key before any side effect', () => {
    const { createTool } = require('./bounded-tool');
    const tool = createTool();
    assert.throws(() => tool.write({ recordId: 'T1', text: 'draft', key: 'one' }, null), /approval/);
    assert.equal(tool.records.size, 0);
    const approval = { recordId: 'T1', action: 'save-draft' };
    assert.throws(() => tool.write({ recordId: 'T2', text: 'draft', key: 'one' }, approval), /approval/);
    assert.throws(() => tool.write({ recordId: 'T1', text: 'draft' }, approval), /idempotency/);
    const input = { recordId: 'T1', text: 'draft', key: 'one' };
    tool.write(input, approval);
    assert.equal(tool.write(input, approval).replayed, true);
    assert.equal(tool.records.size, 1);
    assert.throws(() => tool.write({ ...input, text: 'different' }, approval), /conflict/);
    assert.throws(() => tool.write({ ...input, recordId: '../private' }, approval), /record/);
});

test('evaluation catches a planted regression and reports a critical miss by slice', () => {
    const { evaluate } = require('./evaluation');
    const cases = [
        { id: 'a', slice: 'normal', expected: 'access' },
        { id: 'b', slice: 'ambiguous', expected: 'unknown', critical: true }
    ];
    assert.equal(evaluate(cases, { a: 'access', b: 'unknown' }).passed, true);
    const broken = evaluate(cases, { a: 'access', b: 'access' });
    assert.equal(broken.passed, false);
    assert.deepEqual(broken.failures, ['b']);
    assert.equal(broken.slices.ambiguous.correct, 0);
    assert.equal(evaluate(cases, { a: 'access' }).passed, false);
    assert.throws(() => evaluate([], {}), /cases/);
});

test('traced mock timeout cancels provider work and returns an explicit failure, not fabricated success', async () => {
    const { run } = require('./observable-assistant');
    let aborted = false;
    const provider = signal => new Promise(resolve => {
        signal.addEventListener('abort', () => { aborted = true; resolve('late'); }, { once: true });
    });
    const result = await run(provider, { timeoutMs: 5, requestId: 'synthetic-1' });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'timeout');
    assert.equal(aborted, true);
    assert.deepEqual(result.events.map(event => event.event), ['request_started', 'request_failed']);
    assert.ok(!JSON.stringify(result.events).includes('late'));
    const success = await run(async () => 'draft', { requestId: 'synthetic-2' });
    assert.equal(success.ok, true);
    assert.equal(success.events[1].event, 'request_completed');
    const rejected = await run(async () => { throw new Error('private provider response'); });
    assert.equal(rejected.error, 'provider_failure');
    assert.ok(!JSON.stringify(rejected.events).includes('private provider response'));
});
