// The mock assistant reads the supplied facts; it does not interpret free text.
const EvalWorkshop = (() => {
    const development = [
        { id: 'D1', message: 'My unopened lamp arrived four days ago. Can I return it?', days: 4, opened: false, expected: 'approve' },
        { id: 'D2', message: 'The kettle is still sealed. It arrived 17 days ago.', days: 17, opened: false, expected: 'decline' },
        { id: 'D3', message: 'The box is unopened. I cannot find the delivery date.', days: null, opened: false, expected: 'ask' },
        { id: 'D4', message: 'I received the mug six days ago. Can I send it back?', days: 6, opened: null, expected: 'ask' },
        { id: 'D5', message: 'My unopened headphones arrived exactly 14 days ago.', days: 14, opened: false, expected: 'approve' },
        { id: 'D6', message: 'I opened the speaker yesterday. It arrived three days ago.', days: 3, opened: true, expected: 'decline' }
    ];
    const holdout = [
        { id: 'H1', message: 'This unopened toaster was a gift. I do not know when it arrived.', days: null, opened: false, expected: 'ask' },
        { id: 'H2', message: 'I kept the camera sealed. Today is day fourteen since delivery.', days: 14, opened: false, expected: 'approve' },
        { id: 'H3', message: 'The sealed book light came two days ago and I ordered the wrong one.', days: 2, opened: false, expected: 'approve' },
        { id: 'H4', message: 'I want to return a radio that was delivered 22 days ago.', days: 22, opened: null, expected: 'decline' }
    ];
    const replies = { approve: 'Yes, this return qualifies.', decline: 'No, this return is outside the policy.', ask: 'Please confirm the missing eligibility information.' };

    function answer({ days, opened }, rule) {
        if (opened || (days !== null && (rule === 'boundary' ? days > 14 : days >= 14))) return 'decline';
        if (rule === 'missing' && (days === null || opened === null)) return 'ask';
        return 'approve';
    }

    function score(cases, rule) {
        const rows = cases.map(item => ({ ...item, actual: answer(item, rule) }));
        const misses = rows.filter(row => row.actual !== row.expected);
        return { rows, misses, correct: rows.length - misses.length, unsafe: misses.filter(row => row.actual === 'approve').length };
    }

    function comparison(cases, rule) {
        const before = score(cases, 'baseline');
        const after = score(cases, rule);
        return `<p><strong>Baseline: ${before.correct}/${cases.length}. Changed: ${after.correct}/${cases.length}.</strong>
            Unsafe approvals: ${before.unsafe} → ${after.unsafe}. Remaining misses: ${after.misses.map(row => row.id).join(', ') || 'none'}.</p>
            <ul>${after.rows.map((row, i) => `<li data-case="${row.id}"><strong>${row.id}</strong>: ${row.message}
            <br>Expected: ${row.expected}. Baseline: ${before.rows[i].actual}. Changed: ${row.actual} (${row.actual === row.expected ? 'pass' : 'fail'}).</li>`).join('')}</ul>`;
    }

    function bind(host) {
        host.querySelector('button').addEventListener('click', () => {
            host.innerHTML = `<h3 tabindex="-1">1. Analyze six conversations</h3>
                <p>Policy: approve unopened items delivered up to and including 14 days ago. Decline a known disqualifier. Otherwise ask for missing facts. The mock reads the stated facts, not the wording.</p>
                <ul>${development.map(item => `<li data-case="${item.id}"><strong>${item.id}</strong>: ${item.message}<br>Assistant: ${replies[answer(item, 'baseline')]}</li>`).join('')}</ul>
                <form><label>Failure and pass/fail rule <textarea required rows="3" maxlength="1000" placeholder="Cite two cases. What went wrong, who pays the cost, and what reply would pass?"></textarea></label>
                <h3>2. Measure and change one rule</h3>
                <p>A case passes if its action matches an independent policy label. An unsafe approval is a yes where the policy calls for a question or a no. Weigh that harm against wrongly denying an eligible return.</p>
                <label>Change to test <select required><option value="">Choose one change</option>
                <option value="missing">Ask when eligibility evidence is missing</option><option value="boundary">Include the last eligible day</option></select></label>
                <button class="btn-secondary" type="submit">Compare on six cases</button></form>
                <div data-dev-result tabindex="-1"></div><div data-holdout-result tabindex="-1"></div>`;
            host.querySelector('h3').focus();
            const form = host.querySelector('form');
            form.addEventListener('submit', event => {
                event.preventDefault();
                const note = form.querySelector('textarea');
                if (!note.value.trim()) {
                    note.setCustomValidity('Name an observed failure and a pass/fail rule.');
                    note.reportValidity();
                    note.addEventListener('input', () => note.setCustomValidity(''), { once: true });
                    return;
                }
                const choice = form.querySelector('select');
                const rule = choice.value;
                choice.disabled = true;
                note.readOnly = true;
                form.querySelector('button').disabled = true;
                const dev = host.querySelector('[data-dev-result]');
                dev.innerHTML = `<h3>Development results</h3>${comparison(development, rule)}
                    <p>Your change is fixed. Predict which mistakes will remain on four unseen cases.</p>
                    <button class="btn-secondary" type="button">Reveal four held-out cases</button>`;
                dev.focus();
                dev.querySelector('button').addEventListener('click', event => {
                    event.currentTarget.disabled = true;
                    const result = host.querySelector('[data-holdout-result]');
                    result.innerHTML = `<h3>3. Decide what to ship</h3>${comparison(holdout, rule)}
                        <label>Ship, limit or hold? <textarea rows="3" maxlength="1000" placeholder="Cite a remaining miss, its consequence and what you would test next."></textarea></label>
                        <p>Four cases cannot establish a production failure rate. Once you see these cases they are no longer an independent test for your next change. Use fresh cases next time.</p>`;
                    result.focus();
                }, { once: true });
            });
        }, { once: true });
    }
    return { bind };
})();
