const C="rewayati-v1";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","icon-192.png"])).catch(()=>{}))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!="GET")return;const u=new URL(r.url);
const lib=/gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com/.test(r.url);
const put=x=>{if(x&&x.ok){const y=x.clone();caches.open(C).then(c=>c.put(r,y))}return x};
if(lib)e.respondWith(caches.match(r).then(m=>m||fetch(r).then(put)));
else if(u.origin==location.origin)e.respondWith(fetch(r).then(put).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))))});

self.addEventListener("periodicsync",e=>{if(e.tag=="idea-reminder")e.waitUntil(ideaNote())});
async function ideaNote(){const c=await caches.open("rewayati-data");const r=await c.match("ideas-digest");if(!r)return;const d=await r.json();if(!d.ideas||!d.ideas.length)return;const i=(d.i||0)%d.ideas.length;d.i=i+1;await c.put("ideas-digest",new Response(JSON.stringify(d)));
await self.registration.showNotification("💡 فكرة من صندوق أفكارك",{body:"«الأفكار ملقاة على قارعة الطريق، إن لم تأخذها ذهبت لغيرك»\n"+d.ideas[i].t,icon:"icon-192.png",tag:"idea-reminder",lang:"ar",dir:"rtl"})}
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window"}).then(l=>{for(const w of l){if("focus" in w)return w.focus()}return clients.openWindow("./")}))});
