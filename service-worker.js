const CACHE_NAME = "bethany-baptist-member-app-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./Bethany Baptist Church Picture.png"
];

/* =========================================
   FIREBASE CLOUD MESSAGING
========================================= */

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyB7CVFqwPbjLlH5vhvGKlMAH9gtBFnM458",
  authDomain: "calendar-a6f0f.firebaseapp.com",
  projectId: "calendar-a6f0f",
  storageBucket: "calendar-a6f0f.firebasestorage.app",
  messagingSenderId: "41941951557",
  appId: "1:41941951557:web:739ded386d42190c97ef2c"
});

const messaging = firebase.messaging();

/* Notification received while app is closed/background */

messaging.onBackgroundMessage((payload) => {

  console.log(
    "Bethany background notification:",
    payload
  );

  /*
    If the notification payload already contains
    notification information, Firebase can display it.

    This fallback handles data-only messages.
  */

  if (!payload.notification) {

    const title =
      payload.data?.title ||
      "Bethany Baptist Church";

    const options = {
      body:
        payload.data?.body ||
        "You have a new church notification.",

      icon: "./icon-192.png",
      badge: "./icon-192.png",

      data: {
        url:
          payload.data?.url ||
          "./"
      }
    };

    self.registration.showNotification(
      title,
      options
    );
  }
});


/* =========================================
   OPEN APP WHEN NOTIFICATION IS TAPPED
========================================= */

self.addEventListener(
  "notificationclick",
  (event) => {

    event.notification.close();

    const targetUrl =
      event.notification.data?.url ||
      "./";

    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })

      .then((clientList) => {

        for (const client of clientList) {

          if ("focus" in client) {

            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
);


/* =========================================
   INSTALL
========================================= */

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches.open(CACHE_NAME)
        .then((cache) => {

          return cache.addAll(
            FILES_TO_CACHE
          );
        })
    );

    self.skipWaiting();
  }
);


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches.keys()
        .then((cacheNames) => {

          return Promise.all(

            cacheNames.map(
              (cacheName) => {

                if (
                  cacheName !== CACHE_NAME
                ) {

                  return caches.delete(
                    cacheName
                  );
                }
              }
            )
          );
        })
    );

    self.clients.claim();
  }
);


/* =========================================
   FETCH
========================================= */

self.addEventListener(
  "fetch",
  (event) => {

    if (
      event.request.method !== "GET"
    ) {
      return;
    }

    event.respondWith(

      fetch(event.request)

        .then((response) => {

          const responseCopy =
            response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {

              cache.put(
                event.request,
                responseCopy
              );
            });

          return response;
        })

        .catch(() => {

          return caches.match(
            event.request
          )

          .then((cachedResponse) => {

            return (
              cachedResponse ||
              caches.match(
                "./index.html"
              )
            );
          });
        })
    );
  }
);
