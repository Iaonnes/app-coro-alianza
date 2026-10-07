// ======================================================
// APPCORUS BOOT
// CARGA VERSIONADA PARA EVITAR CACHÉ OBSOLETA
// ======================================================

(function iniciarAppCorus() {

    // Revisión técnica de archivos del frontend.
    // No cambia la versión funcional de AppCorus.
    const revision =
        "3.7.7-r2";


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
        encodeURIComponent(
            revision
        );


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
        encodeURIComponent(
            revision
        );


    script.onload =
        () => {

            console.log(
                "✅ AppCorus actualizado - " +
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
