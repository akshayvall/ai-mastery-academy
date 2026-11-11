const UnitEngine = {
    STEPS: ['learn', 'try', 'check'],
    current: null,

    content() {
        return typeof ACADEMY_UNITS === 'undefined' ? { version: '', modules: {} } : ACADEMY_UNITS;
    },

    canComplete(unit, record = {}) {
        return record.practiceChecked === true && Number.isInteger(record.practice) &&
            record.practice >= 0 && record.practice < unit.practice.options.length &&
            record.check === unit.check.correct && String(record.reflection || '').trim().length >= 20;
    },

    nextUnit(units, current) {
        return units.slice(units.indexOf(current) + 1).find(unit => current.optional || !unit.optional);
    },

    isPassed(moduleId, unit, state = ProgressManager.getProgress().unitLearning[moduleId]) {
        const record = state?.records?.[unit.id];
        return state?.version === this.content().version && record?.checkChecked === true &&
            this.canComplete(unit, record);
    },

    shouldOpen(moduleId, route = {}) {
        return Boolean(this.content().modules[moduleId]) &&
            !route.reference && route.mode !== 'browse' && !route.sectionId &&
            (Boolean(route.unitId) || !Object.hasOwn(route, 'tab'));
    },

    init() {
        document.addEventListener('academy-storage-change', () => this.saveNotice());
        document.addEventListener('click', event => {
            const control = event.target.closest('[data-unit-action]');
            if (!control) return;
            event.preventDefault();
            this.act(control.dataset.unitAction, control.dataset.step, control.dataset.moduleId, control.dataset.unitId);
        });
        document.addEventListener('input', event => {
            if (event.target.id !== 'unitReflection' || !this.current) return;
            this.current.record.reflection = event.target.value.slice(0, 2000);
            this.current.record.passed = false;
            this.current.record.checkChecked = false;
            this.persist();
            const next = document.getElementById('unitNext');
            if (next) next.disabled = true;
            document.getElementById('unitFeedback').textContent = 'Draft updated. Check your answer again after editing.';
            this.saveNotice();
        });
        document.addEventListener('change', event => {
            if (!this.current || !['unitPractice', 'unitCheck'].includes(event.target.name)) return;
            const field = event.target.name === 'unitPractice' ? 'practice' : 'check';
            this.current.record[field] = Number(event.target.value);
            this.current.record[`${field}Checked`] = false;
            this.current.record.passed = false;
            this.persist();
            const next = document.getElementById('unitNext');
            if (next) next.disabled = true;
            const feedback = document.getElementById('unitFeedback');
            if (feedback) feedback.textContent = 'Selection updated. Check it to see feedback.';
            this.saveNotice();
        });
    },

    route(moduleId, unitId, step = 'learn') {
        return LearningEngine.formatRoute({ moduleId, unitId, step });
    },

    open(moduleId, route = {}) {
        const units = this.content().modules[moduleId];
        if (!units?.length) return;
        if (app.currentModule) LearningEngine.saveDrafts(app.currentModule.id);
        app._sectionObserver?.disconnect();
        app._pendingSection = null;
        app.closeMobileNav(false);
        if (typeof DiagramEngine !== 'undefined') DiagramEngine.cleanup();
        app.currentModule = null;
        const progress = ProgressManager.getProgress();
        const previous = progress.unitLearning[moduleId];
        const state = previous || { unitId: units[0].id, step: 'learn', version: this.content().version, records: {} };
        const changed = Boolean(previous && state.version !== this.content().version);
        if (changed) {
            Object.values(state.records).forEach(record => {
                record.checkChecked = false;
                record.passed = false;
            });
            state.version = this.content().version;
        }
        const invalidUnit = Boolean(route.unitId && !units.some(item => item.id === route.unitId));
        const unit = units.find(item => item.id === (route.unitId || state.unitId)) || units[0];
        const record = state.records[unit.id] || { practice: null, check: null, practiceChecked: false, checkChecked: false, passed: false, reflection: '' };
        state.unitId = unit.id;
        state.step = invalidUnit ? 'learn' : this.STEPS.includes(route.step) ? route.step : state.step;
        if (!this.STEPS.includes(state.step)) state.step = 'learn';
        state.records[unit.id] = record;
        this.current = { moduleId, units, unit, state, record, changed, invalidUnit };
        document.querySelectorAll('main .view').forEach(view => view.classList.toggle('active', view.id === 'unitView'));
        app.updateDestinationState('today');
        UIStateManager.touchModule(moduleId);
        this.persist();
        app.setRoute(this.routeObject());
        this.render();
    },

    routeObject() {
        const { moduleId, unit, state } = this.current;
        return { moduleId, unitId: unit.id, step: state.step };
    },

    persist() {
        const progress = ProgressManager.getProgress();
        const { moduleId, unit, state, record } = this.current;
        const latest = progress.unitLearning[moduleId];
        if (latest?.version === state.version) {
            state.records = { ...state.records, ...latest.records, [unit.id]: record };
        }
        progress.unitLearning[this.current.moduleId] = this.current.state;
        return ProgressManager.saveProgress(progress);
    },

    saveNotice() {
        const notice = document.getElementById('unitSaveStatus');
        if (!notice) return;
        const status = ProgressManager.getStorageStatus();
        notice.textContent = status.saved ? 'Saved on this device. Export a backup from Progress.' : status.message;
        notice.classList.toggle('unit-save-error', !status.saved);
        LearningEngine.renderStorageStatus();
    },

    questions(question, name, selected) {
        const escape = LearningEngine.escapeHtml;
        return `<fieldset class="unit-question"><legend>${escape(question.question)}</legend>
            ${question.options.map((option, index) => `<label class="unit-choice">
                <input type="radio" name="${name}" value="${index}" ${selected === index ? 'checked' : ''}>
                <span>${escape(option)}</span></label>`).join('')}</fieldset>`;
    },

    feedback(unit, record, step) {
        const field = step === 'try' ? 'practice' : 'check';
        if (!record[`${field}Checked`]) return '';
        const question = unit[field];
        if (!Number.isInteger(record[field]) || !question.options[record[field]]) return '';
        const correct = record[field] === question.correct;
        const explanation = question.explanations[record[field]];
        if (field === 'practice') return `${correct ? 'Good diagnosis.' : 'Not quite. Read the explanation, then try again.'} ${explanation}`;
        if (!correct) return `Revisit the evidence. ${explanation}`;
        if (!record.practiceChecked) return 'Complete the Try activity first, then return to this check.';
        if (record.reflection.trim().length < 20) return 'Add your own explanation (at least 20 characters), then check again.';
        return `Changed-task answer checked. ${explanation} Your explanation is saved for self-review, not automatically graded.`;
    },

    render() {
        const { moduleId, units, unit, state, record, changed, invalidUnit } = this.current;
        const escape = LearningEngine.escapeHtml;
        const index = units.indexOf(unit);
        const step = state.step;
        let body;
        if (step === 'learn') {
            body = `<div class="unit-prose">${unit.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</div>
                <figure class="unit-trace"><figcaption>Follow the idea</figcaption><ol>
                ${unit.trace.map(node => `<li><strong>${escape(node.label)}</strong><span>${escape(node.detail)}</span></li>`).join('')}</ol></figure>
                <section class="unit-example"><h2>${escape(unit.example.title)}</h2><p>${escape(unit.example.text)}</p></section>
                <button class="btn-primary" data-unit-action="step" data-step="try">Try it yourself</button>`;
        } else if (step === 'try') {
            body = `<p>Use what you just learned. Choose an answer, then inspect the feedback.</p>
                ${this.questions(unit.practice, 'unitPractice', record.practice)}
                <button class="btn-primary" data-unit-action="practice">Check prediction</button>
                <p id="unitFeedback" class="unit-feedback" role="status" tabindex="-1">${escape(this.feedback(unit, record, step))}</p>
                <button class="btn-secondary" data-unit-action="step" data-step="check" ${!record.practiceChecked ? 'disabled' : ''}>Try a changed situation</button>`;
        } else {
            const passed = this.isPassed(moduleId, unit, state);
            body = `<p>A new situation tests the same idea. This is local practice, not an external certification.</p>
                ${this.questions(unit.check, 'unitCheck', record.check)}
                <label class="unit-reflection-label" for="unitReflection">${escape(unit.teachBack.prompt)}</label>
                <textarea id="unitReflection" maxlength="2000" rows="4" placeholder="Explain the evidence you would use..." aria-describedby="unitReflectionHint">${escape(record.reflection)}</textarea>
                <p id="unitReflectionHint" class="unit-meta">Use your own words. Keep personal data and credentials out of this local notebook.</p>
                <button class="btn-primary" data-unit-action="check">Check answer and save explanation</button>
                <p id="unitFeedback" class="unit-feedback" role="status" tabindex="-1">${escape(this.feedback(unit, record, step))}</p>
                ${record.checkChecked ? `<details><summary>Compare with an example explanation</summary><p>${escape(unit.teachBack.example)}</p><p>Compare the evidence and reasoning, not identical wording.</p></details>` : ''}
                <button id="unitNext" class="btn-secondary" data-unit-action="next" ${passed ? '' : 'disabled'}>${this.nextUnit(units, unit) ? 'Next short lesson' : 'Return to your path'}</button>`;
        }
        document.getElementById('unitView').innerHTML = `
            <header class="unit-header"><a href="#today">Your path</a><span>Short lesson ${index + 1} of ${units.length} · About ${unit.minutes} min</span></header>
            <article class="unit-notebook">
                <p class="identity-kicker">AI systems, one idea at a time</p>
                <h1 id="unitTitle" tabindex="-1">${escape(unit.title)}</h1>
                <p class="unit-outcome">${escape(unit.outcome)}</p>
                ${unit.optional ? '<p class="unit-meta">Optional specialization. This lesson is not required for the core route.</p>' : ''}
                ${invalidUnit ? '<p class="unit-feedback" role="status">That short-lesson link is unavailable. The first lesson is open; your saved work has been kept.</p>' : ''}
                ${changed ? '<p class="unit-feedback">This lesson has changed. Your draft is preserved; complete the current check again.</p>' : ''}
                <nav class="unit-steps" aria-label="Lesson steps">${this.STEPS.map((item, i) => `<button data-unit-action="step" data-step="${item}" ${step === item ? 'aria-current="step"' : ''}>${i + 1}. ${item === 'try' ? 'Try' : item === 'check' ? 'Check' : 'Learn'}</button>`).join('')}</nav>
                <div class="unit-body">${body}</div>
                <aside class="unit-takeaway"><strong>Keep this idea</strong><p>${escape(unit.takeaway)}</p></aside>
                <details class="unit-reference"><summary>Reference, sources and deeper practice</summary>
                    <ul>${units.map(item => `<li><a href="${this.route(moduleId, item.id)}">${escape(item.title)}</a>${item.optional ? ' (optional specialization)' : ''}</li>`).join('')}</ul>
                    <p><a href="#${moduleId}?mode=browse">Open the full reference lesson</a> · <a href="#${moduleId}?tab=lab">Open the original lab and evidence</a></p>
                    <p>Source review: ${escape(unit.reviewed)}. Local tabletop exercise; no model or cloud service is called.</p>
                    <ul>${unit.sources.map(source => `<li><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a></li>`).join('')}</ul>
                </details>
                <p id="unitSaveStatus" class="unit-meta" role="status"></p>
            </article>`;
        this.saveNotice();
        document.getElementById('content').scrollTop = 0;
        document.getElementById('unitTitle').focus({ preventScroll: true });
    },

    act(action, step, moduleId, unitId) {
        if (action === 'open') return app.loadModule(moduleId, { unitId, step: step || undefined });
        if (!this.current) return;
        const { unit, record, state, units } = this.current;
        if (action === 'step' && this.STEPS.includes(step)) {
            state.step = step;
            this.persist();
            app.setRoute(this.routeObject());
            this.render();
            return;
        }
        if (action === 'practice' || action === 'check') {
            const field = action === 'practice' ? 'practice' : 'check';
            if (!Number.isInteger(record[field]) || record[field] < 0 || record[field] >= unit[field].options.length) {
                const feedback = document.getElementById('unitFeedback');
                feedback.textContent = 'Choose an answer before checking.';
                document.querySelector('.unit-question input')?.focus();
                return;
            }
            record[`${field}Checked`] = true;
            record.passed = action === 'check' && this.canComplete(unit, record);
            this.persist();
            this.render();
            document.getElementById('unitFeedback')?.focus();
            return;
        }
        if (action === 'next' && this.isPassed(this.current.moduleId, unit, state)) {
            const next = this.nextUnit(units, unit);
            if (next) app.loadModule(this.current.moduleId, { unitId: next.id, step: 'learn' });
            else app.showDashboard();
        }
    },

    orderedModules() {
        const available = Object.keys(this.content().modules);
        const pathId = UIStateManager.get().activePath;
        const route = typeof LEARNING_CONTENT !== 'undefined' ? LEARNING_CONTENT.paths.find(item => item.id === pathId) : null;
        const ids = route ? route.moduleIds.filter(id => available.includes(id)) : available;
        if (pathId === 'ai-product-judgment') {
            const evalIndex = ids.indexOf('pm-evals');
            if (evalIndex >= 0) ids.splice(3, 0, ...ids.splice(evalIndex, 1));
        }
        return ids;
    },

    decoratePath() {
        const container = document.getElementById('masteryDashboard');
        const primary = container?.querySelector('.today-primary');
        if (!primary || !Object.keys(this.content().modules).length) return;
        const escape = LearningEngine.escapeHtml;
        const progress = ProgressManager.getProgress();
        const ids = this.orderedModules();
        const lastId = UIStateManager.get().lastModuleId;
        const incomplete = id => this.content().modules[id].some(unit => !unit.optional && !this.isPassed(id, unit));
        const lastUnit = this.content().modules[lastId]?.find(unit => unit.id === progress.unitLearning[lastId]?.unitId);
        const resume = ids.includes(lastId) && lastUnit && !this.isPassed(lastId, lastUnit);
        const currentId = resume || (ids.includes(lastId) && incomplete(lastId)) ? lastId : ids.find(incomplete);
        const state = progress.unitLearning[currentId];
        const unit = currentId && (this.content().modules[currentId].find(item => item.id === state?.unitId && !this.isPassed(currentId, item)) ||
            this.content().modules[currentId].find(item => !item.optional && !this.isPassed(currentId, item)));
        const hasStarted = Object.keys(progress.unitLearning).length > 0;
        primary.innerHTML = `<p class="mastery-eyebrow">Your path</p><h2 id="today-title">${unit ? escape(hasStarted ? unit.title : 'Understand AI. Then build with it.') : 'Your selected route checks are complete'}</h2>
            <p>${unit ? escape(hasStarted ? unit.outcome : 'Start with one useful idea. No coding, account or subscription needed.') : 'Your local checks and explanations are saved. Try the deeper labs and get feedback on a changed task before claiming mastery.'}</p>
            ${unit ? `<a class="btn-primary" href="${this.route(currentId, unit.id, state?.unitId === unit.id ? state.step : 'learn')}">${hasStarted ? 'Continue learning' : 'Start here'}</a>` : '<a class="btn-primary" href="#build">Explore the labs</a>'}
            <div class="unit-secondary"><a href="#learn" data-destination="learn">Browse all modules</a><button type="button" data-mastery-action="open-diagnostic">Optional placement check</button></div>`;
        const renderModule = id => {
            const units = this.content().modules[id].filter(item => !item.optional);
            const done = units.filter(unit => this.isPassed(id, unit)).length;
            return `<li><div><a href="#${id}">${escape(units[0].title)}</a><small>${done}/${units.length} local checks · ${units.reduce((sum, item) => sum + item.minutes, 0)} min estimated</small></div></li>`;
        };
        container.querySelector('.today-path').innerHTML = ids.filter(incomplete).slice(0, 3).map(renderModule).join('');
        container.querySelector('.today-path').setAttribute('aria-label', 'Next three route milestones');
        container.querySelector('.today-path').insertAdjacentHTML('afterend',
            `<details class="unit-route-list"><summary>All ${ids.length} modules on your selected route</summary><ul>${ids.map(renderModule).join('')}</ul></details>`);
        container.querySelector('.today-evidence').innerHTML = '<p>Local checks help you practice. Existing mastery, evidence and backups are in <a href="#more">Progress</a>.</p>';
    },

    progressSummary() {
        const escape = LearningEngine.escapeHtml;
        const rows = Object.keys(this.content().modules).flatMap(moduleId => this.content().modules[moduleId].map(unit => {
            const state = ProgressManager.getProgress().unitLearning[moduleId];
            const record = state?.records[unit.id];
            if (!record) return '';
            return `<li><a href="${this.route(moduleId, unit.id, state.unitId === unit.id ? state.step : 'learn')}">${escape(unit.title)}</a>
                <p>${this.isPassed(moduleId, unit, state) ? 'Changed-task answer checked; explanation self-reviewed' : 'In progress'} · Local practice, not external verification</p>
                ${record.reflection ? `<details><summary>Your explanation</summary><p>${escape(record.reflection)}</p></details>` : ''}</li>`;
        })).filter(Boolean);
        return `<section class="learning-group unit-progress"><h2>Short-lesson notebook</h2>${rows.length ? `<ul>${rows.join('')}</ul>` : '<p>Your saved checks and explanations will appear here. <a href="#today">Start your path</a>.</p>'}</section>`;
    },

    localLabPack() {
        return `<section id="localLabPack" class="learning-group">
            <h2>Build locally, then break one thing</h2>
            <p>Six runnable reference exercises use synthetic fixtures, not a model.
            You need Node.js 22 or newer and a text editor. No account, API key,
            package install or provider charge.</p>
            <p><a class="learning-action" href="labs/local/README.md">Read the six-lab guide</a></p>
            <p>Available in this local checkout at <code>labs/local</code>.
            Open its README, predict an output, then run <code>node --test labs.test.js</code>
            from that folder. Archive creation was not authorized, so a downloadable pack
            is not offered. The guide link requires the local server; the exercises themselves
            run offline.</p>
            <ol>
                <li><strong>Task contract:</strong> catch valid JSON with an invented category.</li>
                <li><strong>Mock API client:</strong> retry a rate limit, stop on authentication failure.</li>
                <li><strong>Retrieval:</strong> distinguish missing evidence from an unsupported answer.</li>
                <li><strong>Bounded tool:</strong> deny an unapproved write and safely replay an approved one.</li>
                <li><strong>Evaluation:</strong> prove a planted regression fails the release gate.</li>
                <li><strong>Observability:</strong> trace and cancel a timed-out mock request.</li>
            </ol>
            <p>Each guide includes expected output, a failure example, your change,
            verification, limitations and cleanup. Local tests do not establish
            provider compatibility or production security. Keep your observations;
            the academy does not automatically award completion from opening the guide.</p>
        </section>`;
    },

    specializations() {
        const escape = LearningEngine.escapeHtml;
        const entries = Object.entries(this.content().modules).flatMap(([moduleId, units]) =>
            units.filter(unit => unit.optional).map(unit =>
                `<li><a href="${this.route(moduleId, unit.id)}">${escape(unit.title)}</a>
                <p>${escape(unit.outcome)}</p><p class="unit-meta">Recommended preparation: the core lessons in this module.
                About ${unit.minutes} min; local tabletop analysis, no provider charge or account.</p></li>`));
        return `<details id="specializations" class="learning-disclosure"><summary>Optional AI specializations (${entries.length})</summary>
            <p>These extend the core route rather than blocking its completion. Connected implementations require separate account, data and spend decisions.</p>
            <ul>${entries.join('')}</ul></details>`;
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = UnitEngine;
