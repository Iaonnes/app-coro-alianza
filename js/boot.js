// ======================================================
// APPCORUS BOOT
// CARGA AUTOMÁTICA SIN CACHÉ OBSOLETA
// ======================================================

(function iniciarAppCorus() {

    // Identificador automático de esta carga
    const revision =
        Date.now();


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
                "✅ AppCorus actualizado"
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