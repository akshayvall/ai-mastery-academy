/* ============================================
   INTERACTIVE EXERCISES — Drag & Drop, Flashcards
   ============================================ */

const InteractiveEngine = {

    escapeHtml(value) {
        const characters = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return String(value ?? '').replace(/[&<>"']/g, character => characters[character]);
    },

    domId(prefix, value) {
        const safeValue = Array.from(String(value ?? 'item'))
            .map(character => /[A-Za-z0-9_-]/.test(character) ? character : `-${character.codePointAt(0).toString(16)}-`)
            .join('');
        return `${prefix}-${safeValue || 'item'}`;
    },

    getExerciseRoot(exerciseId) {
        return document.getElementById(this.domId('exercise', exerciseId));
    },

    render(exercises) {
        const container = document.getElementById('tab-interactive');
        if (!exercises || exercises.length === 0) {
            container.innerHTML = '<p>No interactive exercises for this module yet.</p>';
            return;
        }
        container.innerHTML = exercises.map(ex => {
            switch (ex.type) {
                case 'drag-drop': return this.renderDragDrop(ex);
                case 'flashcards': return this.renderFlashcards(ex);
                default: return '';
            }
        }).join('');

        exercises.forEach(ex => {
            if (ex.type === 'drag-drop') this.initDragDrop(ex.id);
            if (ex.type === 'flashcards') this.initFlashcards(ex);
        });
    },

    // ─── DRAG & DROP ──────────────────────────────
    renderDragDrop(exercise) {
        const exerciseId = String(exercise.id);
        const exerciseDomId = this.domId('exercise', exerciseId);
        const sourceId = this.domId('source', exerciseId);
        const instructionsId = this.domId('drag-instructions', exerciseId);
        const statusId = this.domId('drag-status', exerciseId);
        const validationId = this.domId('validation', exerciseId);
        const targetNames = Object.keys(exercise.targets);
        const shuffledItems = this.shuffle(exercise.items.map((value, index) => ({ value: String(value), index })));
        return `
        <div class="interactive-exercise" id="${exerciseDomId}">
            <h3>🎯 ${this.escapeHtml(exercise.title)}</h3>
            <p class="exercise-description">${this.escapeHtml(exercise.description)}</p>
            <p class="drag-instructions" id="${instructionsId}">Drag each item to a category, or use its Move to menu. Then check your answers.</p>
            <div class="drag-drop-area" aria-describedby="${instructionsId}">
                <div class="drag-source" id="${sourceId}" aria-label="Items to place">
                    <h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">Items to place:</h4>
                    ${shuffledItems.map(item => `
                        <div class="drag-item" draggable="true" data-exercise="${this.escapeHtml(exerciseId)}" data-item-index="${item.index}" data-value="${this.escapeHtml(item.value)}">
                            <span class="drag-item-label">${this.escapeHtml(item.value)}</span>
                            <label class="drag-alternative">
                                <span>Move to</span>
                                <select class="drag-destination-select" draggable="false" aria-label="Move ${this.escapeHtml(item.value)} to a category">
                                    <option value="">Items to place</option>
                                    ${targetNames.map(target => `<option value="${this.escapeHtml(target)}">${this.escapeHtml(target)}</option>`).join('')}
                                </select>
                            </label>
                        </div>
                    `).join('')}
                </div>
                <div class="drag-target">
                    ${targetNames.map((target, targetIndex) => `
                        <div style="margin-bottom:12px">
                            <div class="label" id="${this.domId(`target-${targetIndex}`, exerciseId)}" style="font-weight:600;font-size:13px;margin-bottom:4px">${this.escapeHtml(target)}</div>
                            <div class="drop-zone" data-exercise="${this.escapeHtml(exerciseId)}" data-target="${this.escapeHtml(target)}" aria-labelledby="${this.domId(`target-${targetIndex}`, exerciseId)}" aria-describedby="${instructionsId}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px">
                <button type="button" class="btn-primary" data-interactive-action="check">Check Answers</button>
                <button type="button" class="btn-secondary" data-interactive-action="reset">Reset</button>
            </div>
            <div class="drag-status sr-only" id="${statusId}" role="status" aria-live="polite" aria-atomic="true"></div>
            <div class="lab-validation" id="${validationId}" role="status" aria-live="polite" aria-atomic="true"></div>
        </div>`;
    },

    initDragDrop(exerciseId) {
        const root = this.getExerciseRoot(exerciseId);
        if (!root) return;
        const items = root.querySelectorAll('.drag-item');
        const zones = root.querySelectorAll('.drop-zone');
        const source = document.getElementById(this.domId('source', exerciseId));

        items.forEach(item => {
            item.addEventListener('dragstart', e => {
                if (e.target.closest('select')) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.currentTarget.dataset.itemIndex);
                e.dataTransfer.setData('exercise', String(exerciseId));
                e.currentTarget.classList.add('dragging');
            });
            item.addEventListener('dragend', e => e.currentTarget.classList.remove('dragging'));
            const select = item.querySelector('.drag-destination-select');
            if (select) {
                select.addEventListener('change', () => {
                    this.moveDragItem(exerciseId, item.dataset.itemIndex, select.value, true);
                });
            }
        });

        const setupDropZone = (zone) => {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
            zone.addEventListener('drop', e => {
                e.preventDefault(); zone.classList.remove('drag-over');
                const itemIndex = e.dataTransfer.getData('text/plain');
                const exId = e.dataTransfer.getData('exercise');
                if (exId !== String(exerciseId)) return;
                this.moveDragItem(exerciseId, itemIndex, zone.dataset.target, true);
            });
        };
        zones.forEach(setupDropZone);
        if (source) {
            source.addEventListener('dragover', e => e.preventDefault());
            source.addEventListener('drop', e => {
                e.preventDefault();
                const exId = e.dataTransfer.getData('exercise');
                if (exId !== String(exerciseId)) return;
                this.moveDragItem(exerciseId, e.dataTransfer.getData('text/plain'), '', true);
            });
        }

        const checkButton = root.querySelector('[data-interactive-action="check"]');
        const resetButton = root.querySelector('[data-interactive-action="reset"]');
        if (checkButton) checkButton.addEventListener('click', () => this.checkDragDrop(exerciseId));
        if (resetButton) resetButton.addEventListener('click', () => this.resetDragDrop(exerciseId));
    },

    moveDragItem(exerciseId, itemIndex, targetName, announce) {
        const root = this.getExerciseRoot(exerciseId);
        const source = document.getElementById(this.domId('source', exerciseId));
        if (!root || !source) return;

        const item = Array.from(root.querySelectorAll('.drag-item'))
            .find(candidate => candidate.dataset.itemIndex === String(itemIndex));
        if (!item) return;

        let destination = source;
        let destinationLabel = 'Items to place';
        if (targetName) {
            destination = Array.from(root.querySelectorAll('.drop-zone'))
                .find(zone => zone.dataset.target === targetName);
            if (!destination) return;
            destinationLabel = targetName;
        }

        destination.appendChild(item);
        item.style.borderColor = '';
        item.style.background = '';
        const select = item.querySelector('.drag-destination-select');
        if (select) {
            select.value = targetName;
            select.removeAttribute('aria-invalid');
        }

        if (announce) {
            const itemLabel = item.querySelector('.drag-item-label')?.textContent || 'Item';
            this.announceDragStatus(exerciseId, `Moved ${itemLabel} to ${destinationLabel}.`);
        }
    },

    announceDragStatus(exerciseId, message) {
        const status = document.getElementById(this.domId('drag-status', exerciseId));
        if (status) status.textContent = message;
    },

    checkDragDrop(exerciseId) {
        const allModules = typeof MODULES !== 'undefined' ? MODULES : [];
        let exercise = null;
        for (const mod of allModules) {
            if (mod.interactive) {
                const found = mod.interactive.find(e => String(e.id) === String(exerciseId));
                if (found) { exercise = found; break; }
            }
        }
        if (!exercise) return;

        let correct = 0, total = 0;
        const incorrectItems = [];
        const root = this.getExerciseRoot(exerciseId);
        if (!root) return;
        const zones = root.querySelectorAll('.drop-zone');
        zones.forEach(zone => {
            const targetName = zone.dataset.target;
            const expectedItems = (exercise.targets[targetName] || []).map(String);
            const droppedItems = zone.querySelectorAll('.drag-item');
            droppedItems.forEach(item => {
                total++;
                if (expectedItems.includes(item.dataset.value)) {
                    correct++; item.style.borderColor = 'var(--success)'; item.style.background = '#e6f9e6';
                    item.querySelector('.drag-destination-select')?.setAttribute('aria-invalid', 'false');
                } else {
                    item.style.borderColor = 'var(--error)'; item.style.background = '#fde7e9';
                    item.querySelector('.drag-destination-select')?.setAttribute('aria-invalid', 'true');
                    incorrectItems.push(item.dataset.value);
                }
            });
        });

        const source = document.getElementById(this.domId('source', exerciseId));
        const sourceItems = source ? source.querySelectorAll('.drag-item') : [];
        sourceItems.forEach(item => incorrectItems.push(item.dataset.value));
        total += sourceItems.length;
        const totalExpected = Object.values(exercise.targets).flat().length;
        const validation = document.getElementById(this.domId('validation', exerciseId));
        if (!validation) return;

        if (correct === totalExpected && total === totalExpected) {
            validation.className = 'lab-validation success';
            validation.textContent = `✓ Perfect! All ${correct} items placed correctly.`;
            ProgressManager.completeInteractive(exerciseId);
            app.updateProgress();
        } else {
            validation.className = 'lab-validation error';
            const reviewText = incorrectItems.length > 0 ? ` Review: ${incorrectItems.join(', ')}.` : '';
            validation.textContent = `${correct} of ${totalExpected} correct.${reviewText}`;
        }
    },

    resetDragDrop(exerciseId) {
        const root = this.getExerciseRoot(exerciseId);
        const source = document.getElementById(this.domId('source', exerciseId));
        if (!root || !source) return;
        const items = root.querySelectorAll('.drag-item');
        items.forEach(item => this.moveDragItem(exerciseId, item.dataset.itemIndex, '', false));
        const validation = document.getElementById(this.domId('validation', exerciseId));
        if (validation) { validation.className = 'lab-validation'; validation.textContent = ''; }
        this.announceDragStatus(exerciseId, 'All items returned to Items to place.');
    },

    // ─── FLASHCARDS ──────────────────────────────
    renderFlashcards(exercise) {
        const id = String(exercise.id);
        const cards = exercise.cards || [];
        if (cards.length === 0) return '';
        const exerciseDomId = this.domId('exercise', id);
        const cardId = this.domId('flashcard', id);
        const frontId = this.domId('flash-front', id);
        const backId = this.domId('flash-back', id);
        const counterId = this.domId('flash-counter', id);
        const instructionsId = this.domId('flash-instructions', id);
        const statusId = this.domId('flash-status', id);
        const initialFront = String(cards[0].front);
        const initialBack = String(cards[0].back);
        return `
        <div class="interactive-exercise" id="${exerciseDomId}">
            <h3>🃏 ${this.escapeHtml(exercise.title)}</h3>
            <p class="exercise-description" id="${instructionsId}">Activate the card to show its other side. Use the Previous and Next buttons or the left and right arrow keys to navigate.</p>
            <div class="flashcard-container">
                <button type="button" class="flashcard" id="${cardId}" aria-describedby="${instructionsId}" aria-pressed="false" aria-label="Flashcard 1 of ${cards.length}. Front: ${this.escapeHtml(initialFront)}. Activate to show the back.">
                    <span class="flashcard-front" aria-hidden="true"><span id="${frontId}">${this.escapeHtml(initialFront)}</span></span>
                    <span class="flashcard-back" aria-hidden="true"><span id="${backId}">${this.escapeHtml(initialBack)}</span></span>
                </button>
            </div>
            <div class="flashcard-nav">
                <button type="button" class="btn-secondary" data-flash-action="previous" aria-label="Previous flashcard" style="font-size:13px;padding:6px 16px">← Prev</button>
                <span id="${counterId}" style="font-size:13px;color:var(--text-secondary);padding:8px">1 / ${cards.length}</span>
                <button type="button" class="btn-secondary" data-flash-action="next" aria-label="Next flashcard" style="font-size:13px;padding:6px 16px">Next →</button>
            </div>
            <div class="sr-only" id="${statusId}" role="status" aria-live="polite" aria-atomic="true">Front: ${this.escapeHtml(initialFront)}</div>
        </div>`;
    },

    flashcardState: {},

    initFlashcards(exercise) {
        const id = String(exercise.id);
        const root = this.getExerciseRoot(id);
        const card = document.getElementById(this.domId('flashcard', id));
        if (!root || !card) return;

        card.addEventListener('click', () => this.flipCard(id));
        card.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.prevCard(id);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.nextCard(id);
            }
        });

        root.querySelector('[data-flash-action="previous"]')?.addEventListener('click', () => this.prevCard(id));
        root.querySelector('[data-flash-action="next"]')?.addEventListener('click', () => this.nextCard(id));
    },

    flipCard(id) {
        const ex = this.getFlashcardExercise(id);
        const card = document.getElementById(this.domId('flashcard', id));
        if (!ex || !card) return;
        const isFlipped = card.classList.toggle('flipped');
        this.updateFlashcardAccessibility(id, ex, isFlipped);
    },

    getFlashcardExercise(id) {
        for (const mod of (typeof MODULES !== 'undefined' ? MODULES : [])) {
            if (mod.interactive) {
                const found = mod.interactive.find(e => String(e.id) === String(id));
                if (found) return found;
            }
        }
        return null;
    },

    prevCard(id) {
        const ex = this.getFlashcardExercise(id);
        if (!ex) return;
        if (!this.flashcardState[id]) this.flashcardState[id] = 0;
        this.flashcardState[id] = Math.max(0, this.flashcardState[id] - 1);
        this.updateCard(id, ex);
    },

    nextCard(id) {
        const ex = this.getFlashcardExercise(id);
        if (!ex) return;
        if (!this.flashcardState[id]) this.flashcardState[id] = 0;
        this.flashcardState[id] = Math.min(ex.cards.length - 1, this.flashcardState[id] + 1);
        this.updateCard(id, ex);
    },

    updateCard(id, ex) {
        const idx = this.flashcardState[id] || 0;
        const card = ex.cards[idx];
        document.getElementById(this.domId('flash-front', id)).textContent = card.front;
        document.getElementById(this.domId('flash-back', id)).textContent = card.back;
        document.getElementById(this.domId('flash-counter', id)).textContent = `${idx + 1} / ${ex.cards.length}`;
        document.getElementById(this.domId('flashcard', id)).classList.remove('flipped');
        this.updateFlashcardAccessibility(id, ex, false);
    },

    updateFlashcardAccessibility(id, ex, isFlipped) {
        const idx = this.flashcardState[id] || 0;
        const cardData = ex.cards[idx];
        const card = document.getElementById(this.domId('flashcard', id));
        const status = document.getElementById(this.domId('flash-status', id));
        if (!card || !cardData) return;

        const side = isFlipped ? 'Back' : 'Front';
        const content = String(isFlipped ? cardData.back : cardData.front);
        const nextSide = isFlipped ? 'front' : 'back';
        card.setAttribute('aria-pressed', String(isFlipped));
        card.setAttribute('aria-label', `Flashcard ${idx + 1} of ${ex.cards.length}. ${side}: ${content}. Activate to show the ${nextSide}.`);
        if (status) status.textContent = `${side}: ${content}`;
    },

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
};
