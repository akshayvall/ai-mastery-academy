/* ============================================
   LAB ENGINE v2 — Rich structured step-by-step labs
   Inspired by Azure Networking Academy lab format
   
   Step schema:
   {
     title: 'Step title',
     subtitle: 'One-line description',
     duration: '5 min',        // optional
     instructions: [            // array of instruction blocks
       'Plain text instruction',
       { type: 'command', cmd: 'mkdir project && cd project' },
       { type: 'code', language: 'python', code: 'print("hello")' },
       { type: 'tip', text: 'Helpful tip here' },
       { type: 'warning', text: 'Watch out for this' },
       { type: 'verify', text: 'You should see X. If not, check Y.' },
       { type: 'heading', text: 'Section heading within the step' }
     ]
   }

   Falls back to old format: { title, type:'action', content:'...' }
   ============================================ */

const LabEngine = {
    currentLab: null,
    stepResults: [],

    init(moduleId, lab) {
        if (!lab) {
            document.getElementById('tab-lab').innerHTML = '<p>No lab available yet.</p>';
            return;
        }
        this.currentLab = moduleId;
        this.lab = lab;
        // Restore any previously saved checklist state (ported from ai-builder-academy)
        this.stepResults = ProgressManager.getLabSteps(moduleId, lab.steps.length);
        this.render();
    },

    render() {
        const container = document.getElementById('tab-lab');
        this.bindEvents(container);
        const lab = this.lab;
        const done = this.stepResults.filter(r => r === true).length;
        const total = lab.steps.length;
        const pct = Math.round((done / total) * 100);

        container.innerHTML = `
            <div class="lab-container fade-in">
                <div class="lab-hero">
                    <div class="lab-hero-icon">🧪</div>
                    <div class="lab-hero-text">
                        <h2>${lab.title}</h2>
                        <p>${lab.scenario || ''}</p>
                        <div class="lab-badges">
                            ${lab.duration ? `<span class="lab-badge lab-badge-time">⏱ ${lab.duration}</span>` : ''}
                            ${lab.cost ? `<span class="lab-badge lab-badge-cost">💰 ${lab.cost}</span>` : ''}
                            ${lab.difficulty ? `<span class="lab-badge lab-badge-diff">📊 ${lab.difficulty}</span>` : ''}
                        </div>
                    </div>
                </div>

                ${lab.prerequisites ? `
                <div class="lab-prereqs">
                    <h4>📋 Prerequisites</h4>
                    <ul>${lab.prerequisites.map(p => `<li>${p}</li>`).join('')}</ul>
                </div>` : ''}

                <div class="lab-progress-bar">
                    <div class="lab-progress-fill" style="width:${pct}%"></div>
                </div>
                <p style="text-align:center;font-size:13px;color:var(--text-secondary);margin-bottom:24px">${done} / ${total} steps complete (${pct}%)</p>

                ${lab.steps.map((step, i) => this.renderStep(step, i)).join('')}

                ${done === total ? `
                <div class="lab-complete-banner">
                    <h3>🎉 Project Complete!</h3>
                    <p>Push this to GitHub for your portfolio!</p>
                </div>` : ''}
            </div>`;
    },

    renderStep(step, index) {
        const isCompleted = this.stepResults[index] === true;

        // NEW format (instructions array)
        if (step.instructions) {
            return this.renderRichStep(step, index, isCompleted);
        }
        // OLD format fallback (type: 'action', content: '...')
        return this.renderLegacyStep(step, index, isCompleted);
    },

    renderRichStep(step, index, isCompleted) {
        const instructionsHtml = step.instructions.map(instr => {
            if (typeof instr === 'string') {
                return `<p class="lab-instr-text">${instr}</p>`;
            }
            switch (instr.type) {
                case 'heading':
                    return `<h5 class="lab-instr-heading">${instr.text}</h5>`;
                case 'command':
                    return `<div class="lab-cmd"><code>${this.escapeHtml(instr.cmd)}</code></div>`;
                case 'code':
                    return `<div class="lab-code-block"><div class="lab-code-lang">${instr.language || ''}</div><pre>${this.escapeHtml(instr.code)}</pre></div>`;
                case 'tip':
                    return `<div class="lab-tip">💡 <strong>Tip:</strong> ${instr.text}</div>`;
                case 'warning':
                    return `<div class="lab-warning">⚠️ <strong>Warning:</strong> ${instr.text}</div>`;
                case 'verify':
                    return `<div class="lab-verify">✅ <strong>Verify Your Work</strong><br>${instr.text}</div>`;
                case 'prompt':
                    return `<div class="lab-prompt"><div class="lab-prompt-header">💬 Paste this into Claude Code:</div><pre>${this.escapeHtml(instr.text)}</pre></div>`;
                case 'list':
                    return `<ul class="lab-list">${instr.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
                default:
                    return `<p>${instr.text || ''}</p>`;
            }
        }).join('');

        return `
            <div class="lab-step ${isCompleted ? 'lab-step-done' : ''}" id="lab-step-${index}">
                <h4 class="lab-step-heading">
                    <button type="button" class="lab-step-header" id="lab-step-toggle-${index}" aria-expanded="true" aria-controls="lab-step-body-${index}" data-lab-action="toggle-step" data-step-index="${index}">
                        <span class="lab-step-num ${isCompleted ? 'lab-step-num-done' : ''}">${isCompleted ? '✓' : index + 1}</span>
                        <span class="lab-step-title-area">
                            <span class="lab-step-title">${step.title}</span>
                            ${step.subtitle ? `<span class="lab-step-subtitle">${step.subtitle}</span>` : ''}
                        </span>
                        ${step.duration ? `<span class="lab-step-time">⏱ ${step.duration}</span>` : ''}
                        <span class="lab-step-chevron" aria-hidden="true">▼</span>
                    </button>
                </h4>
                <div class="lab-step-body" id="lab-step-body-${index}" aria-labelledby="lab-step-toggle-${index}">
                    ${instructionsHtml}
                    ${!isCompleted ? `
                    <button type="button" class="lab-done-btn" data-lab-action="mark-done" data-step-index="${index}">
                        ✅ I've completed this step
                    </button>` : `
                    <button type="button" class="lab-done-btn lab-undo-btn" data-lab-action="mark-undone" data-step-index="${index}">
                        ↺ Mark as not done
                    </button>`}
                </div>
            </div>`;
    },

    renderLegacyStep(step, index, isCompleted) {
        let content = (step.content || '').replace(/\\n/g, '<br>');
        return `
            <div class="lab-step ${isCompleted ? 'lab-step-done' : ''}" id="lab-step-${index}">
                <h4 class="lab-step-heading">
                    <button type="button" class="lab-step-header" id="lab-step-toggle-${index}" aria-expanded="true" aria-controls="lab-step-body-${index}" data-lab-action="toggle-step" data-step-index="${index}">
                        <span class="lab-step-num ${isCompleted ? 'lab-step-num-done' : ''}">${isCompleted ? '✓' : index + 1}</span>
                        <span class="lab-step-title-area"><span class="lab-step-title">${step.title}</span></span>
                        <span class="lab-step-chevron" aria-hidden="true">▼</span>
                    </button>
                </h4>
                <div class="lab-step-body" id="lab-step-body-${index}" aria-labelledby="lab-step-toggle-${index}">
                    <div class="lab-instr-text">${content}</div>
                    ${!isCompleted ? `
                    <button type="button" class="lab-done-btn" data-lab-action="mark-done" data-step-index="${index}">
                        ✅ I've completed this step
                    </button>` : `
                    <button type="button" class="lab-done-btn lab-undo-btn" data-lab-action="mark-undone" data-step-index="${index}">
                        ↺ Mark as not done
                    </button>`}
                </div>
            </div>`;
    },

    bindEvents(container) {
        if (!container || container.dataset.labEventsBound === 'true') return;
        container.dataset.labEventsBound = 'true';
        container.addEventListener('click', event => {
            const control = event.target.closest('[data-lab-action]');
            if (!control) return;
            const stepIndex = Number(control.dataset.stepIndex);
            const actions = {
                'toggle-step': () => this.toggleStep(stepIndex),
                'mark-done': () => this.markDone(stepIndex),
                'mark-undone': () => this.markUndone(stepIndex)
            };
            actions[control.dataset.labAction]?.();
        });
    },

    toggleStep(index) {
        const body = document.getElementById(`lab-step-body-${index}`);
        const toggle = document.getElementById(`lab-step-toggle-${index}`);
        if (!body || !toggle) return;
        const isCollapsed = body.classList.toggle('lab-step-body-collapsed');
        toggle.setAttribute('aria-expanded', String(!isCollapsed));
    },

    markDone(index) {
        this.stepResults[index] = true;
        ProgressManager.saveLabSteps(this.currentLab, this.stepResults);
        if (this.stepResults.every(r => r === true)) {
            ProgressManager.completeLab(this.currentLab);
            app.updateProgress();
            app.showToast('Project completed! 🎉', 'success');
        }
        this.render();
        const next = document.getElementById(`lab-step-${index + 1}`);
        if (next) {
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
    },

    markUndone(index) {
        this.stepResults[index] = null;
        ProgressManager.saveLabSteps(this.currentLab, this.stepResults);
        this.render();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
