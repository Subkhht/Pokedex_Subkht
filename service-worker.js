// Service Worker para PWA - Pokédex
const CACHE_NAME = 'pokedex-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/favorites.html',
    '/team-builder.html',
    '/compare.html',
    '/pokedex-app/styles/main.css',
    '/pokedex-app/scripts/app.js',
    '/pokedex-app/scripts/i18n.js',
    '/pokedex-app/scripts/compare.js',
    '/pokedex-app/scripts/team-manager.js',
    '/pokedex-app/assets/pokedex.png',
    '/pokedex-app/assets/types/bug.png',
    '/pokedex-app/assets/types/dark.png',
    '/pokedex-app/assets/types/dragon.png',
    '/pokedex-app/assets/types/electric.png',
    '/pokedex-app/assets/types/fairy.png',
    '/pokedex-app/assets/types/fighting.png',
    '/pokedex-app/assets/types/fire.png',
    '/pokedex-app/assets/types/flying.png',
    '/pokedex-app/assets/types/ghost.png',
    '/pokedex-app/assets/types/grass.png',
    '/pokedex-app/assets/types/ground.png',
    '/pokedex-app/assets/types/ice.png',
    '/pokedex-app/assets/types/normal.png',
    '/pokedex-app/assets/types/poison.png',
    '/pokedex-app/assets/types/psychic.png',
    '/pokedex-app/assets/types/rock.png',
    '/pokedex-app/assets/types/steel.png',
    '/pokedex-app/assets/types/water.png',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js'
];

// Instalar Service Worker y cachear recursos
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cacheando archivos de la app');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia: Network First, fallback to Cache (para la API de Pokémon)
// Estrategia: Cache First (para recursos estáticos)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Para la API de PokeAPI, intentar red primero
    if (url.origin === 'https://pokeapi.co') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cachear la respuesta para uso offline
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar caché
                    return caches.match(request);
                })
        );
        return;
    }
    
    // Para recursos locales, usar Cache First
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(request)
                    .then((response) => {
                        // No cachear respuestas no exitosas
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                        
                        return response;
                    });
            })
    );
});

// Sincronización en segundo plano (para favoritos y equipos)
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Sincronización en segundo plano');
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    // Aquí podrías sincronizar con un backend si tuvieras uno
    console.log('[Service Worker] Sincronizando favoritos...');
}

// Notificaciones push (opcional para futuras mejoras)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Pokédex';
    const options = {
        body: data.body || 'Nueva actualización disponible',
        icon: '/pokedex-app/assets/pokedex.png',
        badge: '/pokedex-app/assets/pokedex.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
