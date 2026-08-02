const CACHE_NAME = "people-pwa-v5";

const FILES_TO_CACHE = [

    "./",
    "./index.html",
    "./results.html",

    "./css/style.css",

    "./js/data.js",
    "./js/home.js",
    "./js/results.js",

    "./data/people.json",

    "./manifest.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png"

];


self.addEventListener(
    "install",
    event => {

        self.skipWaiting();

        event.waitUntil(

            caches.open(CACHE_NAME)
            .then(
                cache => {

                    return cache.addAll(FILES_TO_CACHE);

                }
            )

        );

    }
);



self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
            .then(
                keys => {

                    return Promise.all(

                        keys.map(

                            key => {

                                if(key !== CACHE_NAME){

                                    return caches.delete(key);

                                }

                            }

                        )

                    );

                }

            )
            .then(() => self.clients.claim())

        );

    }
);



self.addEventListener(
    "fetch",
    event => {

        // קובץ הנתונים - תמיד לנסות רשת קודם, וליפול חזרה ל-cache רק אם אין חיבור
        if(event.request.url.includes("data/people.json")){

            event.respondWith(

                fetch(event.request)
                .then(
                    response => {

                        const clone = response.clone();

                        caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));

                        return response;

                    }
                )
                .catch(
                    () => caches.match(event.request)
                )

            );

            return;

        }

        // שאר הקבצים - כרגיל, cache קודם ואז רשת
        event.respondWith(

            caches.match(event.request)
            .then(

                response => {

                    return response || fetch(event.request);

                }

            )

        );

    }
);
