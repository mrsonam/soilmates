/* Soil Mates — service worker: Web Push + light offline shell */
const CACHE_NAME = "soilmates-sw-v3";
const PRECACHE = [
  "/icons/soilmates-icon.svg",
  "/icons/soilmates-icon-192.png",
  "/icons/soilmates-icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/soilmates-badge.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((r) => r || fetch(event.request)),
  );
});

const DEFAULT_ICON = "/icons/soilmates-icon-192.png";
const DEFAULT_BADGE = "/icons/soilmates-badge.svg";

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
    icon: data.icon || DEFAULT_ICON,
    badge: data.badge || DEFAULT_BADGE,
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
