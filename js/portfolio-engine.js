const PortfolioEngine = {
    TRACKS: {
        pm: { title: 'AI product decision dossier', sections: [
            { id: 'problem', title: 'User and problem', prompt: 'Describe a synthetic/public workflow, five observations, the user outcome and a no-AI baseline.', module: 'pm-discovery-ship' },
            { id: 'options', title: 'Build, buy, wait or no AI', prompt: 'Compare options, data boundaries, reversibility and the evidence that would change your choice.', module: 'pm-build-buy-wait' },
            { id: 'evaluation', title: 'Evaluation and release decision', prompt: 'Identify dataset/version, representative slices, holdout, grader calibration, results and uncertainty. Link an inspectable local artifact.', module: 'pm-evals' },
            { id: 'economics', title: 'Cost per successful task', prompt: 'State currency/date, model/rate assumptions, retries, human review and low/base/high scenarios. Explain the quality tradeoff.', module: 'pm-unit-economics' },
            { id: 'risk', title: 'Risk register and data boundary', prompt: 'Name a threat, test, mitigation, owner, residual risk and escalation. Use synthetic data; never include credentials.', module: 'pm-trust-safety' },
            { id: 'release', title: 'Rollout and operating review', prompt: 'Specify shadow/canary gates, privacy-limited events, a kill switch, rollback trigger and responsible owner.', module: 'pm-analytics' },
            { id: 'defense', title: 'Changed requirement and defense', prompt: 'A new provider doubles review cost and removes a feature. Recalculate the decision; answer a skeptical question without AI assistance.', module: 'pm-roadmap' },
            { id: 'decision', title: 'Decision request', prompt: 'Write a concise ship/hold recommendation with evidence, limitations and the decision you need. Label all unmeasured assumptions.', module: 'pm-comms' }
        ] },
        builder: { title: 'AI builder evidence dossier', sections: [
            { id: 'problem', title: 'Task contract and baseline', prompt: 'Define a synthetic task, the simplest no-agent baseline, acceptance cases and forbidden side effects.', module: 'phase1-prompting' },
            { id: 'client', title: 'Client and failure behavior', prompt: 'Record mock tests, request/response contract, retry budget and authentication/validation failures. State actual runtime/versions.', module: 'phase3-ai-from-code' },
            { id: 'retrieval', title: 'Retrieval and evidence', prompt: 'Record dataset/version, access filters, retrieval metrics, missing-evidence cases, citation checks and unsupported answers.', module: 'phase4-memory-rag' },
            { id: 'tools', title: 'Bounded tool and agent choice', prompt: 'Attach denied-write/timeout/idempotency test results. Compare a workflow with an agent; justify any autonomy.', module: 'phase5-tool-use' },
            { id: 'evaluation', title: 'Regression gate', prompt: 'Record config hash/version, held-out cases, per-slice results and a deliberately bad change that your gate catches.', module: 'builder-eval-pipeline' },
            { id: 'operations', title: 'Operations and recovery', prompt: 'Identify traces without secrets, an injected failure, cancellation, cost limits, staged release and rollback. Distinguish plans from executed work.', module: 'phase10-fullstack' },
            { id: 'defense', title: 'Changed requirement and defense', prompt: 'Remove a useful document and introduce a provider timeout. Diagnose the first failure, rerun checks and explain the design unaided.', module: 'phase13-capstone' },
            { id: 'review', title: 'Limitations and review', prompt: 'List reproducible commands, artifact locations, unresolved risks and independent review needed. Do not equate mocks with provider execution.', module: 'phase12-expert' }
        ] }
    },
    LABELS: ['Correctness', 'Evidence', 'Judgment', 'Explanation'],

    readiness(track, draft = {}) {
        const missing = this.TRACKS[track].sections.filter(section => String(draft.sections?.[section.id] || '').trim().length < 40).map(section => section.title);
        const scored = Array.isArray(draft.scores) && draft.scores.length === 4 && draft.scores.every(score => Number.isInteger(score) && score >= 3 && score <= 4);
        const reviewer = draft.provenance !== 'reviewer-reported' || String(draft.reviewer || '').trim().length >= 2;
        const assistance = ['none', 'explained', 'scaffolded', 'generated'].includes(draft.assistance);
        return { ready: missing.length === 0 && scored && reviewer && assistance, missing, scored, reviewer, assistance };
    },

    exportText(track, draft = {}) {
        const fence = text => {
            const value = String(text || 'Not recorded');
            const marker = '`'.repeat(Math.max(3, ...[...value.matchAll(/`+/g)].map(match => match[0].length + 1)));
            return `${marker}text\n${value}\n${marker}`;
        };
        const status = this.readiness(track, draft);
        return `# ${this.TRACKS[track].title}\n\nVersion: 1\nAssistance: ${draft.assistance || 'not-recorded'}\nProvenance: ${draft.provenance || 'self-assessed'}\nStatus: ${status.ready ? 'Prepared for human review' : 'Incomplete draft'}; not independently verified.\n\nReviewer (self-reported):\n${fence(draft.reviewer || 'None')}\n\n` +
            this.TRACKS[track].sections.map(section => `## ${section.title}\n\n${fence(draft.sections?.[section.id])}\n`).join('\n') +
            `\n## Self-review\n${this.LABELS.map((label, index) => `- ${label}: ${Number.isInteger(draft.scores?.[index]) ? draft.scores[index] : 'unscored'}/4`).join('\n')}\n\nNo local score verifies identity, code execution or learner competence.\n`;
    },

    init() {
        document.addEventListener('submit', event => {
            if (event.target.id !== 'portfolioForm') return;
            event.preventDefault();
            this.save();
        });
        document.addEventListener('input', event => {
            if (event.target.closest('#portfolioForm')) this.save(false);
        });
        document.addEventListener('change', event => {
            if (event.target.closest('#portfolioForm')) this.save(false);
        });
        document.addEventListener('click', event => {
            const control = event.target.closest('[data-portfolio-action]');
            if (!control) return;
            event.preventDefault();
            if (control.dataset.portfolioAction === 'track') {
                app.navigateDestination('more', { portfolio: control.dataset.track });
            } else if (control.dataset.portfolioAction === 'export') {
                this.save(false);
                const draft = ProgressManager.getProgress().portfolios[this.track] || {};
                const url = URL.createObjectURL(new Blob([this.exportText(this.track, draft)], { type: 'text/markdown;charset=utf-8' }));
                const link = document.createElement('a');
                link.href = url;
                link.download = `ai-${this.track}-dossier.md`;
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                this.feedback('Dossier export prepared. Check the downloaded file; it includes draft and provenance labels.');
            }
        });
        document.addEventListener('academy-storage-change', () => this.updateStatus());
    },

    render(track = 'pm') {
        this.track = Object.hasOwn(this.TRACKS, track) ? track : 'pm';
        const definition = this.TRACKS[this.track];
        const draft = ProgressManager.getProgress().portfolios[this.track] || { sections: {}, scores: [], assistance: 'not-recorded', provenance: 'self-assessed', reviewer: '' };
        const escape = LearningEngine.escapeHtml;
        const host = document.createElement('section');
        host.id = 'portfolioWorkbench';
        host.className = 'learning-group portfolio-workbench';
        host.innerHTML = `<h2>Your integrated project dossier</h2><p>Connect your learning into one inspectable decision or system. This notebook stays on this device and is included in progress backups.</p>
            <div class="learning-actions">${Object.entries(this.TRACKS).map(([id, item]) => `<button type="button" class="learning-action" data-portfolio-action="track" data-track="${id}" aria-pressed="${id === this.track}">${item.title}</button>`).join('')}</div>
            <h3>${definition.title}</h3>
            <form id="portfolioForm" autocomplete="off">
            ${definition.sections.map(section => `<details class="learning-disclosure"><summary>${section.title}</summary>
                <p>${section.prompt}</p><p><a href="#${section.module}">Study the related lesson</a></p>
                <label for="dossier-${section.id}">Your evidence and explanation</label>
                <textarea id="dossier-${section.id}" data-dossier-field="${section.id}" rows="5" maxlength="5000">${escape(draft.sections[section.id] || '')}</textarea></details>`).join('')}
            <label for="dossierAssistance">AI assistance used</label><select id="dossierAssistance"><option value="not-recorded">Choose assistance level</option>${['none', 'explained', 'scaffolded', 'generated'].map(value => `<option ${draft.assistance === value ? 'selected' : ''}>${value}</option>`).join('')}</select>
            <label for="dossierProvenance">Review provenance</label><select id="dossierProvenance"><option value="self-assessed" ${draft.provenance === 'self-assessed' ? 'selected' : ''}>Self-assessed</option><option value="reviewer-reported" ${draft.provenance === 'reviewer-reported' ? 'selected' : ''}>Reviewer feedback (identity self-reported)</option></select>
            <label for="dossierReviewer">Reviewer name, only when reporting reviewer feedback</label><input id="dossierReviewer" maxlength="100" value="${escape(draft.reviewer)}">
            <p>Self-review anchors: 0 absent/incorrect; 1 copied example; 2 familiar task with partial evidence; 3 changed task with evidence; 4 unfamiliar failure explained. Each essential dimension needs 3, not just the average.</p>
            <div class="learning-scores">${this.LABELS.map((label, index) => `<label>${label}<select data-dossier-score="${index}"><option value="">Unscored</option>${[0, 1, 2, 3, 4].map(score => `<option value="${score}" ${draft.scores[index] === score ? 'selected' : ''}>${score}</option>`).join('')}</select></label>`).join('')}</div>
            </form><p id="portfolioStatus" role="status"></p><button class="learning-action" type="button" data-portfolio-action="export">Export dossier Markdown</button>`;
        document.getElementById('destinationTitle').insertAdjacentElement('afterend', host);
        this.updateStatus();
    },

    save(announce = true) {
        const form = document.getElementById('portfolioForm');
        if (!form) return false;
        const progress = ProgressManager.getProgress();
        progress.portfolios[this.track] = {
            version: 1,
            sections: Object.fromEntries([...form.querySelectorAll('[data-dossier-field]')].map(input => [input.dataset.dossierField, input.value.slice(0, 5000)])),
            scores: [...form.querySelectorAll('[data-dossier-score]')].map(input => input.value === '' ? null : Number(input.value)),
            assistance: form.querySelector('#dossierAssistance').value,
            provenance: form.querySelector('#dossierProvenance').value,
            reviewer: form.querySelector('#dossierReviewer').value,
            savedAt: new Date().toISOString()
        };
        const saved = ProgressManager.saveProgress(progress);
        if (announce || saved) this.updateStatus();
        return saved;
    },

    feedback(message) {
        const target = document.getElementById('portfolioStatus');
        if (target) target.textContent = message;
    },

    updateStatus() {
        if (!document.getElementById('portfolioStatus') || !this.track) return;
        const storage = ProgressManager.getStorageStatus();
        if (!storage.saved) return this.feedback(storage.message);
        const status = this.readiness(this.track, ProgressManager.getProgress().portfolios[this.track] || {});
        this.feedback(status.ready ? 'Saved. Prepared for human review, not independently verified or certified.' :
            `Local draft. ${status.missing.length} sections need evidence; ${status.scored ? 'scores recorded' : 'all four essential scores must be at least 3'}${status.reviewer ? '' : '; add the reviewer name'}${status.assistance ? '' : '; record the assistance level'}. These checks measure completeness, not correctness.`);
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = PortfolioEngine;
