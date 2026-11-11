const CACHE_PREFIX = 'ai-mastery-academy-';
const CACHE_NAME = `${CACHE_PREFIX}2026-11-learning-2`;
const APP_SCOPE = new URL(self.registration.scope);
const APP_SHELL_PATHS = [
    './',
    'index.html',
    'manifest.webmanifest',
    'icons/app-icon.svg',
    'css/styles.css?v=2026-11-learning-2',
    'css/learning.css?v=2026-11-learning-2',
    'css/units.css?v=2026-11-learning-2',
    'css/diagram-learning.css?v=2026-11-learning-2',
    'js/progress.js?v=2026-11-learning-2',
    'js/ui-state.js?v=2026-11-learning-2',
    'js/today-engine.js?v=2026-11-learning-2',
    'js/landscape.js?v=2026-11-learning-2',
    'js/modules-100.js?v=2026-11-learning-2',
    'js/modules-200.js?v=2026-11-learning-2',
    'js/modules-300.js?v=2026-11-learning-2',
    'js/modules-extras.js?v=2026-11-learning-2',
    'js/modules-pm.js?v=2026-11-learning-2',
    'js/modules-builder.js?v=2026-11-learning-2',
    'js/mastery-content.js?v=2026-11-learning-2',
    'js/learning-content.js?v=2026-11-learning-2',
    'js/unit-content.js?v=2026-11-learning-2',
    'js/quiz-engine.js?v=2026-11-learning-2',
    'js/interactive.js?v=2026-11-learning-2',
    'js/lab-engine.js?v=2026-11-learning-2',
    'js/diagrams.js?v=2026-11-learning-2',
    'js/mastery-engine.js?v=2026-11-learning-2',
    'js/learning-engine.js?v=2026-11-learning-2',
    'js/unit-engine.js?v=2026-11-learning-2',
    'js/portfolio-engine.js?v=2026-11-learning-2',
    'js/editorial-engine.js?v=2026-11-learning-2',
    'js/app.js?v=2026-11-learning-2'
];

const resolveFromScope = path => new URL(path, self.registration.scope).href;
const APP_SHELL_URLS = APP_SHELL_PATHS.map(resolveFromScope);
const INDEX_URL = resolveFromScope('index.html');

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys
                .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                .map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const requestUrl = new URL(request.url);
    if (request.method !== 'GET' || requestUrl.origin !== APP_SCOPE.origin || !requestUrl.pathname.startsWith(APP_SCOPE.pathname)) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            caches.open(CACHE_NAME)
                .then(cache => cache.match(INDEX_URL))
                .then(cachedIndex => cachedIndex || fetch(request))
        );
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            const cachedResponse = await cache.match(request);
            if (cachedResponse) return cachedResponse;
            const networkResponse = await fetch(request);
            if (networkResponse.ok) event.waitUntil(cache.put(request, networkResponse.clone()));
            return networkResponse;
        })
    );
});