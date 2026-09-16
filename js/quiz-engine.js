/* ============================================
   QUIZ ENGINE — Handles quiz rendering & scoring
   ============================================ */

const QuizEngine = {
    currentQuiz: null,
    currentQuestion: 0,
    answers: [],
    attemptCounts: new Map(),

    prepareQuestions(moduleId, originalQuestions, attempt = 0) {
        const seed = Array.from(String(moduleId)).reduce((hash, character) =>
            (hash * 31 + character.charCodeAt(0)) >>> 0, 0);
        const round = Number.isSafeInteger(attempt) && attempt >= 0 ? attempt : 0;
        const policy = typeof LEARNING_CONTENT !== 'undefined'
            ? LEARNING_CONTENT.modules?.[moduleId]?.criticalQuestions : [];
        const criticalIndexes = Array.isArray(policy) ? policy : [];
        const questions = originalQuestions.map((question, questionIndex) => {
            const id = question.id || `${moduleId}:q${questionIndex}`;
            const optionCount = question.options.length;
            const target = (questionIndex + seed + round) % optionCount;
            const rotation = Array.isArray(question.correct)
                ? target : (question.correct - target + optionCount) % optionCount;
            const optionOrder = question.options.map((option, optionIndex) => (optionIndex + rotation) % optionCount);
            return {
                ...question,
                id,
                critical: question.critical === true || criticalIndexes.includes(questionIndex),
                options: optionOrder.map(optionIndex => question.options[optionIndex]),
                optionIds: optionOrder.map(optionIndex => question.optionIds?.[optionIndex] || `${id}:o${optionIndex}`),
                correct: Array.isArray(question.correct)
                    ? question.correct.map(optionIndex => optionOrder.indexOf(optionIndex)).sort((left, right) => left - right)
                    : optionOrder.indexOf(question.correct)
            };
        });
        const start = (seed + round) % (questions.length || 1);
        return questions.slice(start).concat(questions.slice(0, start));
    },

    init(moduleId, questions) {
        this.currentQuiz = moduleId;
        this.currentQuestion = 0;
        this.originalQuestions = questions;
        const attempt = this.attemptCounts.get(moduleId) || 0;
        this.attemptCounts.set(moduleId, attempt + 1);
        this.answers = new Array(questions.length).fill(null);
        this.questions = this.prepareQuestions(moduleId, this.originalQuestions, attempt);
        this.submitted = new Set();
        this.resultSubmitted = false;
        this.resultSaved = false;
        this.isReviewAttempt = Boolean(typeof ProgressManager !== 'undefined' &&
            typeof ProgressManager.isReviewDue === 'function' && ProgressManager.isReviewDue(moduleId));
        this.render();
    },

    render() {
        const container = document.getElementById('tab-quiz');
        this.bindEvents(container);
        if (!this.questions || this.questions.length === 0) {
            container.innerHTML = '<p>No quiz available for this module yet.</p>';
            return;
        }
        const q = this.questions[this.currentQuestion];
        const totalQ = this.questions.length;
        const answered = this.answers.filter(a => a !== null).length;
        const isMulti = q.type === 'multi-select' || Array.isArray(q.correct);
        const current = this.answers[this.currentQuestion];
        const selected = new Set(Array.isArray(current) ? current : []);

        container.innerHTML = `
            <div class="quiz-container fade-in">
                <div class="quiz-header">
                    <span class="quiz-question-counter">Question ${this.currentQuestion + 1} of ${totalQ}</span>
                    <span class="quiz-score" role="status" aria-live="polite" aria-atomic="true">${answered} answered</span>
                </div>
                <div class="quiz-question">
                    <h3 id="quizQuestionHeading" tabindex="-1">${this.currentQuestion + 1}. ${this.escapeHtml(q.question)}${isMulti ? ' (Select all that apply)' : ''}</h3>
                    <div class="quiz-options" role="${isMulti ? 'group' : 'radiogroup'}" aria-labelledby="quizQuestionHeading">
                        ${q.options.map((opt, i) => `
                            <label class="quiz-option ${this.getOptionClass(i)}" data-index="${i}">
                                                <input type="${isMulti ? 'checkbox' : 'radio'}" name="q${this.currentQuestion}" data-option-index="${i}"
                                                    ${isMulti ? (selected.has(i) ? 'checked' : '') : (current === i ? 'checked' : '')}
                                       ${this.isAnswered() ? 'disabled' : ''}>
                                <span>${this.escapeHtml(opt)}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="quiz-explanation ${this.isAnswered() ? 'show' : ''}" id="quizExplanation" tabindex="-1" role="status" aria-live="polite">
                        ${this.isAnswered() ? this.getExplanationHtml() : ''}
                    </div>
                </div>
                <div class="quiz-actions">
                    <button type="button" class="btn-secondary" data-quiz-action="previous-question"
                            ${this.currentQuestion === 0 ? 'disabled style="opacity:0.3"' : ''}>← Previous</button>
                    ${!this.isAnswered() ?
                        `<button type="button" class="btn-primary" data-quiz-action="submit-answer" id="submitBtn"
                                 ${this.isAnswerReady() ? '' : 'disabled style="opacity:0.5"'}>Check Answer</button>` : ''}
                    ${this.currentQuestion < totalQ - 1 ?
                        `<button type="button" class="btn-primary" data-quiz-action="next-question">Next Question →</button>` :
                        `<button type="button" class="btn-primary" data-quiz-action="show-results" style="background:var(--success)">See Results</button>`}
                </div>
                <div style="display:flex;gap:6px;margin-top:20px;flex-wrap:wrap;">
                    ${this.questions.map((_, i) => `
                                                <button type="button" class="quiz-question-jump" aria-label="Go to question ${i + 1}" data-quiz-action="go-to-question" data-question-index="${i}"
                                                         style="width:32px;height:32px;border:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;
                             ${i === this.currentQuestion ? 'background:var(--ai-purple);color:#fff;' :
                               this.submitted.has(i) ? (this.isQuestionCorrect(i) ? 'background:var(--success);color:#fff;' : 'background:var(--error);color:#fff;') :
                                                             'background:#eee;color:#666;'}">${i + 1}</button>
                    `).join('')}
                </div>
            </div>`;
    },

    bindEvents(container) {
        if (!container || container.dataset.quizEventsBound === 'true') return;
        container.dataset.quizEventsBound = 'true';

        container.addEventListener('click', event => {
            const control = event.target.closest('[data-quiz-action]');
            if (!control) return;
            const actions = {
                'previous-question': () => this.prevQuestion(),
                'submit-answer': () => this.submitAnswer(),
                'next-question': () => this.nextQuestion(),
                'show-results': () => this.showResults(),
                'go-to-question': () => this.goToQuestion(Number(control.dataset.questionIndex)),
                'retake-quiz': () => this.init(this.currentQuiz, this.originalQuestions),
                'review-material': () => app.switchTab('learn')
            };
            actions[control.dataset.quizAction]?.();
        });

        container.addEventListener('change', event => {
            const input = event.target.closest('[data-option-index]');
            if (input) this.selectOption(Number(input.dataset.optionIndex), input.checked);
        });

        container.addEventListener('keydown', event => {
            const input = event.target.closest('[data-option-index]');
            if (!input || event.key !== 'Enter') return;
            event.preventDefault();
            input.click();
        });
    },

    selectOption(index, checked) {
        if (this.isAnswered() || this.resultSubmitted) return;
        const question = this.questions[this.currentQuestion];
        if (!Number.isInteger(index) || index < 0 || index >= question.options.length) return;
        if (question.type === 'multi-select' || Array.isArray(question.correct)) {
            const selected = new Set(Array.isArray(this.answers[this.currentQuestion]) ? this.answers[this.currentQuestion] : []);
            const select = typeof checked === 'boolean' ? checked : !selected.has(index);
            if (select) selected.add(index); else selected.delete(index);
            this.answers[this.currentQuestion] = selected.size ? Array.from(selected).sort((left, right) => left - right) : null;
        } else {
            this.answers[this.currentQuestion] = index;
        }
        this.render();
        this.focus(`[data-option-index="${index}"]`);
    },

    isAnswerReady() {
        const answer = this.answers[this.currentQuestion];
        return Array.isArray(answer) ? answer.length > 0 : answer !== null && answer !== undefined;
    },

    submitAnswer() {
        if (this.resultSubmitted || this.isAnswered() || !this.isAnswerReady()) return;
        this.submitted.add(this.currentQuestion);
        this.render();
        this.focus('#quizExplanation');
    },

    isAnswered() { return this.submitted && this.submitted.has(this.currentQuestion); },

    getOptionClass(index) {
        const question = this.questions[this.currentQuestion];
        const answer = this.answers[this.currentQuestion];
        const selected = Array.isArray(answer) ? answer.includes(index) : answer === index;
        if (!this.isAnswered()) return selected ? 'selected' : '';
        const correct = Array.isArray(question.correct) ? question.correct.includes(index) : index === question.correct;
        if (correct) return Array.isArray(question.correct) && !selected ? 'correct-answer' : 'correct';
        if (selected) return 'incorrect';
        return '';
    },

    getExplanationHtml() {
        const q = this.questions[this.currentQuestion];
        const isCorrect = this.isQuestionCorrect(this.currentQuestion);
        return `<strong style="color:${isCorrect ? 'var(--success)' : 'var(--error)'}">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
                <p style="margin-top:8px">${q.explanation}</p>`;
    },

    isQuestionCorrect(index) {
        const question = this.questions[index];
        const answer = this.answers[index];
        if (answer === null || answer === undefined) return false;
        if (!Array.isArray(question.correct)) return answer === question.correct;
        const selected = Array.isArray(answer) ? answer.slice().sort((left, right) => left - right) : [];
        const correct = question.correct.slice().sort((left, right) => left - right);
        return selected.length === correct.length && selected.every((value, optionIndex) => value === correct[optionIndex]);
    },

    calculateResult() {
        const total = this.questions.length;
        const correct = this.questions.reduce((count, question, index) =>
            count + (this.isQuestionCorrect(index) ? 1 : 0), 0);
        const pct = Math.round((correct / total) * 100);
        const criticalIndexes = this.questions
            .map((question, index) => question.critical === true ? index : -1)
            .filter(index => index >= 0);
        const criticalMisses = criticalIndexes.filter(index => !this.isQuestionCorrect(index)).length;
        return { total, correct, pct, criticalMisses, passed: pct >= 80 && criticalMisses === 0 };
    },

    focus(selector) {
        document.getElementById('tab-quiz')?.querySelector(selector)?.focus();
    },

    prevQuestion() { this.goToQuestion(this.currentQuestion - 1); },
    nextQuestion() { this.goToQuestion(this.currentQuestion + 1); },
    goToQuestion(index) {
        if (this.resultSubmitted || !Number.isInteger(index) || index < 0 || index >= this.questions.length) return;
        this.currentQuestion = index;
        this.render();
        this.focus('#quizQuestionHeading');
    },

    showResults() {
        if (this.resultSubmitted || !this.questions?.length) return;
        this.resultSubmitted = true;
        const container = document.getElementById('tab-quiz');
        const { total, correct, pct, criticalMisses, passed } = this.calculateResult();
        let accepted = false;
        let reviewRecorded = false;
        let storageStatus;
        if (typeof ProgressManager !== 'undefined' && typeof ProgressManager.saveQuizScore === 'function') {
            accepted = ProgressManager.saveQuizScore(this.currentQuiz, correct, total, criticalMisses) !== false;
            if (this.isReviewAttempt) reviewRecorded = Boolean(ProgressManager.recordReview(this.currentQuiz, passed));
            storageStatus = ProgressManager.getStorageStatus?.();
        }
        this.resultSaved = accepted && storageStatus?.saved === true;
        const saveMessage = this.resultSaved
            ? 'Quiz result saved on this device.' + (reviewRecorded ? ' Review attempt recorded; the next review is scheduled.' : ' No additional spaced-review credit was recorded.')
            : storageStatus?.message || 'This result is not saved on this device. Export a backup or retry saving before closing this page.';
        const missedCritical = this.questions.filter((question, index) => question.critical && !this.isQuestionCorrect(index));

        container.innerHTML = `
            <div class="quiz-results fade-in">
                <h2 id="quizResultsHeading" tabindex="-1">${passed ? '🎉 Quiz Passed!' : '📝 Keep Studying'}</h2>
                <div class="score-display ${passed ? 'passed' : 'failed'}">${pct}%</div>
                <p>${correct} out of ${total} correct</p>
                <p style="color:var(--text-secondary);margin:12px 0">${passed
                    ? 'You passed the 80% threshold' + (this.questions.some(question => question.critical) ? ' and all critical concept checks.' : '.')
                    : criticalMisses > 0
                        ? `Review critical questions: ${missedCritical.map(question => this.escapeHtml(question.question)).join('; ')}. Every critical question must be correct.`
                        : 'You need 80% to pass. Review the material and try again.'}</p>
                <p id="quizSaveStatus" role="status" aria-live="polite">${this.escapeHtml(saveMessage)}</p>
                <div style="display:flex;gap:12px;justify-content:center;margin-top:20px">
                    <button class="btn-secondary" data-quiz-action="retake-quiz">↺ Retake Quiz</button>
                    <button class="btn-primary" data-quiz-action="review-material">📖 Review Material</button>
                </div>
                <div style="margin-top:32px;text-align:left">
                    <h3 style="margin-bottom:16px">Question Review:</h3>
                    ${this.questions.map((question, index) => {
                        const correctAnswer = this.isQuestionCorrect(index);
                        const correctLabel = Array.isArray(question.correct)
                            ? question.correct.map(optionIndex => question.options[optionIndex]).join(' + ')
                            : question.options[question.correct];
                        return `<div style="padding:12px;margin-bottom:8px;border-radius:8px;background:${correctAnswer ? '#e6f9e6' : '#fde7e9'}">
                            <strong>${index + 1}. ${correctAnswer ? '✓' : '✗'}</strong> ${this.escapeHtml(question.question)}
                            ${!correctAnswer ? `<br><small style="color:var(--success)">Correct: ${this.escapeHtml(correctLabel)}</small>` : ''}
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        if (typeof app !== 'undefined') app.updateProgress();
        if (typeof app !== 'undefined' && app.currentModule && typeof MasteryEngine !== 'undefined') {
            MasteryEngine.renderModulePanel(app.currentModule);
            MasteryEngine.renderDashboard(MODULES);
        }
        this.focus('#quizResultsHeading');
    },

    escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
};
