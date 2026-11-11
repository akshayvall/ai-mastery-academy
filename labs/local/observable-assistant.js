async function run(provider, { timeoutMs = 50, requestId = 'synthetic-request' } = {}) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 1000) throw new Error('Timeout must be 1-1000ms');
    if (typeof requestId !== 'string' || !/^[a-z0-9-]{1,50}$/.test(requestId)) throw new Error('Use a synthetic request ID');
    const events = [{ requestId, event: 'request_started' }];
    const controller = new AbortController();
    const timeoutError = new Error('timeout');
    let timer;
    try {
        const response = await Promise.race([
            Promise.resolve().then(() => provider(controller.signal)),
            new Promise((resolve, reject) => {
                timer = setTimeout(() => {
                    reject(timeoutError);
                    controller.abort();
                }, timeoutMs);
            })
        ]);
        if (typeof response !== 'string') throw new Error('Invalid response');
        events.push({ requestId, event: 'request_completed' });
        return { ok: true, response, events };
    } catch (error) {
        const reason = error === timeoutError ? 'timeout' : 'provider_failure';
        events.push({ requestId, event: 'request_failed', reason });
        return { ok: false, error: reason, events };
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { run };
