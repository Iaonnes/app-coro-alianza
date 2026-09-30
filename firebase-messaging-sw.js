// ======================================================
// APPCORUS - SERVICE WORKER
// Firebase Cloud Messaging + caché básico de la PWA
// Versión 3.7.7
// ======================================================

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);


// ======================================================
// CONFIGURACIÓN FIREBASE - APPCORUS
// ======================================================

firebase.initializeApp({

    apiKey:
        "AIzaSyCI6KNesshXevS2bUHKwGyUnUB8pDjJ3cY",

    authDomain:
        "appcorus-42c1c.firebaseapp.com",

    projectId:
        "appcorus-42c1c",

    storageBucket:
        "appcorus-42c1c.firebasestorage.app",

    messagingSenderId:
        "925195621904",

    appId:
        "1:925195621904:web:19999aa2d52c188c5a5c95"

});


// ======================================================
// FIREBASE CLOUD MESSAGING
// ======================================================

const messaging =
    firebase.messaging();


console.log(
    "✅ AppCorus Firebase Messaging Service Worker cargado"
);


// ======================================================
// CACHÉ DE LA APLICACIÓN
// ======================================================

const APPCORUS_CACHE =
    "appcorus-shell-v3.7.7";


const APPCORUS_SHELL = [
    "./",
    "./index.html",
    "./Manifest.json",
    "./css/style.css",
    "./js/boot.js",
    "./js/app.js",
    "./js/afinador.js",
    "./assets/logoAppCorus.png",
    "./assets/IconAppCorus.png"
];


// ======================================================
// INSTALACIÓN
// Guarda los archivos básicos necesarios para arrancar
// AppCorus aunque GitHub Pages falle temporalmente.
// ======================================================

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(APPCORUS_CACHE)
                .then(
                    cache =>
                        Promise.all(

                            APPCORUS_SHELL.map(
                                archivo =>
                                    cache
                                        .add(
                                            new Request(
                                                archivo,
                                                {
                                                    cache: "reload"
                                                }
                                            )
                                        )
                                        .catch(
                                            error => {

                                                console.warn(
                                                    "⚠️ No se pudo precachear:",
                                                    archivo,
                                                    error
                                                );

                                            }
                                        )
                            )

                        )
                )
                .then(
                    () =>
                        self.skipWaiting()
                )

        );

    }
);


// ======================================================
// ACTIVACIÓN
// Limpia únicamente cachés antiguos creados por AppCorus.
// No toca cachés ajenos del navegador.
// ======================================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    nombres =>
                        Promise.all(

                            nombres
                                .filter(
                                    nombre =>
                                        nombre.startsWith(
                                            "appcorus-shell-"
                                        ) &&
                                        nombre !== APPCORUS_CACHE
                                )
                                .map(
                                    nombre =>
                                        caches.delete(
                                            nombre
                                        )
                                )

                        )
                )
                .then(
                    () =>
                        self.clients.claim()
                )

        );

    }
);


// ======================================================
// AYUDANTE: TIMEOUT DE RED
// ======================================================

function fetchConTimeout(
    request,
    milisegundos = 4500
) {

    return Promise.race([

        fetch(request),

        new Promise(
            (
                _,
                reject
            ) =>
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                "Tiempo de espera agotado"
                            )
                        ),
                    milisegundos
                )
        )

    ]);

}


// ======================================================
// PETICIONES
// - Navegación: intenta red primero y cae al index en caché.
// - Archivos locales: usa caché primero y red como respaldo.
// - APIs externas (Google Apps Script, Firebase, etc.) NO se
//   interceptan ni se almacenan aquí.
// ======================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !== "GET"
        ) {
            return;
        }


        const url =
            new URL(
                request.url
            );


        // No intervenir llamadas externas.
        if (
            url.origin !== self.location.origin
        ) {
            return;
        }


        // ==============================================
        // NAVEGACIÓN / APERTURA DE LA PWA
        // ==============================================

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(

                fetchConTimeout(
                    request
                )
                    .then(
                        response => {

                            if (
                                response &&
                                response.ok
                            ) {

                                const copia =
                                    response.clone();

                                caches
                                    .open(
                                        APPCORUS_CACHE
                                    )
                                    .then(
                                        cache =>
                                            cache.put(
                                                "./index.html",
                                                copia
                                            )
                                    );

                            }

                            return response;

                        }
                    )
                    .catch(
                        async () => {

                            const indexCache =
                                await caches.match(
                                    "./index.html",
                                    {
                                        ignoreSearch: true
                                    }
                                );


                            if (
                                indexCache
                            ) {
                                return indexCache;
                            }


                            const inicioCache =
                                await caches.match(
                                    "./",
                                    {
                                        ignoreSearch: true
                                    }
                                );


                            if (
                                inicioCache
                            ) {
                                return inicioCache;
                            }


                            return new Response(
                                "AppCorus no pudo iniciar. Revisa tu conexión e inténtalo nuevamente.",
                                {
                                    status: 503,
                                    headers: {
                                        "Content-Type":
                                            "text/plain; charset=UTF-8"
                                    }
                                }
                            );

                        }
                    )

            );

            return;
        }


        // ==============================================
        // ARCHIVOS LOCALES
        // Cache First + actualización cuando haga falta.
        // ignoreSearch permite resolver ?t=3.7.7 usando
        // el archivo base previamente guardado.
        // ==============================================

        event.respondWith(

            caches
                .match(
                    request,
                    {
                        ignoreSearch: true
                    }
                )
                .then(
                    cacheado => {

                        if (
                            cacheado
                        ) {
                            return cacheado;
                        }


                        return fetch(
                            request
                        )
                            .then(
                                response => {

                                    if (
                                        !response ||
                                        !response.ok
                                    ) {
                                        return response;
                                    }


                                    const copia =
                                        response.clone();


                                    caches
                                        .open(
                                            APPCORUS_CACHE
                                        )
                                        .then(
                                            cache =>
                                                cache.put(
                                                    request,
                                                    copia
                                                )
                                        );


                                    return response;

                                }
                            );

                    }
                )

        );

    }
);