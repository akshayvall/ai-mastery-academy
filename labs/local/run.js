const fixtures = require('./fixtures.json');
const commands = {
    contract: () => ({ errors: require('./contract').validate(fixtures.tickets, fixtures.outputs) }),
    client: async () => {
        let calls = 0;
        const result = await require('./mock-client').classify(async () => ++calls === 1 ?
            { status: 429, retryAfterMs: 1 } : { status: 200, body: '{"category":"access"}' });
        return { calls, result };
    },
    retrieval: () => {
        const { retrieve, diagnose } = require('./retrieval');
        const found = retrieve('library loan', fixtures.documents, 'public', 1);
        return { found, diagnosis: diagnose(found.map(doc => doc.id), ['policy'], true) };
    },
    tool: () => {
        const tool = require('./bounded-tool').createTool();
        const input = { recordId: 'T1', text: 'Synthetic draft only', key: 'demo' };
        let denied;
        try { tool.write(input, null); }
        catch (error) { denied = error.message; }
        const approval = { recordId: 'T1', action: 'save-draft' };
        const saved = tool.write(input, approval);
        return { denied, saved, replay: tool.write(input, approval), records: tool.records.size };
    },
    evaluation: () => {
        const predictions = { ...fixtures.predictions };
        if (process.argv.includes('--regression')) predictions.b = 'access';
        const result = require('./evaluation').evaluate(fixtures.cases, predictions);
        if (!result.passed) process.exitCode = 1;
        return result;
    },
    timeout: () => require('./observable-assistant').run(
        signal => new Promise(resolve => signal.addEventListener('abort', () => resolve('discarded late response'), { once: true })),
        { timeoutMs: 10 }
    )
};

async function main() {
    const name = process.argv[2];
    if (!Object.hasOwn(commands, name)) {
        throw new Error(`Choose a lab: ${Object.keys(commands).join(', ')}`);
    }
    console.log(JSON.stringify(await commands[name](), null, 2));
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
