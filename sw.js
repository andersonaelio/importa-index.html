// Service worker do Importa — só cuida de notificações push.
// Não faz cache de nada, então não precisa de lógica de instalação/atualização.

self.addEventListener('push', event => {
  let data = { title: 'Importa', body: 'Você tem um lembrete novo.' };
  try { if (event.data) data = event.data.json(); } catch (e) { /* usa o padrão acima */ }

  const options = {
    body: data.body,
    icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' rx=\'22\' fill=\'%233E5A44\'/%3E%3Ctext x=\'50\' y=\'68\' font-size=\'55\' text-anchor=\'middle\' fill=\'%23F4F7F1\' font-family=\'sans-serif\'%3EI%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' rx=\'22\' fill=\'%233E5A44\'/%3E%3C/svg%3E',
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Ao tocar na notificação, abre o app (ou foca a aba já aberta, se tiver uma)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Só aceita caminho interno (começa com "/"), nunca URL de fora do app.
  // Mesmo o push só sendo aceito com a VAPID key certa, isso evita que um
  // payload de notificação mande a pessoa pra um site de phishing.
  const dataUrl = event.notification.data && event.notification.data.url;
  const url = (typeof dataUrl === 'string' && dataUrl.startsWith('/') && !dataUrl.startsWith('//')) ? dataUrl : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
