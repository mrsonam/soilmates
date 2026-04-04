/* Soil Mates — service worker for Web Push (and light offline shell). */
const CACHE_NAME = "soilmates-sw-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(["/globe.svg"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((r) => r || fetch(event.request)),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Soil Mates", body: "", url: "/dashboard" };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    const text = event.data?.text?.() ?? "";
    if (text) data = { ...data, body: text };
  }

  const title = data.title || "Soil Mates";
  const options = {
    body: data.body || "You have a plant care update.",
    icon: data.icon || "/globe.svg",
    badge: data.badge || "/globe.svg",
    data: { url: data.url || "/dashboard" },
    tag: "soilmates-care",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  const absolute = new URL(url, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absolute);
      }
    }),
  );
});
