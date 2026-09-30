// ======================================================
// APPCORUS BOOT
// CARGA VERSIONADA PARA EVITAR CACHÉ OBSOLETA
// ======================================================

(function iniciarAppCorus() {

    // IMPORTANTE:
    // Cambiar este valor únicamente cuando se publique
    // una nueva versión de AppCorus.
    const revision =
        "3.7.7";


    window.APPCORUS_REVISION =
        revision;


    // ==================================================
    // CARGAR CSS
    // ==================================================

    const css =
        document.createElement(
            "link"
        );


    css.rel =
        "stylesheet";


    css.href =
        "./css/style.css?t=" +
        revision;


    document.head.appendChild(
        css
    );


    // ==================================================
    // CARGAR APP.JS
    // ==================================================

    const script =
        document.createElement(
            "script"
        );


    script.src =
        "./js/app.js?t=" +
        revision;


    script.onload =
        () => {

            console.log(
                "✅ AppCorus actualizado - V" +
                revision
            );

        };


    script.onerror =
        () => {

            console.error(
                "❌ No se pudo cargar app.js"
            );

        };


    document.body.appendChild(
        script
    );

})();