/**
 * RSTU Connect Service Worker
 * Handles push notifications and offline caching
 */

const CACHE_NAME = 'rstu-connect-v1';
const BASE_PATH = '/rstu-connect';

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'RSTU Connect',
    body: 'You have a new notification',
    icon: `${BASE_PATH}/icon-192.png`,
    badge: `${BASE_PATH}/badge-72.png`,
    tag: 'rstu-notification',
    data: {}
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || `${BASE_PATH}/icon-192.png`,
    badge: data.badge || `${BASE_PATH}/badge-72.png`,
    tag: data.tag || 'rstu-notification',
    renotify: true,
    requireInteraction: false,
    data: data.data || {},
    actions: getActionsForType(data.data?.type)
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Get notification actions based on type
function getActionsForType(type) {
  switch (type) {
    case 'dm':
      return [
        { action: 'reply', title: 'Reply' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    case 'mention':
      return [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    case 'event':
      return [
        { action: 'view', title: 'View Event' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    case 'alert':
      return [
        { action: 'view', title: 'View Details' }
      ];
    default:
      return [];
  }
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  // Handle dismiss action
  if (event.action === 'dismiss') {
    return;
  }

  // Get the URL to open
  const notificationData = event.notification.data || {};
  let url = notificationData.url || `${BASE_PATH}/`;

  // Handle specific actions
  if (event.action === 'reply' && notificationData.threadId) {
    url = `${BASE_PATH}/?tab=messages&thread=${notificationData.threadId}`;
  } else if (event.action === 'view') {
    if (notificationData.room) {
      url = `${BASE_PATH}/?room=${notificationData.room}`;
    } else if (notificationData.eventId) {
      url = `${BASE_PATH}/?tab=events&event=${notificationData.eventId}`;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already an RSTU Connect window open
      for (const client of clientList) {
        if (client.url.includes('rstu-connect') && 'focus' in client) {
          // Navigate to the specific URL if needed
          if (url !== `${BASE_PATH}/`) {
            client.navigate(url);
          }
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');

  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: null // Will be set by the app
    }).then((subscription) => {
      // Send new subscription to server
      return fetch('/rstu-connect/api/push-resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription?.endpoint,
          newSubscription: subscription.toJSON()
        })
      });
    }).catch((err) => {
      console.error('[SW] Error resubscribing:', err);
    })
  );
});

// Message event - handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
