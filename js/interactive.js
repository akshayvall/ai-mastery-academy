/* ============================================
   INTERACTIVE EXERCISES — Drag & Drop, Flashcards
   ============================================ */

const InteractiveEngine = {

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
        });
    },

    // ─── DRAG & DROP ──────────────────────────────
    renderDragDrop(exercise) {
        const targetNames = Object.keys(exercise.targets);
        return `
        <div class="interactive-exercise" id="exercise-${exercise.id}">
            <h3>🎯 ${exercise.title}</h3>
            <p class="exercise-description">${exercise.description}</p>
            <div class="drag-drop-area">
                <div class="drag-source" id="source-${exercise.id}">
                    <h4 style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">Items to place:</h4>
                    ${this.shuffle(exercise.items).map(item => `
                        <div class="drag-item" draggable="true" data-exercise="${exercise.id}" data-value="${item}">${item}</div>
                    `).join('')}
                </div>
                <div class="drag-target">
                    ${targetNames.map(target => `
                        <div style="margin-bottom:12px">
                            <div class="label" style="font-weight:600;font-size:13px;margin-bottom:4px">${target}</div>
                            <div class="drop-zone" data-exercise="${exercise.id}" data-target="${target}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px">
                <button class="btn-primary" onclick="InteractiveEngine.checkDragDrop('${exercise.id}')">Check Answers</button>
                <button class="btn-secondary" onclick="InteractiveEngine.resetDragDrop('${exercise.id}')">Reset</button>
            </div>
            <div class="lab-validation" id="validation-${exercise.id}"></div>
        </div>`;
    },

    initDragDrop(exerciseId) {
        const items = document.querySelectorAll(`.drag-item[data-exercise="${exerciseId}"]`);
        const zones = document.querySelectorAll(`.drop-zone[data-exercise="${exerciseId}"]`);
        const source = document.getElementById(`source-${exerciseId}`);

        items.forEach(item => {
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', e.target.dataset.value);
                e.dataTransfer.setData('exercise', exerciseId);
                e.target.classList.add('dragging');
            });
            item.addEventListener('dragend', e => e.target.classList.remove('dragging'));
        });

        const setupDropZone = (zone) => {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
            zone.addEventListener('drop', e => {
                e.preventDefault(); zone.classList.remove('drag-over');
                const value = e.dataTransfer.getData('text/plain');
                const exId = e.dataTransfer.getData('exercise');
                if (exId !== exerciseId) return;
                const draggedItem = document.querySelector(`.drag-item[data-exercise="${exerciseId}"][data-value="${value}"]`);
                if (draggedItem) zone.appendChild(draggedItem);
            });
        };
        zones.forEach(setupDropZone);
        if (source) {
            source.addEventListener('dragover', e => e.preventDefault());
            source.addEventListener('drop', e => {
                e.preventDefault();
                const value = e.dataTransfer.getData('text/plain');
                const draggedItem = document.querySelector(`.drag-item[data-exercise="${exerciseId}"][data-value="${value}"]`);
                if (draggedItem) source.appendChild(draggedItem);
            });
        }
    },

    checkDragDrop(exerciseId) {
        const allModules = typeof MODULES !== 'undefined' ? MODULES : [];
        let exercise = null;
        for (const mod of allModules) {
            if (mod.interactive) {
                const found = mod.interactive.find(e => e.id === exerciseId);
                if (found) { exercise = found; break; }
            }
        }
        if (!exercise) return;

        let correct = 0, total = 0;
        const zones = document.querySelectorAll(`.drop-zone[data-exercise="${exerciseId}"]`);
        zones.forEach(zone => {
            const targetName = zone.dataset.target;
            const expectedItems = exercise.targets[targetName] || [];
            const droppedItems = zone.querySelectorAll('.drag-item');
            droppedItems.forEach(item => {
                total++;
                if (expectedItems.includes(item.dataset.value)) {
                    correct++; item.style.borderColor = 'var(--success)'; item.style.background = '#e6f9e6';
                } else {
                    item.style.borderColor = 'var(--error)'; item.style.background = '#fde7e9';
                }
            });
        });

        const sourceItems = document.querySelectorAll(`#source-${exerciseId} .drag-item`);
        total += sourceItems.length;
        const totalExpected = Object.values(exercise.targets).flat().length;
        const validation = document.getElementById(`validation-${exerciseId}`);

        if (correct === totalExpected && total === totalExpected) {
            validation.className = 'lab-validation success';
            validation.textContent = `✓ Perfect! All ${correct} items placed correctly.`;
            ProgressManager.completeInteractive(exerciseId);
            app.updateProgress();
        } else {
            validation.className = 'lab-validation error';
            validation.textContent = `${correct} of ${totalExpected} correct. Items with red borders are in the wrong place.`;
        }
    },

    resetDragDrop(exerciseId) {
        const source = document.getElementById(`source-${exerciseId}`);
        const items = document.querySelectorAll(`.drag-item[data-exercise="${exerciseId}"]`);
        items.forEach(item => { item.style.borderColor = ''; item.style.background = ''; source.appendChild(item); });
        const validation = document.getElementById(`validation-${exerciseId}`);
        if (validation) { validation.className = 'lab-validation'; validation.textContent = ''; }
    },

    // ─── FLASHCARDS ──────────────────────────────
    renderFlashcards(exercise) {
        const id = exercise.id;
        return `
        <div class="interactive-exercise" id="exercise-${id}">
            <h3>🃏 ${exercise.title}</h3>
            <p class="exercise-description">Click the card to flip it. Use arrows to navigate.</p>
            <div class="flashcard-container">
                <div class="flashcard" id="flashcard-${id}" onclick="InteractiveEngine.flipCard('${id}')">
                    <div class="flashcard-front"><span id="flash-front-${id}">${exercise.cards[0].front}</span></div>
                    <div class="flashcard-back"><span id="flash-back-${id}">${exercise.cards[0].back}</span></div>
                </div>
            </div>
            <div class="flashcard-nav">
                <button class="btn-secondary" onclick="InteractiveEngine.prevCard('${id}')" style="font-size:13px;padding:6px 16px">← Prev</button>
                <span id="flash-counter-${id}" style="font-size:13px;color:var(--text-secondary);padding:8px">1 / ${exercise.cards.length}</span>
                <button class="btn-secondary" onclick="InteractiveEngine.nextCard('${id}')" style="font-size:13px;padding:6px 16px">Next →</button>
            </div>
        </div>`;
    },

    flashcardState: {},

    flipCard(id) {
        document.getElementById(`flashcard-${id}`).classList.toggle('flipped');
    },

    getFlashcardExercise(id) {
        for (const mod of (typeof MODULES !== 'undefined' ? MODULES : [])) {
            if (mod.interactive) {
                const found = mod.interactive.find(e => e.id === id);
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
        document.getElementById(`flash-front-${id}`).textContent = card.front;
        document.getElementById(`flash-back-${id}`).textContent = card.back;
        document.getElementById(`flash-counter-${id}`).textContent = `${idx + 1} / ${ex.cards.length}`;
        document.getElementById(`flashcard-${id}`).classList.remove('flipped');
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
