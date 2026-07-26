const CACHE_PREFIX = 'ai-mastery-academy-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const APP_SHELL_PATHS = [
    './',
    'index.html',
    'manifest.webmanifest',
    'icons/app-icon.svg',
    'css/styles.css?v=2026-07-builder-release',
    'js/progress.js?v=2026-07-builder-release',
    'js/landscape.js',
    'js/modules-100.js',
    'js/modules-200.js',
    'js/modules-300.js',
    'js/modules-extras.js',
    'js/modules-pm.js',
    'js/modules-builder.js?v=2026-07-builder-release',
    'js/mastery-content.js',
    'js/quiz-engine.js',
    'js/interactive.js',
    'js/lab-engine.js',
    'js/diagrams.js',
    'js/mastery-engine.js',
    'js/app.js?v=2026-07-builder-release'
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
    if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(INDEX_URL))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return fetch(request).then(networkResponse => {
                if (networkResponse.ok) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
                }
                return networkResponse;
            });
        })
    );
});