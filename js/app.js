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
    ...((typeof MODULES_BUILDER !== 'undefined') ? MODULES_BUILDER : []),
];
const CONTENT_LAST_VERIFIED = MODEL_LANDSCAPE.verified;
const WORKFLOW_PROTOTYPE_ID = 'phase4-memory-rag';

// Cache parsed sections per module so we only parse HTML once
const _sectionCache = {};

const app = {
    currentModule: null,
    currentTab: 'learn',
    _pendingSection: null, // section slug to scroll to after render
    _eventsBound: false,
    _mobileNavOpener: null,

    init() {
        this.buildNavigation();
        this.updateProgress();
        this.bindEvents();
        LearningEngine.init(MODULES);
        UnitEngine.init();
        PortfolioEngine.init();
        LearningEngine.renderPreferences();
        this.registerServiceWorker();
        MasteryEngine.init(MODULES);

        window.addEventListener('popstate', () => this.syncHashRoute());
        this.syncHashRoute();
    },

    // ─── SECTION PARSING ─────────────────────────
    // Converts "The RAG Pipeline" → "the-rag-pipeline"
    slugify(text) {
        return text.toLowerCase().trim()
            .replace(/&[^;]+;/g, '')       // strip HTML entities
            .replace(/<[^>]+>/g, '')        // strip HTML tags
            .replace(/[^\w\s-]/g, '')       // strip non-word chars
            .replace(/\s+/g, '-')           // spaces → hyphens
            .replace(/-+/g, '-')            // collapse consecutive hyphens
            .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
    },

    // Parse <h2> headings from a module's learn HTML and return
    // an array of { slug, title } objects.
    parseSections(mod) {
        if (this.currentModule?.id === mod.id && document.getElementById('moduleCoaching')) {
            return Array.from(document.querySelectorAll('#tab-learn h2')).map(heading => ({ slug: this.slugify(heading.textContent), title: heading.textContent.trim() }));
        }
        if (_sectionCache[mod.id]) return _sectionCache[mod.id];
        if (!mod.learn) { _sectionCache[mod.id] = []; return []; }

        const sections = [];
        // Match <h2> tags, capturing inner text (handles attributes on the tag)
        const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
        let match;
        while ((match = h2Regex.exec(mod.learn)) !== null) {
            // Strip any nested tags to get plain text
            const text = document.createElement('template');
            text.innerHTML = match[1];
            const plainText = text.content.textContent.trim();
            if (plainText) {
                sections.push({ slug: this.slugify(plainText), title: plainText });
            }
        }
        _sectionCache[mod.id] = sections;
        return sections;
    },

    // ─── NAVIGATION ──────────────────────────────
    buildNavigation() {
        const levels = { 100: 'nav-level-100', 200: 'nav-level-200', 300: 'nav-level-300', 400: 'nav-level-400' };
        for (const [level, containerId] of Object.entries(levels)) {
            const container = document.getElementById(containerId);
            const levelModules = MODULES.filter(m => m.level === parseInt(level));
            const renderModule = mod => {
                const sections = this.parseSections(mod);
                const allVisited = sections.length > 0 &&
                    ProgressManager.areAllSectionsVisited(mod.id, sections.map(s => s.slug));
                const status = ProgressManager.getModuleStatus(mod.id);
                const metadata = MasteryEngine.getMetadata(mod.id);
                const mastery = metadata ? MasteryEngine.getStatus(mod) : null;
                const completed = mastery
                    ? MasteryEngine.STATE_RANK[mastery.state] >= MasteryEngine.STATE_RANK.practiced
                    : status.completed || allVisited;
                const liClasses = ['nav-module', completed ? 'completed' : '', MasteryEngine.isActivity(mod.id) ? 'nav-activity' : ''].filter(Boolean).join(' ');
                const timeLabel = mod.estimatedTime ? `<span class="nav-time">⏱ ${mod.estimatedTime}</span>` : '';
                const checkMark = completed ? '<span class="module-check">✓</span>' : '';

                // Build sub-section list
                let sectionsHtml = '';
                if (sections.length > 0) {
                    const sectionItems = sections.map(sec => {
                        const visited = ProgressManager.isSectionVisited(mod.id, sec.slug);
                        return `<li><button type="button" class="section-link ${visited ? 'section-visited' : ''}" data-id="${mod.id}" data-section="${sec.slug}">${this.escapeHtml(sec.title)}</button></li>`;
                    }).join('');
                    sectionsHtml = `<ul class="module-sections collapsed">${sectionItems}</ul>`;
                }

                return `<li class="${liClasses}" data-module="${mod.id}">
                    <button type="button" class="module-link" data-id="${mod.id}">
                        <span class="module-icon">${mod.icon}</span>
                        <span class="module-title">${this.escapeHtml(mod.title)}</span>
                        ${checkMark}${timeLabel}
                    </button>
                    ${sectionsHtml}
                </li>`;
            };
            const learningModules = levelModules.filter(mod => !MasteryEngine.isActivity(mod.id));
            const activityModules = levelModules.filter(mod => MasteryEngine.isActivity(mod.id));
            const visualReview = activityModules.length ? `
                <li class="nav-activity-group">
                    <details>
                        <summary><span>Visual review</span><span>${activityModules.length}</span></summary>
                        <ul>${activityModules.map(renderModule).join('')}</ul>
                    </details>
                </li>` : '';
            container.innerHTML = learningModules.map(renderModule).join('') + visualReview;
        }

        // Bind click handlers for module links and section links
        this._bindNavClicks();
    },

    // Wire up sidebar click events (called after buildNavigation)
    _bindNavClicks() {
        // Module-level link: toggle expand + load module
        document.querySelectorAll('#sidebar .module-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                const moduleId = link.dataset.id;
                this.toggleModuleSections(moduleId);
                this.loadModule(moduleId);
            });
        });

        // Section sub-link: load module + scroll to section
        document.querySelectorAll('#sidebar .module-sections .section-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                const moduleId = link.dataset.id;
                const section = link.dataset.section;
                this.navigateToSection(moduleId, section);
            });
        });
    },

    // Expand/collapse the section list for a module
    toggleModuleSections(moduleId) {
        const navItem = document.querySelector(`#sidebar li.nav-module[data-module="${moduleId}"]`);
        if (!navItem) return;
        const sectionList = navItem.querySelector('.module-sections');
        if (!sectionList) return;

        const isExpanded = navItem.classList.contains('expanded');
        if (isExpanded) {
            navItem.classList.remove('expanded');
            sectionList.classList.add('collapsed');
        } else {
            // Collapse all other modules first
            document.querySelectorAll('#sidebar li.nav-module.expanded').forEach(li => {
                li.classList.remove('expanded');
                const ul = li.querySelector('.module-sections');
                if (ul) ul.classList.add('collapsed');
            });
            navItem.classList.add('expanded');
            sectionList.classList.remove('collapsed');
        }
    },

    // Load a module's Learn tab and smooth-scroll to a specific section heading
    navigateToSection(moduleId, sectionSlug) {
        this._pendingSection = sectionSlug;
        if (this._sectionObserver) this._sectionObserver.disconnect();

        // If the module is already loaded, just switch tab & scroll
        if (this.currentModule && this.currentModule.id === moduleId) {
            this.switchTab('learn');
            this._scrollToSection(sectionSlug);
            this._observeAfterScroll(moduleId);
        } else {
            this.loadModule(moduleId);
            // loadModule will call _scrollToSection via _pendingSection
        }
    },

    // Find the <h2> with matching id and smooth-scroll to it
    _scrollToSection(sectionSlug) {
        if (!sectionSlug) return;
        if (['transfer-evidence', 'review-evidence'].includes(sectionSlug)) {
            this.openEvidence(sectionSlug.startsWith('transfer') ? 'transfer' : 'review');
            this._pendingSection = null;
            return;
        }
        const target = document.getElementById(`section-${sectionSlug}`) || document.getElementById(sectionSlug === 'worked-example' ? 'learningWorkedTitle' : sectionSlug);
        if (target) {
            target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
            // Mark section as visited
            if (this.currentModule) {
                ProgressManager.markSectionVisited(this.currentModule.id, sectionSlug);
                UIStateManager.saveSection(this.currentModule.id, sectionSlug);
                this.currentSection = sectionSlug;
                this.setRoute(this.moduleRoute(), true);
                this._refreshSectionVisited(this.currentModule.id);
            }
        }
        this._pendingSection = null;
    },

    // Update visited CSS classes on sidebar section links (without full rebuild)
    _refreshSectionVisited(moduleId) {
        const navItem = document.querySelector(`#sidebar li.nav-module[data-module="${moduleId}"]`);
        if (!navItem) return;
        navItem.querySelectorAll('.module-sections .section-link').forEach(a => {
            const slug = a.dataset.section;
            if (ProgressManager.isSectionVisited(moduleId, slug)) {
                a.classList.add('section-visited');
            }
        });
        // Check if all sections now visited → mark completed
        const sections = this.parseSections(MODULES.find(m => m.id === moduleId));
        if (sections.length > 0 && ProgressManager.areAllSectionsVisited(moduleId, sections.map(s => s.slug))) {
            navItem.classList.add('completed');
        }
    },

    // Inject id attributes on <h2> elements inside the Learn tab so we can scroll to them
    _injectSectionIds(moduleId) {
        const sections = this.parseSections(MODULES.find(m => m.id === moduleId));
        if (!sections.length) return;

        const learnEl = document.getElementById('tab-learn');
        if (!learnEl) return;
        learnEl.querySelectorAll('h2').forEach(heading => {
            const slug = this.slugify(heading.textContent);
            heading.dataset.sectionId = slug;
            const anchorId = `section-${slug}`;
            if (!heading.id) heading.id = anchorId;
            else if (heading.id !== anchorId && !document.getElementById(anchorId)) {
                const anchor = document.createElement('span');
                anchor.id = anchorId;
                anchor.setAttribute('aria-hidden', 'true');
                heading.prepend(anchor);
            }
        });
    },

    // Set up an IntersectionObserver on section headings to auto-mark visited
    _observeSections(moduleId) {
        if (this._sectionObserver) this._sectionObserver.disconnect();

        const learnEl = document.getElementById('tab-learn');
        if (!learnEl) return;

        const contentEl = document.getElementById('content');
        const root = contentEl || null;

        this._sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.currentModule) {
                    const slug = entry.target.dataset.sectionId || entry.target.id.replace('section-', '');
                    ProgressManager.markSectionVisited(this.currentModule.id, slug);
                    this._refreshSectionVisited(this.currentModule.id);
                }
            });
        }, { root, rootMargin: '0px 0px -60% 0px', threshold: 0.1 });

        learnEl.querySelectorAll('h2[data-section-id]').forEach(h2 => {
            this._sectionObserver.observe(h2);
        });
    },

    _observeAfterScroll(moduleId) {
        const content = document.getElementById('content');
        let started = false;
        const start = () => {
            if (started) return;
            started = true;
            this._observeSections(moduleId);
        };
        content.addEventListener('scrollend', start, { once: true });
        setTimeout(start, 800);
    },

    bindEvents() {
        if (this._eventsBound) return;
        this._eventsBound = true;

        document.addEventListener('click', (event) => {
            const control = event.target.closest('[data-app-action]');
            if (!control) return;

            const actions = {
                'start-level': () => this.startLevel(Number(control.dataset.level)),
                'show-dashboard': () => this.showDashboard(),
                'switch-tab': () => this.switchTab(control.dataset.tab),
                'previous-module': () => this.prevModule(),
                'complete-module': () => this.completeModule(),
                'next-module': () => this.nextModule(),
                'close-search': () => this.closeSearch(),
                'pick-search': () => this.pickSearch(control.dataset.id),
                'set-module-mode': () => this.setModuleMode(control.dataset.moduleMode),
                'open-evidence': () => this.openEvidence(control.dataset.evidenceTarget),
                'navigate-section': () => this.navigateToSection(this.currentModule?.id, control.dataset.sectionId),
                'close-mobile-nav': () => this.closeMobileNav(),
                'navigate-destination': () => this.navigateDestination(control.dataset.destination)
            };
            actions[control.dataset.appAction]?.();
        });
        window.addEventListener('hashchange', () => this.syncHashRoute());

        document.getElementById('resetProgress').addEventListener('click', () => {
            if (confirm('Reset ALL progress? This cannot be undone.')) {
                if (!ProgressManager.resetAll()) {
                    LearningEngine.renderStorageStatus();
                    return;
                }
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
            if (!confirm('Replace progress with this backup? Export your current progress first if you need to keep it.')) { e.target.value = ''; return; }
            try {
                await ProgressManager.importProgress(file);
                this.buildNavigation();
                this.updateProgress();
                this.showDashboard();
                this.showToast('Progress imported!', 'success');
            } catch (err) {
                this.showToast(err.message || 'Progress could not be imported', 'error');
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
                this.closeMobileNav();
            } else if (e.key === 'Tab') {
                this.trapMobileNavFocus(e);
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
            toggle.addEventListener('click', () => this.toggleMobileNav());
        }
        window.addEventListener('resize', () => this.syncMobileNav());
        this.syncMobileNav();
    },

    isMobileNav() {
        return window.matchMedia('(max-width: 768px)').matches;
    },

    openMobileNav() {
        if (!this.isMobileNav()) return;
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('navBackdrop');
        const toggle = document.getElementById('mobileNavToggle');
        this._mobileNavOpener = document.activeElement;
        sidebar.removeAttribute('aria-hidden');
        sidebar.inert = false;
        sidebar.classList.add('mobile-open');
        backdrop.hidden = false;
        document.body.classList.add('nav-drawer-open');
        toggle.setAttribute('aria-expanded', 'true');
        const firstControl = sidebar.querySelector('button, a, input');
        if (firstControl) firstControl.focus({ preventScroll: true });
    },

    closeMobileNav(restoreFocus = true) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('mobile-open')) return;
        const backdrop = document.getElementById('navBackdrop');
        const toggle = document.getElementById('mobileNavToggle');
        sidebar.classList.remove('mobile-open');
        backdrop.hidden = true;
        document.body.classList.remove('nav-drawer-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (restoreFocus && this._mobileNavOpener && this._mobileNavOpener.isConnected) this._mobileNavOpener.focus();
        else if (restoreFocus) toggle.focus();
        if (this.isMobileNav()) {
            sidebar.setAttribute('aria-hidden', 'true');
            sidebar.inert = true;
        }
        this._mobileNavOpener = null;
    },

    toggleMobileNav() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('mobile-open')) this.closeMobileNav();
        else this.openMobileNav();
    },

    trapMobileNavFocus(event) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('mobile-open')) return;
        const controls = Array.from(sidebar.querySelectorAll('button:not([disabled]), a[href], input:not([disabled])')).filter(control => control.getClientRects().length);
        if (!controls.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    },

    syncMobileNav() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('navBackdrop');
        if (this.isMobileNav()) {
            if (!sidebar.classList.contains('mobile-open')) {
                sidebar.setAttribute('aria-hidden', 'true');
                sidebar.inert = true;
            }
            return;
        }
        sidebar.classList.remove('mobile-open');
        sidebar.removeAttribute('aria-hidden');
        sidebar.inert = false;
        backdrop.hidden = true;
        document.body.classList.remove('nav-drawer-open');
        document.getElementById('mobileNavToggle').setAttribute('aria-expanded', 'false');
    },

    navigateDestination(destination, route = {}) {
        if (!LearningEngine.DESTINATIONS.includes(destination)) destination = 'today';
        if (this.currentModule) LearningEngine.saveDrafts(this.currentModule.id);
        this._sectionObserver?.disconnect();
        document.getElementById('unitView').classList.remove('active');
        this.closeMobileNav(false);
        UIStateManager.setDestination(destination);
        this.updateDestinationState(destination);
        if (destination === 'today') {
            this.showDashboard();
            return;
        }
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('moduleView').classList.remove('active');
        document.getElementById('destinationView').classList.add('active');
        LearningEngine.renderDestination(destination, route);
        if (destination === 'build') document.getElementById('destinationTitle').insertAdjacentHTML('afterend', UnitEngine.localLabPack());
        if (destination === 'build') document.getElementById('localLabPack').insertAdjacentHTML('afterend', UnitEngine.specializations());
        if (destination === 'more') document.getElementById('destinationView').insertAdjacentHTML('beforeend', UnitEngine.progressSummary());
        if (destination === 'more') {
            PortfolioEngine.render(route.portfolio || (UIStateManager.get().activePath === 'ai-product-judgment' ? 'pm' : 'builder'));
            EditorialEngine.render();
        }
        if (destination === 'build') document.getElementById('destinationView').insertAdjacentHTML('beforeend',
            '<section class="learning-group"><h2>Short practice, no setup</h2><p><a href="#today">Continue the beginner path</a> or <a href="#practice" data-destination="practice">open scheduled review and practice</a>. These exercises use synthetic examples without calling a model.</p></section>');
        this.currentModule = null;
        this.setRoute({ ...route, destination, moduleId: null });
        document.getElementById('content').scrollTop = 0;
        document.getElementById('destinationTitle')?.focus({ preventScroll: true });
    },

    updateDestinationState(destination) {
        document.querySelectorAll('[data-destination]').forEach(item => {
            const primary = item.closest('.workspace-nav, .bottom-nav');
            const target = primary && destination === 'learn' ? 'today' : primary && destination === 'practice' ? 'build' : destination;
            const active = item.dataset.destination === target;
            item.classList.toggle('active', active);
            if (active) item.setAttribute('aria-current', 'page');
            else item.removeAttribute('aria-current');
        });
    },

    setRoute(route, replace = false) {
        if (this.routing || this.loadingModule) return;
        const hash = LearningEngine.formatRoute(route);
        if (window.location.hash === hash) return;
        window.history[replace ? 'replaceState' : 'pushState'](null, '', hash);
    },

    moduleRoute() {
        return { moduleId: this.currentModule?.id, tab: this.currentTab, sectionId: this.currentSection, mode: this.currentMode, reference: true };
    },

    isWorkflowPrototype(moduleId) {
        return typeof LEARNING_CONTENT !== 'undefined' ? Boolean(LEARNING_CONTENT.modules[moduleId]) : moduleId === WORKFLOW_PROTOTYPE_ID;
    },

    setModuleMode(mode) {
        if (!this.currentModule || !this.isWorkflowPrototype(this.currentModule.id)) return;
        const normalizedMode = mode === 'browse' ? 'browse' : 'guided';
        this.currentMode = normalizedMode;
        UIStateManager.saveMode(this.currentModule.id, normalizedMode);
        const moduleView = document.getElementById('moduleView');
        moduleView.classList.toggle('guided-mode', normalizedMode === 'guided');
        moduleView.classList.toggle('browse-mode', normalizedMode === 'browse');
        document.querySelectorAll('[data-module-mode]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.moduleMode === normalizedMode));
        });
        this.setRoute(this.moduleRoute(), true);
    },

    openEvidence(target) {
        const disclosure = document.querySelector('#masteryPanel .evidence-disclosure');
        if (!disclosure) return;
        disclosure.open = true;
        disclosure.dataset.focusTarget = target || 'evidence';
        this.currentSection = target === 'review' ? 'review-evidence' : 'transfer-evidence';
        this.setRoute(this.moduleRoute(), true);
        disclosure.scrollIntoView({ behavior: 'smooth', block: 'start' });
        disclosure.querySelector('summary')?.focus();
    },

    renderSectionOutline(module) {
        const outline = document.getElementById('sectionOutline');
        const list = document.getElementById('sectionOutlineList');
        const sections = this.isWorkflowPrototype(module.id) ? this.parseSections(module) : [];
        outline.hidden = sections.length === 0;
        if (!sections.length) {
            list.innerHTML = '';
            return;
        }
        list.innerHTML = sections.map(section => `
            <li><button type="button" data-app-action="navigate-section" data-section-id="${section.slug}">${this.escapeHtml(section.title)}</button></li>`).join('');
        outline.open = !window.matchMedia('(max-width: 1023px)').matches;
    },

    renderInlineCoreVisual(module) {
        document.getElementById('inlineCoreVisual')?.remove();
        if (!this.isWorkflowPrototype(module.id) || !module.diagrams?.length || typeof DiagramEngine.renderPreview !== 'function') return;
        const firstSection = document.querySelector('#tab-learn .learn-section');
        if (!firstSection) return;
        const preview = document.createElement('section');
        preview.id = 'inlineCoreVisual';
        preview.className = 'inline-core-visual';
        preview.setAttribute('aria-label', 'Core visual');
        firstSection.insertAdjacentElement('afterend', preview);
        DiagramEngine.renderPreview(module.diagrams[0], preview);
    },

    configureModuleExperience(module) {
        const enabled = this.isWorkflowPrototype(module.id);
        const moduleView = document.getElementById('moduleView');
        document.getElementById('moduleModeBar').hidden = !enabled;
        moduleView.classList.toggle('workflow-prototype', enabled);
        moduleView.classList.remove('guided-mode', 'browse-mode');
        this.renderSectionOutline(module);
        document.querySelectorAll('.guided-stepper [data-tab], .module-tabs [data-tab]').forEach(control => {
            control.hidden = control.dataset.tab === 'diagrams' ? !module.diagrams?.length :
                control.dataset.tab === 'interactive' ? !module.interactive?.length :
                control.dataset.tab === 'quiz' ? !module.quiz?.length :
                control.dataset.tab === 'lab' ? !module.lab && !enabled : false;
        });
        if (!enabled) return;
        const uiState = UIStateManager.get(MODULES.map(item => item.id));
        if (!this._pendingSection && uiState.lastSectionByModule[module.id]) {
            this._pendingSection = uiState.lastSectionByModule[module.id];
        }
        this.setModuleMode(this.requestedMode || uiState.moduleModeByModule[module.id] || 'guided');
        this.renderInlineCoreVisual(module);
    },

    registerServiceWorker() {
        if (!['http:', 'https:'].includes(window.location.protocol) || !('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('./sw.js').catch(error => {
            console.warn('Service worker registration failed:', error);
        });
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
            `<li class="search-item ${i === 0 ? 'active' : ''}" data-app-action="pick-search" data-id="${m.id}">
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

    syncHashRoute() {
        const route = LearningEngine.parseRoute(window.location.hash);
        const module = MODULES.find(item => item.id === route.moduleId);
        this.routing = true;
        try {
            if (module) {
                if (!route.reference && UnitEngine.content().modules[module.id]) {
                    UnitEngine.open(module.id, route);
                    return;
                }
                const explicitMode = /[?&]mode=/.test(window.location.hash) ? route.mode : null;
                if (!document.getElementById('moduleView').classList.contains('active') || this.currentModule?.id !== module.id) {
                    this.loadModule(module.id, { ...route, mode: explicitMode });
                } else {
                    this.switchTab(route.tab);
                    if (explicitMode) this.setModuleMode(explicitMode);
                    if (route.sectionId) this._scrollToSection(route.sectionId);
                }
            } else this.navigateDestination(route.destination || 'today', route);
        } finally {
            this.routing = false;
        }
    },

    showDashboard() {
        if (this.currentModule) LearningEngine.saveDrafts(this.currentModule.id);
        this._sectionObserver?.disconnect();
        this.closeMobileNav(false);
        UIStateManager.setDestination('today');
        this.currentModule = null;
        document.getElementById('dashboard').classList.add('active');
        document.getElementById('moduleView').classList.remove('active');
        document.getElementById('destinationView').classList.remove('active');
        document.getElementById('unitView').classList.remove('active');
        // Clear active state on module links (not section links)
        document.querySelectorAll('#sidebar li.nav-module').forEach(li => li.classList.remove('active'));
        this.setRoute({ destination: 'today' });
        this.updateDestinationState('today');
        LearningEngine.renderPreferences();
        document.getElementById('content').scrollTop = 0;
        this.updateProgress();
    },

    loadModule(moduleId, route = {}) {
        const mod = MODULES.find(m => m.id === moduleId);
        if (!mod) return;
        if (UnitEngine.shouldOpen(moduleId, route)) {
            UnitEngine.open(moduleId, route);
            return;
        }

        if (this.currentModule) LearningEngine.saveDrafts(this.currentModule.id);
        this.loadingModule = true;
        this.closeMobileNav(false);
        this._sectionObserver?.disconnect();
        this.currentSection = route.sectionId || null;
        this._pendingSection = route.sectionId || this._pendingSection;
        this.requestedMode = route.mode;
        this.currentModule = mod;
        this.currentTab = 'learn';

        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('destinationView').classList.remove('active');
        document.getElementById('unitView').classList.remove('active');
        document.getElementById('moduleView').classList.add('active');
        this.updateDestinationState(route.tab === 'quiz' ? 'practice' : route.tab === 'lab' ? 'build' : 'learn');

        document.getElementById('moduleTitle').textContent = mod.title;
        const badge = document.getElementById('moduleLevelBadge');
        badge.textContent = `L${mod.level}`;
        badge.className = 'module-level-badge';
        badge.style.background = mod.level === 100 ? 'var(--l100-color)' :
                                  mod.level === 200 ? 'var(--l200-color)' :
                                  mod.level === 300 ? 'var(--l300-color)' : 'var(--l400-color)';

        const modIndex = MODULES.indexOf(mod);
        const realModules = MasteryEngine.getRealModules(MODULES, ACADEMY_MASTERY);
        document.getElementById('moduleSectionProgress').textContent =
            `${MasteryEngine.isActivity(mod.id) ? 'Visual review' : `Module ${realModules.indexOf(mod) + 1} of ${realModules.length}`}${mod.estimatedTime ? '  ·  ~' + mod.estimatedTime : ''}`;

        const learnContent = mod.learn || '<p>Content coming soon.</p>';
        document.getElementById('tab-learn').innerHTML =
            `<p class="content-verification">${new Date().toISOString().slice(0, 10) > MODEL_LANDSCAPE.nextReviewDate ? 'Source review overdue. ' : ''}Model sources checked: ${CONTENT_LAST_VERIFIED}. External labs not executed.</p>${learnContent}`;
        LearningEngine.renderCoaching(mod);

        // Inject section ids on <h2> elements for scroll targeting
        this._injectSectionIds(moduleId);

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
        } else document.getElementById('tab-quiz').innerHTML = '<p>This visual activity has no assessment.</p>';

        if (mod.lab) {
            LabEngine.init(mod.id, mod.lab);
        } else document.getElementById('tab-lab').innerHTML = '';
        LearningEngine.renderLabPractice(mod);

        this.configureModuleExperience(mod);

        // Highlight the active module in sidebar
        document.querySelectorAll('#sidebar li.nav-module').forEach(li => {
            li.classList.toggle('active', li.dataset.module === moduleId);
        });

        // Auto-expand this module's sections in sidebar
        this.toggleModuleSections(moduleId);

        document.getElementById('prevModule').disabled = modIndex === 0;
        document.getElementById('nextModule').disabled = modIndex === MODULES.length - 1;

        const status = ProgressManager.getModuleStatus(moduleId);
        const completeBtn = document.getElementById('completeModule');
        const metadata = MasteryEngine.getMetadata(moduleId);
        const mastery = metadata ? MasteryEngine.getStatus(mod) : null;
        completeBtn.textContent = mastery
            ? `${MasteryEngine.STATE_LABELS[mastery.state]} · Check my progress`
            : status.completed ? '✓ Activity complete' : 'Mark activity complete';
        completeBtn.style.background = mastery && MasteryEngine.STATE_RANK[mastery.state] >= MasteryEngine.STATE_RANK.practiced
            ? 'var(--success)' : '';
        MasteryEngine.renderModulePanel(mod);
        LearningEngine.restoreDrafts(moduleId);

        this.switchTab(route.tab || 'learn');
        this.loadingModule = false;
        this.setRoute(this.moduleRoute());
        ProgressManager.setLastVisited(moduleId);
        document.getElementById('moduleTitle').tabIndex = -1;
        document.getElementById('moduleTitle').focus({ preventScroll: true });

        // If there's a pending section scroll, do it after a short delay for render
        if (this._pendingSection) {
            const slug = this._pendingSection;
            setTimeout(() => {
                if (this.currentModule?.id !== moduleId) return;
                this._scrollToSection(slug);
                this._observeAfterScroll(moduleId);
            }, 120);
        } else {
            document.getElementById('content').scrollTop = 0;
            this._observeSections(moduleId);
        }

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
        if (!LearningEngine.TABS.includes(tabName)) return;
        if (this.currentModule) LearningEngine.saveDrafts(this.currentModule.id);
        this.currentTab = tabName;
        if (this.currentModule) UIStateManager.touchModule(this.currentModule.id, tabName);
        document.querySelectorAll('.module-tabs .tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
        document.querySelectorAll('.guided-stepper [data-tab]').forEach(button => {
            const active = button.dataset.tab === tabName;
            button.classList.toggle('active', active);
            if (active) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
        this.updateDestinationState(tabName === 'quiz' || tabName === 'interactive' ? 'practice' : tabName === 'lab' ? 'build' : 'learn');
        if (this.currentModule) this.setRoute(this.moduleRoute());
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
        const metadata = MasteryEngine.getMetadata(this.currentModule.id);
        if (metadata) {
            ProgressManager.markContentReviewed(this.currentModule.id);
            const mastery = MasteryEngine.getStatus(this.currentModule);
            const nextTab = mastery.missing.includes('quiz') ? 'quiz' : mastery.missing.includes('lab') ? 'lab' : 'learn';
            const message = mastery.missing.length
                ? `Next evidence: ${mastery.missing.join(', ')}`
                : `${MasteryEngine.STATE_LABELS[mastery.state]} mastery recorded`;
            this.switchTab(nextTab);
            if (mastery.missing.includes('transfer') && nextTab === 'learn') this.openEvidence('transfer');
            this.showToast(message, mastery.missing.length ? 'warning' : 'success');
            MasteryEngine.renderModulePanel(this.currentModule);
            this.buildNavigation();
            this.updateProgress();
            document.querySelectorAll('#sidebar li.nav-module').forEach(li => {
                li.classList.toggle('active', li.dataset.module === this.currentModule.id);
            });
            return;
        }
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
        document.querySelectorAll('#sidebar li.nav-module').forEach(li => {
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
        const realModules = MasteryEngine.getRealModules(MODULES, ACADEMY_MASTERY);
        const practicedModules = realModules.filter(module =>
            MasteryEngine.STATE_RANK[MasteryEngine.getStatus(module).state] >= MasteryEngine.STATE_RANK.practiced);
        const overallPct = Math.round((practicedModules.length / realModules.length) * 100);

        document.getElementById('overallProgress').style.width = `${overallPct}%`;
        document.getElementById('overallProgressText').textContent = `${overallPct}% with module practice evidence`;

        [100, 200, 300, 400].forEach(level => {
            const levelModules = realModules.filter(m => m.level === level);
            const completed = levelModules.filter(module =>
                MasteryEngine.STATE_RANK[MasteryEngine.getStatus(module).state] >= MasteryEngine.STATE_RANK.practiced).length;
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
        if (statModules) statModules.textContent = practicedModules.length;
        if (statQuizzes) statQuizzes.textContent = stats.quizzesPassed;
        if (statLabs) statLabs.textContent = stats.labsCompleted;
        if (statStreak) statStreak.textContent = stats.streak;
        MasteryEngine.renderDashboard(MODULES);
    },

    showToast(message, type = '') {
        if (type === 'success' && !ProgressManager.getStorageStatus().saved) {
            message = ProgressManager.getStorageStatus().message;
            type = 'error';
        }
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
