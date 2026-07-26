/* ============================================
   QUIZ ENGINE — Handles quiz rendering & scoring
   ============================================ */

const QuizEngine = {
    currentQuiz: null,
    currentQuestion: 0,
    answers: [],

    init(moduleId, questions) {
        this.currentQuiz = moduleId;
        this.currentQuestion = 0;
        this.answers = new Array(questions.length).fill(null);
        this.questions = questions;
        this.submitted = new Set();
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

        container.innerHTML = `
            <div class="quiz-container fade-in">
                <div class="quiz-header">
                    <span class="quiz-question-counter">Question ${this.currentQuestion + 1} of ${totalQ}</span>
                    <span class="quiz-score">${answered} answered</span>
                </div>
                <div class="quiz-question">
                    <h3>${this.currentQuestion + 1}. ${this.escapeHtml(q.question)}</h3>
                    <div class="quiz-options">
                        ${q.options.map((opt, i) => `
                            <label class="quiz-option ${this.getOptionClass(i)}" data-index="${i}">
                                    <input type="radio" name="q${this.currentQuestion}" data-option-index="${i}"
                                       ${this.answers[this.currentQuestion] === i ? 'checked' : ''}
                                       ${this.isAnswered() ? 'disabled' : ''}>
                                <span>${this.escapeHtml(opt)}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="quiz-explanation ${this.isAnswered() ? 'show' : ''}" id="quizExplanation">
                        ${this.isAnswered() ? this.getExplanationHtml() : ''}
                    </div>
                </div>
                <div class="quiz-actions">
                    <button type="button" class="btn-secondary" data-quiz-action="previous-question"
                            ${this.currentQuestion === 0 ? 'disabled style="opacity:0.3"' : ''}>← Previous</button>
                    ${!this.isAnswered() ?
                        `<button type="button" class="btn-primary" data-quiz-action="submit-answer" id="submitBtn"
                                 ${this.answers[this.currentQuestion] === null ? 'disabled style="opacity:0.5"' : ''}>Check Answer</button>` : ''}
                    ${this.currentQuestion < totalQ - 1 ?
                        `<button type="button" class="btn-primary" data-quiz-action="next-question">Next Question →</button>` :
                        `<button type="button" class="btn-primary" data-quiz-action="show-results" style="background:var(--success)">See Results</button>`}
                </div>
                <div style="display:flex;gap:6px;margin-top:20px;flex-wrap:wrap;">
                    ${this.questions.map((_, i) => `
                                                <button type="button" class="quiz-question-jump" aria-label="Go to question ${i + 1}" data-quiz-action="go-to-question" data-question-index="${i}"
                                                         style="width:32px;height:32px;border:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;
                             ${i === this.currentQuestion ? 'background:var(--ai-purple);color:#fff;' :
                               this.answers[i] !== null ? (this.answers[i] === this.questions[i].correct ? 'background:var(--success);color:#fff;' : 'background:var(--error);color:#fff;') :
                                                             'background:#eee;color:#666;'}">${i + 1}</button>
                    `).join('')}
                </div>
            </div>`;
    },

    bindEvents(container) {
        if (!container || container.dataset.quizEventsBound === 'true') return;
        container.dataset.quizEventsBound = 'true';

        container.addEventListener('click', event => {
            const input = event.target.closest('[data-option-index]');
            if (input) {
                this.selectOption(Number(input.dataset.optionIndex));
                return;
            }

            const control = event.target.closest('[data-quiz-action]');
            if (!control) return;
            const actions = {
                'previous-question': () => this.prevQuestion(),
                'submit-answer': () => this.submitAnswer(),
                'next-question': () => this.nextQuestion(),
                'show-results': () => this.showResults(),
                'go-to-question': () => this.goToQuestion(Number(control.dataset.questionIndex)),
                'retake-quiz': () => this.init(this.currentQuiz, this.questions),
                'review-material': () => app.switchTab('learn')
            };
            actions[control.dataset.quizAction]?.();
        });

        container.addEventListener('keydown', event => {
            const input = event.target.closest('[data-option-index]');
            if (!input || event.key !== 'Enter') return;
            event.preventDefault();
            this.selectOption(Number(input.dataset.optionIndex));
        });
    },

    selectOption(index) { if (this.isAnswered()) return; this.answers[this.currentQuestion] = index; this.render(); },
    submitAnswer() { if (this.answers[this.currentQuestion] === null) return; this.submitted.add(this.currentQuestion); this.render(); },
    isAnswered() { return this.submitted && this.submitted.has(this.currentQuestion); },

    getOptionClass(index) {
        if (!this.isAnswered()) return this.answers[this.currentQuestion] === index ? 'selected' : '';
        const q = this.questions[this.currentQuestion];
        if (index === q.correct) return 'correct';
        if (index === this.answers[this.currentQuestion] && index !== q.correct) return 'incorrect';
        return '';
    },

    getExplanationHtml() {
        const q = this.questions[this.currentQuestion];
        const isCorrect = this.answers[this.currentQuestion] === q.correct;
        return `<strong style="color:${isCorrect ? 'var(--success)' : 'var(--error)'}">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
                <p style="margin-top:8px">${q.explanation}</p>`;
    },

    calculateResult() {
        const total = this.questions.length;
        const correct = this.questions.reduce((count, question, index) =>
            count + (this.answers[index] === question.correct ? 1 : 0), 0);
        const pct = Math.round((correct / total) * 100);
        const taggedCritical = this.questions
            .map((question, index) => question.critical === true ? index : -1)
            .filter(index => index >= 0);
        const criticalIndexes = taggedCritical.length ? taggedCritical : [0];
        const criticalMisses = criticalIndexes.filter(index =>
            this.answers[index] !== this.questions[index].correct).length;
        return { total, correct, pct, criticalMisses, passed: pct >= 80 && criticalMisses === 0 };
    },

    prevQuestion() { if (this.currentQuestion > 0) { this.currentQuestion--; this.render(); } },
    nextQuestion() { if (this.currentQuestion < this.questions.length - 1) { this.currentQuestion++; this.render(); } },
    goToQuestion(index) { this.currentQuestion = index; this.render(); },

    showResults() {
        const container = document.getElementById('tab-quiz');
        const { total, correct, pct, criticalMisses, passed } = this.calculateResult();
        const reviewWasDue = ProgressManager.isReviewDue(this.currentQuiz);
        ProgressManager.saveQuizScore(this.currentQuiz, correct, total, criticalMisses);
        if (passed && reviewWasDue) ProgressManager.recordReview(this.currentQuiz, true);

        container.innerHTML = `
            <div class="quiz-results fade-in">
                <h2>${passed ? '🎉 Quiz Passed!' : '📝 Keep Studying'}</h2>
                <div class="score-display ${passed ? 'passed' : 'failed'}">${pct}%</div>
                <p>${correct} out of ${total} correct</p>
                <p style="color:var(--text-secondary);margin:12px 0">${passed
                    ? 'You passed the 80% threshold and the critical concept check.'
                    : criticalMisses > 0
                        ? 'Review the first critical concept and try again. Critical questions must be correct.'
                        : 'You need 80% to pass. Review the material and try again.'}</p>
                <div style="display:flex;gap:12px;justify-content:center;margin-top:20px">
                    <button class="btn-secondary" data-quiz-action="retake-quiz">↺ Retake Quiz</button>
                    <button class="btn-primary" data-quiz-action="review-material">📖 Review Material</button>
                </div>
                <div style="margin-top:32px;text-align:left">
                    <h3 style="margin-bottom:16px">Question Review:</h3>
                    ${this.questions.map((q, i) => `
                        <div style="padding:12px;margin-bottom:8px;border-radius:8px;background:${this.answers[i] === q.correct ? '#e6f9e6' : '#fde7e9'}">
                            <strong>${i + 1}. ${this.answers[i] === q.correct ? '✓' : '✗'}</strong> ${this.escapeHtml(q.question).substring(0, 100)}...
                            ${this.answers[i] !== q.correct ? `<br><small style="color:var(--success)">Correct: ${this.escapeHtml(q.options[q.correct])}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>`;
        app.updateProgress();
        if (app.currentModule && typeof MasteryEngine !== 'undefined') {
            MasteryEngine.renderModulePanel(app.currentModule);
            MasteryEngine.renderDashboard(MODULES);
        }
    },

    escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
};
