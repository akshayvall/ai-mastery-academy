const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const directory = path.join(__dirname, '..', 'js');
const context = vm.createContext({});
for (const name of ['landscape', 'modules-100', 'modules-200', 'modules-300', 'modules-pm']) {
    vm.runInContext(fs.readFileSync(path.join(directory, `${name}.js`), 'utf8'), context);
}
const modules = JSON.parse(vm.runInContext('JSON.stringify([...MODULES_100, ...MODULES_200, ...MODULES_300, ...MODULES_PM])', context));
const lesson = id => modules.find(module => module.id === id).learn;
function reference() {
    const block = lesson('phase3-ai-from-code').match(/<div class="code-block" data-reference="responses-client">([\s\S]*?)<\/div>/);
    assert.ok(block, 'A complete, optional Responses reference client must be present');
    const source = block[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const runtime = vm.createContext({});
    vm.runInContext(source, runtime);
    return runtime;
}
const response = output_text => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: output_text }] }], output_text });

test('Responses reference constructs a bounded schema request without SDK or network access', () => {
    const runtime = reference();
    const request = runtime.buildRequest('reviewed-model-id');
    assert.equal(request.store, false);
    assert.equal(request.max_output_tokens, 512);
    assert.equal(request.text.format.type, 'json_schema');
    assert.equal(request.text.format.strict, true);
    assert.equal(request.text.format.schema.additionalProperties, false);
    assert.equal(request.tools.length, 0);
    assert.throws(() => runtime.buildRequest(''), /model/i);
    assert.match(lesson('phase3-ai-from-code'), /Chat Completions remains supported/);
    assert.match(lesson('phase3-ai-from-code'), /store: false.*not.*zero.retention/is);
});

test('Responses reference rejects incomplete, refused, tool-call and malformed outputs', () => {
    const runtime = reference();
    assert.equal(runtime.validateResponse(response('{"priority":"normal","summary":"MapleDesk fixture"}')).priority, 'normal');
    for (const bad of [
        { ...response('{}'), status: 'incomplete' },
        { ...response('{}'), output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] },
        { ...response('{}'), output: [{ type: 'function_call', name: 'write_file' }] },
        response('not JSON'),
        response('{"priority":"urgent","summary":"x"}'),
        response('{"priority":"normal","summary":"x","extra":true}'),
        response('{"priority":"normal","summary":null}'),
        response(JSON.stringify({ priority: 'normal', summary: 'x'.repeat(241) }))
    ]) assert.throws(() => runtime.validateResponse(bad));
});

test('connected reference requires explicit opt-in and returns minimized error categories', async () => {
    const runtime = reference();
    await assert.rejects(() => runtime.runConnected(), /approval/i);
    assert.equal(runtime.failureKind({ status: 401, message: 'secret' }), 'authentication');
    assert.equal(runtime.failureKind({ status: 429 }), 'rate-limit');
    assert.equal(runtime.failureKind({ name: 'APIConnectionTimeoutError' }), 'timeout');
    assert.equal(runtime.failureKind({ status: 503 }), 'provider-unavailable');
    assert.equal(runtime.failureKind({ message: 'raw prompt' }), 'request-failed');
    assert.match(lesson('phase3-ai-from-code'), /maxRetries: 0/);
});

test('portable skills, MCP and A2A references have separate contracts and offline denial cases', () => {
    const interoperability = lesson('phase9-mcp-skills');
    for (const pattern of [/Agent Skills/, /SKILL\.md/, /MCP/, /A2A/, /Agent Card/i, /2026-07-28/, /2025-11-25/, /denied/i, /offline/i]) {
        assert.match(interoperability, pattern);
    }
    assert.match(interoperability, /https:\/\/agentskills.io/);
    assert.match(interoperability, /https:\/\/a2a-protocol.org/);
    assert.match(lesson('phase7-claude-code'), /portable.*host-specific|host-specific.*portable/i);
});

test('Phase 5 teaches tool contracts before marking repeated prompting as prerequisite reference', () => {
    const tools = lesson('phase5-tool-use');
    assert.ok(tools.indexOf('Tool contract first') >= 0);
    assert.ok(tools.indexOf('Tool contract first') < tools.indexOf('Prompting prerequisite reference'));
    for (const pattern of [/schema/i, /authorization/i, /idempotency/i, /denied write/i, /timeout/i, /Phase 1/, /Phase 3/]) assert.match(tools, pattern);
});

test('Foundry specialization and migration worksheet remain public, offline and source-dated', () => {
    const foundry = lesson('phase10-fullstack');
    for (const pattern of [/Microsoft Foundry/, /2026-11-11/, /prompt agent/i, /hosted agent/i, /voice/i, /Entra/, /RBAC/, /held-out/i, /rollback/i, /not executed/i, /offline/i]) assert.match(foundry, pattern);
    assert.match(foundry, /https:\/\/learn.microsoft.com\/.*foundry/);
    const migration = lesson('phase12-expert');
    for (const pattern of [/SDK version/i, /package-lock\.json/, /npm ls openai --depth=0/, /2026-11-11/, /gpt-4o-2024-08-06/, /gemini-2\.5-flash/, /December 1, 2026/, /rollback/i, /offline/i]) assert.match(migration, pattern);
});
