function createTool() {
    const records = new Map();
    const operations = new Map();
    return {
        records,
        write(input, approval) {
            if (!input || !/^[A-Z][0-9]{1,6}$/.test(input.recordId)) throw new Error('Invalid record ID');
            if (typeof input.text !== 'string' || !input.text.trim() || input.text.length > 200) throw new Error('Invalid draft');
            if (!approval || approval.action !== 'save-draft' || approval.recordId !== input.recordId) {
                throw new Error('Matching approval required');
            }
            if (typeof input.key !== 'string' || !/^[a-z0-9-]{1,40}$/.test(input.key)) throw new Error('Valid idempotency key required');
            const fingerprint = JSON.stringify([input.recordId, input.text]);
            if (operations.has(input.key)) {
                if (operations.get(input.key) !== fingerprint) throw new Error('Idempotency conflict');
                return { recordId: input.recordId, replayed: true };
            }
            records.set(input.recordId, input.text);
            operations.set(input.key, fingerprint);
            return { recordId: input.recordId, replayed: false };
        }
    };
}

module.exports = { createTool };
