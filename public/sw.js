// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ],
      requireInteraction: false,
      silent: false,
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // Handle notification click
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

self.addEventListener('notificationclose', function(event) {
  // Optional: Track notification dismissals
  console.log('Notification was closed', event)
})