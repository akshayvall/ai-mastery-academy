require('../labs/local/labs.test.js');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const cwd = path.join(__dirname, '..', 'labs', 'local');
test('all six offline CLI exercises produce inspectable JSON', () => {
    for (const command of ['contract', 'client', 'retrieval', 'tool', 'evaluation', 'timeout']) {
        const result = spawnSync(process.execPath, ['run.js', command], { cwd, encoding: 'utf8' });
        assert.equal(result.status, 0, `${command}: ${result.stderr}`);
        assert.ok(JSON.parse(result.stdout), command);
    }
});

test('the planted regression returns a nonzero release gate with the failing case', () => {
    const result = spawnSync(process.execPath, ['run.js', 'evaluation', '--regression'], { cwd, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.deepEqual(JSON.parse(result.stdout).criticalMisses, ['b']);
});

test('unknown exercises fail explicitly rather than claiming success', () => {
    const result = spawnSync(process.execPath, ['run.js', 'not-a-lab'], { cwd, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Choose a lab/);
});
