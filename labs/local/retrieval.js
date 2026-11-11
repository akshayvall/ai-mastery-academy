function retrieve(query, documents, audience = 'public', limit = 2) {
    if (typeof query !== 'string' || !Array.isArray(documents)) throw new Error('Expected query and document array');
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('Invalid retrieval limit');
    const terms = new Set(query.toLowerCase().match(/[a-z0-9]+/g) || []);
    return documents.filter(doc => doc.audience === 'public' || doc.audience === audience)
        .map(doc => {
            const words = new Set(doc.text.toLowerCase().match(/[a-z0-9]+/g) || []);
            return { doc, score: [...terms].filter(term => words.has(term)).length };
        })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score || a.doc.id.localeCompare(b.doc.id))
        .slice(0, limit).map(result => result.doc);
}

function diagnose(retrievedIds, requiredIds, answerMatchesEvidence) {
    if (!requiredIds.length) throw new Error('Define expected evidence before diagnosis');
    if (!requiredIds.every(id => retrievedIds.includes(id))) return 'retrieval';
    return answerMatchesEvidence ? 'supported' : 'generation';
}

module.exports = { retrieve, diagnose };
