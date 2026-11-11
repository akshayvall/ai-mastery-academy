async function classify(transport, { maxAttempts = 2, wait = delay => new Promise(resolve => setTimeout(resolve, delay)) } = {}) {
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) throw new Error('Invalid attempt budget');
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await transport();
        if (response.status === 401) throw new Error('authentication failed; do not retry');
        if (response.status === 200) {
            let body;
            try { body = JSON.parse(response.body); }
            catch { throw new Error('Malformed response JSON'); }
            if (!body || !['access', 'returns', 'unknown'].includes(body.category)) throw new Error('Invalid category');
            return body;
        }
        if (![429, 503].includes(response.status)) throw new Error(`Non-retryable status: ${response.status}`);
        if (attempt === maxAttempts) throw new Error('Retry budget exhausted');
        const delay = Number.isFinite(response.retryAfterMs) ? Math.max(0, Math.min(1000, response.retryAfterMs)) : 10 * attempt;
        await wait(delay);
    }
}

module.exports = { classify };
