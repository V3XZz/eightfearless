const CORE_CACHE_NAME = 'eightfearless-core-v5';
const IMAGE_CACHE_NAME = 'eightfearless-images-v4';
const OFFLINE_CACHE_NAME = 'eightfearless-offline-v3';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/gallery.html',
  '/e-management.html',
  '/blog.html',
  '/contact.html',
  '/css/main.css',
  '/css/design.css',
  '/css/ui.css',
  '/css/layout.css',
  '/css/navigation.css',
  '/css/animations.css',
  '/css/responsive.css',
  '/css/gallery.css',
  '/css/blog.css',
  '/css/contact.css',
  '/js/main.js',
  '/js/navigation.js',
  '/js/animations.js',
  '/js/gallery.js',
  '/js/blog.js',
  '/js/contact-form.js',
  '/js/utils.js',
  '/images/logos/class-logo.png',
  '/images/logos/school-logo.png'
];

class CacheStrategy {
  static async networkFirst(request, cacheName) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      throw new Error('Network response failed');
    } catch (err) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      return this.generateFallback(request);
    }
  }

  static async cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (err) {
      return this.generateFallback(request);
    }
  }

  static async staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => cachedResponse);
    return cachedResponse || fetchPromise;
  }

  static async generateFallback(request) {
    const acceptHeader = request.headers.get('Accept');
    if (acceptHeader.includes('text/html')) {
      return new Response(this.getOfflineHTML(), {
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    if (acceptHeader.includes('image')) {
      return new Response(this.getFallbackSVG(), {
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    if (acceptHeader.includes('javascript')) {
      return new Response('console.log("Eight Fearless - Offline Mode");', {
        status: 503,
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    if (acceptHeader.includes('css')) {
      return new Response('/* Eight Fearless - Offline CSS */', {
        status: 503,
        headers: { 'Content-Type': 'text/css' }
      });
    }
    return new Response(JSON.stringify({ error: 'Offline', message: 'Eight Fearless - Tidak dapat terhubung' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static getOfflineHTML() {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Eight Fearless - Offline</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 50px 20px;
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .container {
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      max-width: 500px;
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    p {
      font-size: 1.2em;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    .icon {
      font-size: 4em;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📶</div>
    <h1>Eight Fearless</h1>
    <p>Anda sedang offline</p>
    <p>Periksa koneksi internet Anda dan coba lagi</p>
  </div>
</body>
</html>`;
  }

  static getFallbackSVG() {
    return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#666" text-anchor="middle" dy=".3em">Eight Fearless</text>
    </svg>`;
  }
}

class CacheManager {
  constructor() {
    this.currentCaches = [CORE_CACHE_NAME, IMAGE_CACHE_NAME, OFFLINE_CACHE_NAME];
  }

  async initialize() {
    await this.preloadCoreAssets();
    await this.cleanupOldCaches();
  }

  async preloadCoreAssets() {
    const cache = await caches.open(CORE_CACHE_NAME);
    const cachePromises = CORE_ASSETS.map(asset => {
      return cache.add(asset).catch(err => {
        console.log('Failed to cache:', asset, err);
      });
    });
    return Promise.all(cachePromises);
  }

  async cleanupOldCaches() {
    const cacheKeys = await caches.keys();
    const cachesToDelete = cacheKeys.filter(key => 
      !this.currentCaches.includes(key) && key.startsWith('eightfearless-')
    );
    await Promise.all(cachesToDelete.map(key => caches.delete(key)));
  }
}

class ResourceRouter {
  static route(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
      return { strategy: 'cacheFirst', cache: IMAGE_CACHE_NAME };
    }
    
    if (pathname.match(/\.(css|js)$/i)) {
      return { strategy: 'staleWhileRevalidate', cache: CORE_CACHE_NAME };
    }
    
    if (pathname.match(/\.(html|htm)$/i) || pathname === '/') {
      return { strategy: 'networkFirst', cache: CORE_CACHE_NAME };
    }
    
    return { strategy: 'networkFirst', cache: CORE_CACHE_NAME };
  }
}

const cacheManager = new CacheManager();

self.addEventListener('install', event => {
  event.waitUntil(
    cacheManager.initialize().then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    cacheManager.cleanupOldCaches().then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  
  if (url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    handleFetchEvent(request).catch(error => {
      return CacheStrategy.generateFallback(request);
    })
  );
});

async function handleFetchEvent(request) {
  const route = ResourceRouter.route(request);
  
  switch (route.strategy) {
    case 'networkFirst':
      return CacheStrategy.networkFirst(request, route.cache);
    
    case 'cacheFirst':
      return CacheStrategy.cacheFirst(request, route.cache);
    
    case 'staleWhileRevalidate':
      return CacheStrategy.staleWhileRevalidate(request, route.cache);
    
    default:
      return CacheStrategy.networkFirst(request, CORE_CACHE_NAME);
  }
}

self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      caches.keys().then(cacheNames => {
        const statusPromises = cacheNames.map(name => 
          caches.open(name).then(cache => 
            cache.keys().then(requests => requests.length)
          )
        );
        Promise.all(statusPromises).then(counts => {
          const status = {};
          cacheNames.forEach((name, index) => {
            status[name] = counts[index];
          });
          event.ports[0].postMessage({
            cacheStatus: status,
            coreAssets: CORE_ASSETS.length
          });
        });
      });
      break;
      
    case 'CLEAR_CACHE':
      if (payload.cacheName) {
        caches.delete(payload.cacheName).then(() => {
          event.ports[0].postMessage({ success: true });
        });
      } else {
        caches.keys().then(cacheNames => {
          const deletePromises = cacheNames.map(name => caches.delete(name));
          Promise.all(deletePromises).then(() => {
            event.ports[0].postMessage({ success: true });
          });
        });
      }
      break;

    case 'UPDATE_CACHE':
      cacheManager.preloadCoreAssets().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});