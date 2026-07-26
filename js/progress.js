/* ============================================
   PROGRESS TRACKING — localStorage based
   ============================================ */

const ProgressManager = {
    STORAGE_KEY: 'ai-mastery-academy-progress',
    MAX_IMPORT_BYTES: 1024 * 1024,
    CURRENT_SCHEMA_VERSION: 2,
    REVIEW_INTERVAL_DAYS: [1, 3, 7, 21, 60],

    getProgress() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? this.normalizeProgress(JSON.parse(data)) : this.defaultProgress();
        } catch { return this.defaultProgress(); }
    },

    defaultProgress() {
        return {
            schemaVersion: this.CURRENT_SCHEMA_VERSION,
            completedModules: [],
            quizScores: {},
            completedLabs: [],
            flashcardsReviewed: [],
            interactiveCompleted: [],
            lastVisited: null,
            streak: { count: 0, lastDate: null },
            startDate: new Date().toISOString(),
            totalTimeMinutes: 0,
            notes: {},
            labSteps: {},
            visitedSections: {},
            diagnostic: null,
            moduleMastery: {}
        };
    },

    normalizeProgress(data) {
        const defaults = this.defaultProgress();
        const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
        const stringArray = value => Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
        const quizScores = isRecord(data.quizScores)
            ? Object.fromEntries(Object.entries(data.quizScores).filter(([, score]) =>
                isRecord(score) && Number.isFinite(score.score) && Number.isFinite(score.total) &&
                score.score >= 0 && score.total > 0 && score.score <= score.total))
            : {};
        const labSteps = isRecord(data.labSteps)
            ? Object.fromEntries(Object.entries(data.labSteps)
                .filter(([, steps]) => Array.isArray(steps))
                .map(([moduleId, steps]) => [moduleId, steps.map(step => step === true ? true : null)]))
            : {};
        const visitedSections = isRecord(data.visitedSections)
            ? Object.fromEntries(Object.entries(data.visitedSections)
                .map(([moduleId, sections]) => [moduleId, stringArray(sections)]))
            : {};

        const completedModules = stringArray(data.completedModules);
        const moduleMastery = isRecord(data.moduleMastery)
            ? Object.fromEntries(Object.entries(data.moduleMastery)
                .filter(([moduleId, value]) => typeof moduleId === 'string' && isRecord(value))
                .map(([moduleId, value]) => [moduleId, this.normalizeMasteryEntry(value)]))
            : {};
        completedModules.forEach(moduleId => {
            if (!moduleMastery[moduleId]) {
                moduleMastery[moduleId] = this.normalizeMasteryEntry({
                    state: 'learned',
                    legacy: true,
                    contentReviewed: true
                });
            }
        });

        return {
            schemaVersion: this.CURRENT_SCHEMA_VERSION,
            completedModules,
            quizScores,
            completedLabs: stringArray(data.completedLabs),
            flashcardsReviewed: stringArray(data.flashcardsReviewed),
            interactiveCompleted: stringArray(data.interactiveCompleted),
            lastVisited: typeof data.lastVisited === 'string' ? data.lastVisited : null,
            streak: isRecord(data.streak) && Number.isFinite(data.streak.count)
                ? { count: Math.max(0, data.streak.count), lastDate: typeof data.streak.lastDate === 'string' ? data.streak.lastDate : null }
                : defaults.streak,
            startDate: typeof data.startDate === 'string' ? data.startDate : defaults.startDate,
            totalTimeMinutes: Number.isFinite(data.totalTimeMinutes) && data.totalTimeMinutes >= 0 ? data.totalTimeMinutes : 0,
            notes: isRecord(data.notes) ? data.notes : {},
            labSteps,
            visitedSections,
            diagnostic: isRecord(data.diagnostic) && typeof data.diagnostic.recommendedModuleId === 'string'
                ? {
                    recommendedModuleId: data.diagnostic.recommendedModuleId,
                    score: Math.max(0, Number(data.diagnostic.score) || 0),
                    total: Math.max(1, Number(data.diagnostic.total) || 1),
                    answers: Array.isArray(data.diagnostic.answers) ? data.diagnostic.answers.slice(0, 50) : [],
                    completedAt: typeof data.diagnostic.completedAt === 'string' ? data.diagnostic.completedAt : null
                }
                : null,
            moduleMastery
        };
    },

    normalizeMasteryEntry(value) {
        const isRecord = item => item && typeof item === 'object' && !Array.isArray(item);
        const quiz = isRecord(value.quiz) && Number.isFinite(value.quiz.latestScore) && Number.isFinite(value.quiz.total)
            ? {
                firstScore: Number.isFinite(value.quiz.firstScore) ? value.quiz.firstScore : value.quiz.latestScore,
                latestScore: value.quiz.latestScore,
                total: Math.max(1, value.quiz.total),
                criticalMisses: Math.max(0, Number(value.quiz.criticalMisses) || 0),
                completedAt: typeof value.quiz.completedAt === 'string' ? value.quiz.completedAt : null
            }
            : null;
        const transfer = isRecord(value.transfer) && Number.isFinite(value.transfer.score) && Number.isFinite(value.transfer.max)
            ? {
                score: value.transfer.score,
                max: Math.max(1, value.transfer.max),
                scores: Array.isArray(value.transfer.scores) ? value.transfer.scores.slice(0, 4) : [],
                reflection: typeof value.transfer.reflection === 'string' ? value.transfer.reflection.slice(0, 4000) : '',
                completedAt: typeof value.transfer.completedAt === 'string' ? value.transfer.completedAt : null
            }
            : null;
        const review = isRecord(value.review) ? value.review : {};
        return {
            state: ['not_started', 'learned', 'practiced', 'demonstrated', 'durable'].includes(value.state) ? value.state : 'not_started',
            legacy: value.legacy === true,
            contentReviewed: value.contentReviewed === true,
            quiz,
            lab: {
                completed: value.lab && value.lab.completed === true,
                completedAt: value.lab && typeof value.lab.completedAt === 'string' ? value.lab.completedAt : null
            },
            transfer,
            review: {
                successfulReviews: Math.max(0, Number(review.successfulReviews) || 0),
                intervalIndex: Math.max(0, Number(review.intervalIndex) || 0),
                nextDue: typeof review.nextDue === 'string' ? review.nextDue : null,
                attempts: Array.isArray(review.attempts) ? review.attempts.slice(-20) : []
            }
        };
    },

    ensureMasteryEntry(progress, moduleId) {
        if (!progress.moduleMastery) progress.moduleMastery = {};
        if (!progress.moduleMastery[moduleId]) {
            progress.moduleMastery[moduleId] = this.normalizeMasteryEntry({});
        }
        return progress.moduleMastery[moduleId];
    },

    addDays(isoDate, days) {
        const date = new Date(isoDate);
        date.setUTCDate(date.getUTCDate() + days);
        return date.toISOString();
    },

    markContentReviewed(moduleId) {
        const progress = this.getProgress();
        const entry = this.ensureMasteryEntry(progress, moduleId);
        entry.contentReviewed = true;
        if (entry.state === 'not_started') entry.state = 'learned';
        this.saveProgress(progress);
        return progress;
    },

    saveDiagnosticResult(recommendedModuleId, score, total, answers) {
        const progress = this.getProgress();
        progress.diagnostic = {
            recommendedModuleId,
            score,
            total,
            answers: Array.isArray(answers) ? answers.slice(0, 50) : [],
            completedAt: new Date().toISOString()
        };
        this.saveProgress(progress);
        return progress;
    },

    saveProgress(progress) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress)); }
        catch (e) { console.error('Failed to save progress:', e); }
    },

    completeModule(moduleId) {
        const progress = this.getProgress();
        if (!progress.completedModules.includes(moduleId)) progress.completedModules.push(moduleId);
        this.updateStreak(progress);
        this.saveProgress(progress);
        return progress;
    },

    uncompleteModule(moduleId) {
        const progress = this.getProgress();
        progress.completedModules = progress.completedModules.filter(id => id !== moduleId);
        this.saveProgress(progress);
        return progress;
    },

    saveQuizScore(moduleId, score, total, criticalMisses = 0) {
        const progress = this.getProgress();
        const completedAt = new Date().toISOString();
        progress.quizScores[moduleId] = { score, total, criticalMisses, date: completedAt };
        const entry = this.ensureMasteryEntry(progress, moduleId);
        entry.contentReviewed = true;
        entry.quiz = {
            firstScore: entry.quiz ? entry.quiz.firstScore : score,
            latestScore: score,
            total,
            criticalMisses: Math.max(0, criticalMisses),
            completedAt
        };
        entry.review.nextDue = entry.review.nextDue || this.addDays(completedAt, this.REVIEW_INTERVAL_DAYS[0]);
        this.saveProgress(progress);
        return progress;
    },

    completeLab(moduleId) {
        const progress = this.getProgress();
        if (!progress.completedLabs.includes(moduleId)) progress.completedLabs.push(moduleId);
        const entry = this.ensureMasteryEntry(progress, moduleId);
        entry.contentReviewed = true;
        entry.lab = { completed: true, completedAt: new Date().toISOString() };
        this.saveProgress(progress);
        return progress;
    },

    saveTransferResult(moduleId, score, max, reflection = '', scores = []) {
        const progress = this.getProgress();
        const entry = this.ensureMasteryEntry(progress, moduleId);
        entry.contentReviewed = true;
        entry.transfer = {
            score,
            max: Math.max(1, max),
            scores: Array.isArray(scores) ? scores.slice(0, 4) : [],
            reflection: String(reflection).trim().slice(0, 4000),
            completedAt: new Date().toISOString()
        };
        this.saveProgress(progress);
        return progress;
    },

    recordReview(moduleId, passed, reviewedAt = new Date().toISOString()) {
        const progress = this.getProgress();
        const entry = this.ensureMasteryEntry(progress, moduleId);
        entry.review.attempts.push({ passed: passed === true, reviewedAt });
        entry.review.attempts = entry.review.attempts.slice(-20);
        if (passed) {
            entry.review.successfulReviews += 1;
            entry.review.intervalIndex = Math.min(entry.review.successfulReviews, this.REVIEW_INTERVAL_DAYS.length - 1);
        } else {
            entry.review.intervalIndex = 0;
        }
        const interval = this.REVIEW_INTERVAL_DAYS[entry.review.intervalIndex];
        entry.review.nextDue = this.addDays(reviewedAt, interval);
        this.saveProgress(progress);
        return progress;
    },

    getMasteryStatus(moduleId, requirements = {}) {
        const progress = this.getProgress();
        const entry = this.ensureMasteryEntry(progress, moduleId);
        const quizRequired = requirements.quiz === true;
        const labRequired = requirements.lab === true;
        const transferRequired = requirements.transfer === true;
        const quizPassed = !quizRequired || Boolean(entry.quiz &&
            entry.quiz.latestScore / entry.quiz.total >= 0.8 && entry.quiz.criticalMisses === 0);
        const labPassed = !labRequired || entry.lab.completed;
        const transferPassed = !transferRequired || Boolean(entry.transfer &&
            entry.transfer.score / entry.transfer.max >= 0.75 && entry.transfer.reflection.length >= 20);
        const learned = entry.legacy || (quizRequired ? Boolean(entry.quiz) && quizPassed : entry.contentReviewed);
        let state = learned ? 'learned' : 'not_started';
        if (learned && quizPassed && labPassed) state = 'practiced';
        if (state === 'practiced' && transferRequired && transferPassed) state = 'demonstrated';
        if (state === 'demonstrated' && entry.review.successfulReviews >= 4) state = 'durable';
        entry.state = state;
        const missing = [];
        if (!quizPassed) missing.push('quiz');
        if (!labPassed) missing.push('lab');
        if (transferRequired && !transferPassed) missing.push('transfer');
        if (state === 'demonstrated' && entry.review.successfulReviews < 4) missing.push('spaced review');
        return { state, missing, entry, quizPassed, labPassed, transferPassed };
    },

    getDueReviews(now = new Date().toISOString()) {
        const progress = this.getProgress();
        const nowMs = new Date(now).getTime();
        return Object.entries(progress.moduleMastery)
            .filter(([, entry]) => entry.transfer && entry.transfer.score / entry.transfer.max >= 0.75 &&
                entry.review.nextDue && new Date(entry.review.nextDue).getTime() <= nowMs)
            .sort(([, left], [, right]) => new Date(left.review.nextDue) - new Date(right.review.nextDue))
            .map(([moduleId]) => moduleId);
    },

    isReviewDue(moduleId, now = new Date().toISOString()) {
        return this.getDueReviews(now).includes(moduleId);
    },

    // ─── PER-STEP LAB PERSISTENCE ────────────────
    // Ported from ai-builder-academy: lab checklists survive reloads.
    // Stored as { "moduleId": [true, null, true, ...] }
    getLabSteps(moduleId, total) {
        const progress = this.getProgress();
        const saved = (progress.labSteps && progress.labSteps[moduleId]) || [];
        const arr = new Array(total).fill(null);
        saved.forEach((v, i) => { if (i < total) arr[i] = v; });
        return arr;
    },

    saveLabSteps(moduleId, stepResults) {
        const progress = this.getProgress();
        if (!progress.labSteps) progress.labSteps = {};
        progress.labSteps[moduleId] = stepResults;
        this.saveProgress(progress);
    },

    completeInteractive(exerciseId) {
        const progress = this.getProgress();
        if (!progress.interactiveCompleted.includes(exerciseId)) progress.interactiveCompleted.push(exerciseId);
        this.saveProgress(progress);
        return progress;
    },

    setLastVisited(moduleId) {
        const progress = this.getProgress();
        progress.lastVisited = moduleId;
        this.saveProgress(progress);
    },

    updateStreak(progress) {
        const today = new Date().toISOString().split('T')[0];
        if (progress.streak.lastDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (progress.streak.lastDate === yesterday) { progress.streak.count++; }
        else if (progress.streak.lastDate !== today) { progress.streak.count = 1; }
        progress.streak.lastDate = today;
    },

    getStats() {
        const progress = this.getProgress();
        return {
            modulesCompleted: progress.completedModules.length,
            quizzesPassed: Object.values(progress.quizScores).filter(q => (q.score / q.total) >= 0.7).length,
            labsCompleted: progress.completedLabs.length,
            streak: progress.streak.count,
            interactiveCompleted: progress.interactiveCompleted.length
        };
    },

    getModuleStatus(moduleId) {
        const progress = this.getProgress();
        return {
            completed: progress.completedModules.includes(moduleId),
            quizScore: progress.quizScores[moduleId] || null,
            labCompleted: progress.completedLabs.includes(moduleId)
        };
    },

    resetAll() { localStorage.removeItem(this.STORAGE_KEY); },

    exportProgress() {
        const progress = this.getProgress();
        const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-academy-progress-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importProgress(file) {
        return new Promise((resolve, reject) => {
            if (!file.name.toLowerCase().endsWith('.json')) {
                reject(new Error('Progress file must be JSON'));
                return;
            }
            if (file.size > this.MAX_IMPORT_BYTES) {
                reject(new Error('Progress file is too large'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const validRoot = data && typeof data === 'object' && !Array.isArray(data);
                    const validRequiredFields = validRoot && Array.isArray(data.completedModules) &&
                        data.quizScores && typeof data.quizScores === 'object' && !Array.isArray(data.quizScores);
                    if (!validRequiredFields) throw new Error('Invalid progress file format');
                    const normalized = this.normalizeProgress(data);
                    this.saveProgress(normalized);
                    resolve(normalized);
                } catch (err) { reject(err); }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    getLevelProgress(level) {
        const progress = this.getProgress();
        const allModules = typeof MODULES !== 'undefined' ? MODULES : [];
        const levelModules = allModules.filter(m => m.level === level);
        const completed = levelModules.filter(m => progress.completedModules.includes(m.id));
        return { completed: completed.length, total: levelModules.length };
    },

    // ─── SECTION-LEVEL VISIT TRACKING ────────────
    // Stores visited sections as { "moduleId": ["slug1", "slug2", ...] }
    markSectionVisited(moduleId, sectionSlug) {
        const progress = this.getProgress();
        if (!progress.visitedSections) progress.visitedSections = {};
        if (!progress.visitedSections[moduleId]) progress.visitedSections[moduleId] = [];
        if (!progress.visitedSections[moduleId].includes(sectionSlug)) {
            progress.visitedSections[moduleId].push(sectionSlug);
        }
        this.saveProgress(progress);
    },

    isSectionVisited(moduleId, sectionSlug) {
        const progress = this.getProgress();
        if (!progress.visitedSections) return false;
        const visited = progress.visitedSections[moduleId];
        return visited ? visited.includes(sectionSlug) : false;
    },

    getSectionVisits(moduleId) {
        const progress = this.getProgress();
        if (!progress.visitedSections) return [];
        return progress.visitedSections[moduleId] || [];
    },

    areAllSectionsVisited(moduleId, sectionSlugs) {
        if (!sectionSlugs || sectionSlugs.length === 0) return false;
        const visited = this.getSectionVisits(moduleId);
        return sectionSlugs.every(slug => visited.includes(slug));
    }
};
