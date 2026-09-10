// Firebase Cloud Messaging Service Worker for PashuCare AI
// Handles background push notifications when the application tab is not active

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCQ4UgHZbgeT9zGMmTna9NabUAHy9SxsBk",
  authDomain: "pashusathi-2ed8b.firebaseapp.com",
  projectId: "pashusathi-2ed8b",
  storageBucket: "pashusathi-2ed8b.firebasestorage.app",
  messagingSenderId: "613482973540",
  appId: "1:613482973540:web:80b1df854a132b38305271"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle incoming background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background push notification received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'PashuCare AI - Livestock Health Alert';
  const category = payload.data?.category || 'general';
  
  let defaultBody = 'You have a new livestock update.';
  if (category === 'vaccination') {
    defaultBody = 'Upcoming livestock vaccination reminder is due!';
  } else if (category === 'vet_response') {
    defaultBody = 'Urgent update received from your veterinarian!';
  }

  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || defaultBody,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: payload.data?.tag || `pashucare-${Date.now()}`,
    data: {
      url: payload.data?.url || (category === 'vet_response' ? '/?tab=vet' : '/?tab=reminders'),
      category: category,
      relatedId: payload.data?.relatedId,
      timestamp: Date.now()
    },
    requireInteraction: payload.data?.urgent === 'true' || category === 'vet_response',
    vibrate: [250, 100, 250, 100, 250]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click event handler to navigate directly to the reminder or vet consultation
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new window to the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
