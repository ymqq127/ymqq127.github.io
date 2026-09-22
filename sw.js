self.addEventListener('install', () => { self.skipWaiting() })
self.addEventListener('activate', () => { self.registration.unregister().then(() => { self.clients.matchAll().then(c => { c.forEach(i => i.navigate(i.url)) }) }) })
self.addEventListener('fetch', e => e.respondWith(fetch(e.request)))