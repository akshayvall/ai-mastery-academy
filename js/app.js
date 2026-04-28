/* ============================================
   MAIN APP CONTROLLER — AI MASTERY ACADEMY
   ============================================ */

// Combine all modules. EXTRAS are inserted into the correct level
// groups so the sidebar order is: phase → standalone diagrams → PM playbook.
const _EXTRAS = (typeof MODULES_EXTRAS !== 'undefined') ? MODULES_EXTRAS : [];
const _PM = (typeof MODULES_PM !== 'undefined') ? MODULES_PM : [];
const MODULES = [
    ...MODULES_100,
    ..._EXTRAS.filter(m => m.level === 100),
    ...MODULES_200,
    ..._EXTRAS.filter(m => m.level === 200),
    ..._PM.filter(m => m.level === 200),
    ...MODULES_300,
    ..._EXTRAS.filter(m => m.level === 300),
    ..._PM.filter(m => m.level === 300),
];

const app = {
    currentModule: null,
    currentTab: 'learn',

    init() {
        this.buildNavigation();
        this.updateProgress();
        this.bindEvents();
        this.showDashboard();

        const hash = window.location.hash.slice(1);
        if (hash) {
            const mod = MODULES.find(m => m.id === hash);
            if (mod) this.loadModule(mod.id);
        }
    },

    buildNavigation() {
        const levels = { 100: 'nav-level-100', 200: 'nav-level-200', 300: 'nav-level-300' };
        for (const [level, containerId] of Object.entries(levels)) {
            const container = document.getElementById(containerId);
            const levelModules = MODULES.filter(m => m.level === parseInt(level));
            container.innerHTML = levelModules.map(mod => {
                const status = ProgressManager.getModuleStatus(mod.id);
                const classes = [status.completed ? 'completed' : ''].filter(Boolean).join(' ');
                const timeLabel = mod.estimatedTime ? `<span class="nav-time">⏱ ${mod.estimatedTime}</span>` : '';
                return `<li class="${classes}" data-module="${mod.id}" onclick="app.loadModule('${mod.id}')">
                    <span class="nav-title">${mod.icon} ${mod.title}</span>${timeLabel}
                </li>`;
            }).join('');
        }
    },

    bindEvents() {
        document.getElementById('resetProgress').addEventListener('click', () => {
            if (confirm('Reset ALL progress? This cannot be undone.')) {
                ProgressManager.resetAll();
                this.buildNavigation();
                this.updateProgress();
                this.showDashboard();
                this.showToast('Progress reset', 'warning');
            }
        });
        document.getElementById('exportProgress').addEventListener('click', () => {
            ProgressManager.exportProgress();
            this.showToast('Progress exported!', 'success');
        });
        document.getElementById('importProgress').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await ProgressManager.importProgress(file);
                this.buildNavigation();
                this.updateProgress();
                this.showDashboard();
                this.showToast('Progress imported!', 'success');
            } catch (err) {
                this.showToast('Invalid progress file', 'error');
            }
            e.target.value = '';
        });

        // Search palette (Ctrl+K / Cmd+K)
        const openSearchBtn = document.getElementById('openSearch');
        if (openSearchBtn) openSearchBtn.addEventListener('click', () => this.openSearch());
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                this.openSearch();
            } else if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderSearchResults(searchInput.value));
            searchInput.addEventListener('keydown', (e) => this.handleSearchKey(e));
        }

        // Mobile nav toggle
        const toggle = document.getElementById('mobileNavToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const sb = document.getElementById('sidebar');
                const open = sb.classList.toggle('mobile-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }
    },

    // ─── SEARCH PALETTE ────────────────────────
    openSearch() {
        const p = document.getElementById('searchPalette');
        if (!p) return;
        p.hidden = false;
        const inp = document.getElementById('searchInput');
        inp.value = '';
        this.renderSearchResults('');
        setTimeout(() => inp.focus(), 10);
    },

    closeSearch() {
        const p = document.getElementById('searchPalette');
        if (p) p.hidden = true;
    },

    renderSearchResults(q) {
        const ul = document.getElementById('searchResults');
        if (!ul) return;
        const query = (q || '').trim().toLowerCase();
        let items = MODULES;
        if (query) {
            items = MODULES.filter(m =>
                m.title.toLowerCase().includes(query) ||
                (m.subtitle || '').toLowerCase().includes(query) ||
                (m.id || '').toLowerCase().includes(query)
            );
        }
        items = items.slice(0, 15);
        if (!items.length) { ul.innerHTML = '<li class="search-empty">No matches</li>'; return; }
        ul.innerHTML = items.map((m, i) =>
            `<li class="search-item ${i === 0 ? 'active' : ''}" data-id="${m.id}" onclick="app.pickSearch('${m.id}')">
                <span class="search-icon">${m.icon}</span>
                <span class="search-title">${this.escapeHtml(m.title)}</span>
                <span class="search-sub">L${m.level} · ${this.escapeHtml(m.subtitle || '')}</span>
            </li>`
        ).join('');
    },

    handleSearchKey(e) {
        const ul = document.getElementById('searchResults');
        if (!ul) return;
        const items = Array.from(ul.querySelectorAll('.search-item'));
        const activeIdx = items.findIndex(el => el.classList.contains('active'));
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeIdx >= 0) items[activeIdx].classList.remove('active');
            const nxt = items[Math.min(activeIdx + 1, items.length - 1)] || items[0];
            if (nxt) nxt.classList.add('active');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeIdx >= 0) items[activeIdx].classList.remove('active');
            const prv = items[Math.max(activeIdx - 1, 0)] || items[0];
            if (prv) prv.classList.add('active');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const pick = items[Math.max(0, activeIdx)];
            if (pick) this.pickSearch(pick.dataset.id);
        }
    },

    pickSearch(id) {
        this.closeSearch();
        this.loadModule(id);
    },

    showDashboard() {
        document.getElementById('dashboard').classList.add('active');
        document.getElementById('moduleView').classList.remove('active');
        document.querySelectorAll('#sidebar li').forEach(li => li.classList.remove('active'));
        window.location.hash = '';
        this.updateProgress();
    },

    loadModule(moduleId) {
        const mod = MODULES.find(m => m.id === moduleId);
        if (!mod) return;

        this.currentModule = mod;
        this.currentTab = 'learn';

        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('moduleView').classList.add('active');

        document.getElementById('moduleTitle').textContent = mod.title;
        const badge = document.getElementById('moduleLevelBadge');
        badge.textContent = `L${mod.level}`;
        badge.className = 'module-level-badge';
        badge.style.background = mod.level === 100 ? 'var(--l100-color)' :
                                  mod.level === 200 ? 'var(--l200-color)' : 'var(--l300-color)';

        const modIndex = MODULES.indexOf(mod);
        document.getElementById('moduleSectionProgress').textContent =
            `Module ${modIndex + 1} of ${MODULES.length}${mod.estimatedTime ? '  ·  ⏱ ~' + mod.estimatedTime : ''}`;

        document.getElementById('tab-learn').innerHTML = mod.learn || '<p>Content coming soon.</p>';

        // Diagrams tab
        if (typeof DiagramEngine !== 'undefined') {
            DiagramEngine.cleanup();
            if (mod.diagrams) {
                DiagramEngine.render(mod.diagrams);
            } else {
                const el = document.getElementById('tab-diagrams');
                if (el) el.innerHTML = '<p class="no-content">No visual diagrams for this module yet.</p>';
            }
        }

        if (mod.interactive) {
            InteractiveEngine.render(mod.interactive);
        } else {
            document.getElementById('tab-interactive').innerHTML = '<p>No interactive exercises for this module yet.</p>';
        }

        if (mod.quiz) {
            QuizEngine.init(mod.id, mod.quiz);
        }

        if (mod.lab) {
            LabEngine.init(mod.id, mod.lab);
        }

        document.querySelectorAll('#sidebar li').forEach(li => {
            li.classList.toggle('active', li.dataset.module === moduleId);
        });

        document.getElementById('prevModule').disabled = modIndex === 0;
        document.getElementById('nextModule').disabled = modIndex === MODULES.length - 1;

        const status = ProgressManager.getModuleStatus(moduleId);
        const completeBtn = document.getElementById('completeModule');
        if (status.completed) {
            completeBtn.textContent = '✓ Completed';
            completeBtn.style.background = 'var(--success)';
        } else {
            completeBtn.textContent = '✓ Mark Complete';
            completeBtn.style.background = '';
        }

        this.switchTab('learn');
        window.location.hash = moduleId;
        ProgressManager.setLastVisited(moduleId);
        document.getElementById('content').scrollTop = 0;

        setTimeout(() => {
            document.querySelectorAll('.accordion-header').forEach(header => {
                if (!header.dataset.bound) {
                    header.dataset.bound = 'true';
                    header.addEventListener('click', function() {
                        this.parentElement.classList.toggle('open');
                    });
                }
            });
        }, 100);
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.module-tabs .tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    },

    prevModule() {
        if (!this.currentModule) return;
        const idx = MODULES.indexOf(this.currentModule);
        if (idx > 0) this.loadModule(MODULES[idx - 1].id);
    },

    nextModule() {
        if (!this.currentModule) return;
        const idx = MODULES.indexOf(this.currentModule);
        if (idx < MODULES.length - 1) this.loadModule(MODULES[idx + 1].id);
    },

    completeModule() {
        if (!this.currentModule) return;
        const status = ProgressManager.getModuleStatus(this.currentModule.id);
        if (status.completed) {
            ProgressManager.uncompleteModule(this.currentModule.id);
            this.showToast('Module unmarked', 'warning');
        } else {
            ProgressManager.completeModule(this.currentModule.id);
            this.showToast('Module completed! 🎉', 'success');
        }
        this.buildNavigation();
        this.updateProgress();
        document.querySelectorAll('#sidebar li').forEach(li => {
            li.classList.toggle('active', li.dataset.module === this.currentModule.id);
        });
        const newStatus = ProgressManager.getModuleStatus(this.currentModule.id);
        const completeBtn = document.getElementById('completeModule');
        if (newStatus.completed) {
            completeBtn.textContent = '✓ Completed';
            completeBtn.style.background = 'var(--success)';
        } else {
            completeBtn.textContent = '✓ Mark Complete';
            completeBtn.style.background = '';
        }
    },

    startLevel(level) {
        const firstModule = MODULES.find(m => m.level === level);
        if (firstModule) this.loadModule(firstModule.id);
    },

    updateProgress() {
        const stats = ProgressManager.getStats();
        const totalModules = MODULES.length;
        const overallPct = Math.round((stats.modulesCompleted / totalModules) * 100);

        document.getElementById('overallProgress').style.width = `${overallPct}%`;
        document.getElementById('overallProgressText').textContent = `${overallPct}% Complete`;

        [100, 200, 300].forEach(level => {
            const levelModules = MODULES.filter(m => m.level === level);
            const p = ProgressManager.getProgress();
            const completed = levelModules.filter(m => p.completedModules.includes(m.id)).length;
            const pct = Math.round((completed / levelModules.length) * 100);
            const bar = document.getElementById(`l${level}Progress`);
            const text = document.getElementById(`l${level}ProgressText`);
            if (bar) bar.style.width = `${pct}%`;
            if (text) text.textContent = `${completed}/${levelModules.length} modules`;
        });

        const statModules = document.getElementById('statModules');
        const statQuizzes = document.getElementById('statQuizzes');
        const statLabs = document.getElementById('statLabs');
        const statStreak = document.getElementById('statStreak');
        if (statModules) statModules.textContent = stats.modulesCompleted;
        if (statQuizzes) statQuizzes.textContent = stats.quizzesPassed;
        if (statLabs) statLabs.textContent = stats.labsCompleted;
        if (statStreak) statStreak.textContent = stats.streak;
    },

    showToast(message, type = '') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    },

    escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = String(s == null ? '' : s);
        return d.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
