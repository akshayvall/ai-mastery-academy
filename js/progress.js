/* ============================================
   PROGRESS TRACKING — localStorage based
   ============================================ */

const ProgressManager = {
    STORAGE_KEY: 'ai-mastery-academy-progress',
    MAX_IMPORT_BYTES: 1024 * 1024,

    getProgress() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? this.normalizeProgress(JSON.parse(data)) : this.defaultProgress();
        } catch { return this.defaultProgress(); }
    },

    defaultProgress() {
        return {
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
            visitedSections: {}
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

        return {
            completedModules: stringArray(data.completedModules),
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
            visitedSections
        };
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

    saveQuizScore(moduleId, score, total) {
        const progress = this.getProgress();
        progress.quizScores[moduleId] = { score, total, date: new Date().toISOString() };
        this.saveProgress(progress);
        return progress;
    },

    completeLab(moduleId) {
        const progress = this.getProgress();
        if (!progress.completedLabs.includes(moduleId)) progress.completedLabs.push(moduleId);
        this.saveProgress(progress);
        return progress;
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
