// روايتي — Service Worker
// اسم الكاش لا يتغير: cacheLibs() في index.html يفتح نفس الكاش "rewayati-v1"
const CACHE = "rewayati-v1";
const SHELL = ["./", "index.html", "privacy.html", "contract.html", "platforms.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // صفحات التطبيق: من الشبكة أولاً، وعند انقطاع الاتصال افتح النسخة المحفوظة
  if (req.mode === "navigate" || SHELL.includes(url.pathname.split("/").pop())) {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); return res; })
        .catch(() => caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
    );
    return;
  }

  // مكتبات Firebase وCDN: احفظها واستخدمها أوفلاين
  if (/gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com/.test(url.href)) {
    e.respondWith(
      caches.match(req).then(hit => hit ||
        fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); return res; })
      )
    );
  }
});

// التذكير الأسبوعي بدفتر الأفكار (تسجيله في index.html عبر Periodic Sync API)
self.addEventListener("periodicsync", e => {
  if (e.tag !== "idea-reminder") return;
  e.waitUntil(self.registration.showNotification("روايتي — دفتر الأفكار", {
    body: "افتح دفترك واكتب فكرة جديدة اليوم.",
    icon: "icon-192.png",
    tag: "idea-reminder",
    dir: "rtl",
    lang: "ar"
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(list => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow("./");
  }));
});
