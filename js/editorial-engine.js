const EditorialEngine = {
    queue(sources, reviews = {}, today = new Date().toISOString().slice(0, 10)) {
        const rank = { blocked: 0, overdue: 1, scheduled: 2 };
        return sources.map(source => ({
            ...source,
            status: source.blocked ? 'blocked' : !source.due || source.due < today ? 'overdue' : 'scheduled',
            localReview: reviews[source.id] || null
        })).sort((a, b) => rank[a.status] - rank[b.status] || a.id.localeCompare(b.id));
    },

    sources() {
        return [
            ...Object.entries(MODEL_LANDSCAPE.sources).map(([id, source]) => ({
                id, title: `${id[0].toUpperCase()}${id.slice(1)} model and lifecycle facts`,
                owner: MODEL_LANDSCAPE.reviewOwner, reviewed: source.verifiedDate,
                due: MODEL_LANDSCAPE.nextReviewDate, verification: 'source-reviewed',
                scope: 'Catalogue, pricing assumptions and lifecycle; provider labs not executed.',
                url: source.lifecycle || source.models
            })),
            { id: 'curriculum', title: 'Lesson accuracy and assessment alignment', owner: 'Curriculum maintainer',
                reviewed: '2026-11-11', due: '2027-02-11', verification: 'source-reviewed',
                scope: 'Authored explanations, misconceptions, changed tasks and source links. Human learning outcomes not measured.',
                url: 'docs/AI_ACADEMY_WORLD_CLASS_PRD_2026-11-10.md' },
            { id: 'local-labs', title: 'Executable local lab fixtures', owner: 'Lab maintainer',
                reviewed: '2026-11-11', due: '2026-12-11', verification: 'local-fixture-executed',
                scope: 'Node reference programs and failure tests only; no provider integration or production security certification.',
                url: 'labs/local/README.md' },
            { id: 'builder-source', title: 'Generated Builder teaching corrections', owner: 'Builder source maintainer',
                reviewed: '', due: '2026-11-11', verification: 'source-unmodified', blocked: true,
                scope: 'User approved, but runtime source-access restriction persists. Do not edit generated output as a bypass.',
                url: 'docs/AI_ACADEMY_WORLD_CLASS_PRD_2026-11-10.md#23-local-implementation-record--november-11' }
        ];
    },

    renderQueue() {
        const escape = LearningEngine.escapeHtml;
        const target = document.getElementById('reviewQueue');
        if (!target) return;
        target.innerHTML = this.queue(this.sources(), ProgressManager.getProgress().editorialReviews).map(item =>
            `<article class="editorial-item"><h3>${escape(item.title)}: ${item.status}</h3>
                <p>${escape(item.scope)}</p><p>Owner: ${escape(item.owner)} · Due: ${escape(item.due)} ·
                ${escape(item.verification === 'source-reviewed' ? 'Source-reviewed' : item.verification)} ·
                Last recorded check: ${escape(item.reviewed || 'Not recorded')}</p>
                <a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Inspect source or review record</a>
                ${item.localReview ? `<details><summary>Local note: ${escape(item.localReview.decision)}</summary><p>${escape(item.localReview.owner)} · ${escape(item.localReview.reviewed)}</p><p>${escape(item.localReview.notes)}</p><p>This note does not update the published facts or their review dates.</p></details>` : ''}
            </article>`).join('');
    },

    render() {
        const host = document.createElement('details');
        host.id = 'sourceReview';
        host.className = 'learning-disclosure editorial-workbench';
        host.innerHTML = `<summary>Content maintenance and source-review queue</summary>
            <p>Review model/API/pricing facts monthly, curriculum quarterly, and a lab before release.
            A retirement notice creates work, not permission to change teaching or paid models automatically.</p>
            <div id="reviewQueue"></div>
            <form id="reviewForm" autocomplete="off">
                <label for="reviewClaim">Source group</label><select id="reviewClaim">${this.sources().map(item => `<option value="${item.id}">${item.title}</option>`).join('')}</select>
                <label for="reviewOwner">Review owner</label><input id="reviewOwner" maxlength="100" required>
                <label for="reviewDate">Date reviewed</label><input id="reviewDate" type="date" max="${new Date().toISOString().slice(0, 10)}" value="${new Date().toISOString().slice(0, 10)}" required>
                <label for="reviewDecision">Local disposition</label><select id="reviewDecision"><option value="needs-update">Needs update</option><option value="reviewed">Reviewed; publication still separate</option><option value="blocked">Blocked</option></select>
                <label for="reviewNotes">Evidence and next action (no private data)</label><textarea id="reviewNotes" rows="4" minlength="40" maxlength="2000" required></textarea>
                <button class="learning-action" type="submit">Save local review note</button>
                <p id="reviewFeedback" role="status"></p>
            </form>`;
        document.getElementById('destinationView').append(host);
        this.renderQueue();
        host.querySelector('form').addEventListener('submit', event => {
            event.preventDefault();
            const form = event.target;
            const date = form.querySelector('#reviewDate').value;
            const owner = form.querySelector('#reviewOwner').value.trim();
            const notes = form.querySelector('#reviewNotes').value.trim();
            const feedback = form.querySelector('#reviewFeedback');
            if (owner.length < 2 || notes.length < 40 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > new Date().toISOString().slice(0, 10)) {
                feedback.textContent = 'Enter an owner, a valid non-future date and at least 40 characters of evidence.';
                return;
            }
            const progress = ProgressManager.getProgress();
            progress.editorialReviews[form.querySelector('#reviewClaim').value] = {
                owner, notes, reviewed: date, decision: form.querySelector('#reviewDecision').value
            };
            const saved = ProgressManager.saveProgress(progress);
            feedback.textContent = saved ? 'Local review note saved; published facts unchanged.' : ProgressManager.getStorageStatus().message;
            this.renderQueue();
        });
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = EditorialEngine;
