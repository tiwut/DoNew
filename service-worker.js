// Versionsname des Caches. Erhöhe diese Zahl, wenn du Dateien änderst.
const CACHE_NAME = 'donew-cache-v1';

// Eine Liste aller Dateien, die beim ersten Besuch gecacht werden sollen.
// Stelle sicher, dass diese Liste alle kritischen Assets deiner Website enthält.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icon.ico',
  '/images/apple-touch-icon.png',
  '/images/icon.png',
  '/images/icon-512x512.png',
  '/images/ATX_PC_Hardware.png',
  '/cookie.notice.js',
  '/social_media.js',
  '/pwa.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap',
  'https://donew.tiwut.de/images/main.avif',
  'https://donew.tiwut.de/media/gaming/review-cybernetic_dawn/',
  'https://donew.tiwut.de/media/hardware/build-the-neon_beast/',
  'https://donew.tiwut.de/media/hardware/review-quantum-gpu_series/',
  'https://donew.tiwut.de/media/hardware/market_watch-ram_prices/',
  'https://donew.tiwut.de/media/software/essential_gamers_toolkit/',
  'https://donew.tiwut.de/media/software/pro_tip-gpu_undervolting/',
  'https://donew.tiwut.de/media/software/security_alert-driver_scams/'
];

// 1. Installations-Event: Caching der statischen Ressourcen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Aktivierungs-Event: Alte Cache-Versionen löschen
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Alten Cache löschen: ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// 3. Fetch-Event: Abfangen von Netzwerkanfragen
self.addEventListener('fetch', event => {
  // Ignoriere Anfragen, die nicht mit http(s) beginnen, wie z.B. Chrome-Erweiterungen.
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache-Treffer vorhanden, zurückgeben.
          if (response) {
            return response;
          }
          
          // Kein Cache-Treffer, die Anfrage über das Netzwerk senden.
          const fetchRequest = event.request.clone();
          return fetch(fetchRequest)
            .then(fetchResponse => {
              // Wenn die Antwort ungültig ist, nicht cachen.
              if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                return fetchResponse;
              }
              
              // Die gültige Antwort im Cache speichern und zurückgeben.
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return fetchResponse;
            })
            .catch(error => {
              // Fehler bei Netzwerkanfrage, z.B. wenn offline.
              console.log('Fetch fehlgeschlagen, offline: ' + error);
              // Hier könntest du eine Offline-Seite zurückgeben, z.B. ein statisches "Offline"-HTML.
              // return caches.match('/offline.html');
            });
        })
    );
  }
});
