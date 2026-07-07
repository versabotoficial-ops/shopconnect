const CACHE_NAME = 'shopconnect-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logoconnect.png'
];

// Instala e pré-cacheia apenas recursos essenciais
self.addEventListener('install', event => {
  self.skipWaiting(); // Ativa imediatamente sem esperar a aba fechar
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Remove caches antigos ao ativar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim()) // Assume controle de todas as abas abertas
  );
});

// Estratégia: Network First — sempre tenta a rede, só usa cache se offline
self.addEventListener('fetch', event => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Atualiza o cache com a resposta nova
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: tenta servir do cache
        return caches.match(event.request).then(cached => {
          return cached || new Response('Você está offline. Recarregue quando tiver conexão.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
  );
});
