// روايتي — Service Worker v3
const CACHE = "rewayati-v3";
const SHELL = ["./","index.html","app.html","styles.css","privacy.html","terms.html","contract.html","platforms.html","kdp-guide.html","manifest.webmanifest","icon-192.png","icon-512.png"];
const LIBS = /gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com/;

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const put = res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); } return res; };

  if (LIBS.test(url.href)) {                       // مكتبات خارجية: من الذاكرة أولاً
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(put)));
    return;
  }
  if (url.origin === location.origin) {            // ملفات الموقع: من الشبكة أولاً ثم الذاكرة
    const fallback = url.pathname.endsWith("app.html") ? "app.html" : "index.html";
    e.respondWith(
      fetch(req).then(put).catch(() =>
        caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match(fallback) : Response.error()))
      )
    );
  }
});

self.addEventListener("periodicsync", e => {
  if (e.tag !== "idea-reminder" && e.tag !== "idea-weekly") return;
  e.waitUntil(self.registration.showNotification("روايتي — غرفة الأفكار", {
    body: "الأفكار ملقاة على قارعة الطريق، إن لم تأخذها ذهبت لغيرك.",
    icon: "icon-192.png", tag: "idea-reminder", dir: "rtl", lang: "ar"
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(list => {
    for (const c of list) if ("focus" in c) return c.focus();
    return self.clients.openWindow("app.html");
  }));
});
