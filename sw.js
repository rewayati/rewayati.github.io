// روايتي — Service Worker v2
const CACHE = "rewayati-v2";
const SHELL = [
    "./",
    "index.html",
    "privacy.html",
    "contract.html",
    "platforms.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png"
];

// Install Event
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(SHELL))
            .catch(err => console.log('Cache addAll failed:', err))
            .then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event
self.addEventListener("fetch", e => {
    const req = e.request;
    if (req.method !== "GET") return;
    
    const url = new URL(req.url);
    
    // صفحات التطبيق: Network First
    if (req.mode === "navigate" || SHELL.includes(url.pathname.split("/").pop())) {
        e.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE)
                        .then(c => c.put(req, copy))
                        .catch(() => {});
                    return res;
                })
                .catch(() => 
                    caches.match(req).then(hit => 
                        hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())
                    )
                )
        );
        return;
    }
    
    // مكتبات Firebase وCDN: Cache First
    if (/gstatic.com\/firebasejs|cdnjs.cloudflare.com/.test(url.href)) {
        e.respondWith(
            caches.match(req).then(hit => 
                hit || fetch(req).then(res => {
                    const copy = res.clone();
                    caches.open(CACHE)
                        .then(c => c.put(req, copy))
                        .catch(() => {});
                    return res;
                })
            )
        );
    }
});

// Periodic Sync for Reminders
self.addEventListener("periodicsync", e => {
    if (e.tag !== "idea-reminder") return;
    e.waitUntil(
        self.registration.showNotification("روايتي — دفتر الأفكار", {
            body: "افتح دفترك واكتب فكرة جديدة اليوم.",
            icon: "icon-192.png",
            tag: "idea-reminder",
            dir: "rtl",
            lang: "ar"
        })
    );
});

// Notification Click
self.addEventListener("notificationclick", e => {
    e.notification.close();
    e.waitUntil(
        self.clients.matchAll({ type: "window" }).then(list => {
            for (const c of list) {
                if ("focus" in c) return c.focus();
            }
            return self.clients.openWindow("./");
        })
    );
});