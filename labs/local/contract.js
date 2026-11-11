function validate(tickets, outputs) {
    if (!Array.isArray(tickets) || !tickets.every(ticket => typeof ticket.id === 'string')) {
        throw new Error('Tickets must have string IDs');
    }
    if (!Array.isArray(outputs)) return ['Output must be an array'];
    const errors = [];
    const expected = new Set(tickets.map(ticket => ticket.id));
    const seen = new Set();
    for (const output of outputs) {
        if (!output || typeof output !== 'object' || Array.isArray(output)) {
            errors.push('Each output must be an object');
            continue;
        }
        if (!expected.has(output.ticket_id)) errors.push('Unexpected ticket ID');
        if (seen.has(output.ticket_id)) errors.push(`duplicate ticket: ${output.ticket_id}`);
        seen.add(output.ticket_id);
        if (!['access', 'returns', 'unknown'].includes(output.category)) errors.push('Invalid category');
        if (typeof output.needs_clarification !== 'boolean') errors.push('Clarification must be boolean');
        if (Object.keys(output).some(key => !['ticket_id', 'category', 'needs_clarification'].includes(key))) {
            errors.push('Unexpected output field');
        }
    }
    for (const id of expected) if (!seen.has(id)) errors.push(`Missing ticket: ${id}`);
    return errors;
}

module.exports = { validate };
