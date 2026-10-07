// ======================================================
// APPCORUS - SERVICE WORKER
// Firebase Cloud Messaging + caché PWA actualizable
// AppCorus 3.7.7 - revisión técnica r2
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
    "appcorus-shell-v3.7.7-r2";


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
// ======================================================

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    APPCORUS_CACHE
                )
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
                                                    cache:
                                                        "reload"
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
// Elimina versiones anteriores del caché de AppCorus.
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
                                        nombre !==
                                            APPCORUS_CACHE
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
// AYUDANTE: RED CON TIMEOUT
// ======================================================

function fetchConTimeout(
    request,
    milisegundos = 5000
) {

    return Promise.race([

        fetch(
            request
        ),

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
// AYUDANTE: GUARDAR RESPUESTA EN CACHÉ
// ======================================================

function guardarEnCache(
    request,
    response
) {

    if (
        !response ||
        !response.ok
    ) {
        return;
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
        )
        .catch(
            () => {}
        );

}


// ======================================================
// FETCH
//
// Navegación:
//   RED PRIMERO -> caché si falla.
//
// JS / CSS / JSON / manifest:
//   RED PRIMERO -> actualiza caché -> caché si falla.
//   Así AppCorus recibe los cambios publicados.
//
// Imágenes y otros recursos locales:
//   CACHÉ PRIMERO -> red si no existe.
//
// APIs externas:
//   No se interceptan.
// ======================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !==
            "GET"
        ) {
            return;
        }


        const url =
            new URL(
                request.url
            );


        // No intervenir Google Apps Script, Firebase,
        // Google Identity ni ningún recurso externo.
        if (
            url.origin !==
            self.location.origin
        ) {
            return;
        }


        // ==============================================
        // NAVEGACIÓN
        // ==============================================

        if (
            request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetchConTimeout(
                    request
                )
                    .then(
                        response => {

                            guardarEnCache(
                                request,
                                response
                            );

                            return response;

                        }
                    )
                    .catch(
                        async () => {

                            const exacta =
                                await caches.match(
                                    request
                                );


                            if (
                                exacta
                            ) {
                                return exacta;
                            }


                            const indexCache =
                                await caches.match(
                                    "./index.html",
                                    {
                                        ignoreSearch:
                                            true
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
                                        ignoreSearch:
                                            true
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
                                    status:
                                        503,
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
        // ARCHIVOS QUE DEBEN ACTUALIZARSE
        // Red primero para evitar quedar congelados
        // en una versión vieja.
        // ==============================================

        const extension =
            url.pathname
                .split(
                    "."
                )
                .pop()
                .toLowerCase();


        const esActualizable =
            extension === "js" ||
            extension === "css" ||
            extension === "json" ||
            url.pathname.endsWith(
                "/Manifest.json"
            );


        if (
            esActualizable
        ) {

            event.respondWith(

                fetchConTimeout(
                    request
                )
                    .then(
                        response => {

                            guardarEnCache(
                                request,
                                response
                            );

                            return response;

                        }
                    )
                    .catch(
                        async () => {

                            const exacta =
                                await caches.match(
                                    request
                                );


                            if (
                                exacta
                            ) {
                                return exacta;
                            }


                            const base =
                                await caches.match(
                                    request,
                                    {
                                        ignoreSearch:
                                            true
                                    }
                                );


                            if (
                                base
                            ) {
                                return base;
                            }


                            return new Response(
                                "Recurso temporalmente no disponible.",
                                {
                                    status:
                                        503,
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
        // OTROS RECURSOS LOCALES
        // Imágenes, iconos, etc.
        // ==============================================

        event.respondWith(

            caches
                .match(
                    request
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

                                    guardarEnCache(
                                        request,
                                        response
                                    );

                                    return response;

                                }
                            );

                    }
                )

        );

    }
);
