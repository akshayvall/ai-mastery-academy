function evaluate(cases, predictions) {
    if (!Array.isArray(cases) || !cases.length || new Set(cases.map(item => item.id)).size !== cases.length) {
        throw new Error('Evaluation requires nonempty cases with unique IDs');
    }
    const slices = Object.create(null);
    const failures = [];
    const criticalMisses = [];
    for (const item of cases) {
        if (typeof item.expected !== 'string' || typeof item.slice !== 'string') throw new Error('Invalid evaluation case');
        const correct = predictions[item.id] === item.expected;
        slices[item.slice] ||= { correct: 0, total: 0 };
        slices[item.slice].total++;
        if (correct) slices[item.slice].correct++;
        else {
            failures.push(item.id);
            if (item.critical) criticalMisses.push(item.id);
        }
    }
    return {
        passed: failures.length === 0,
        correct: cases.length - failures.length,
        total: cases.length,
        failures, criticalMisses, slices
    };
}

module.exports = { evaluate };
