// ======================================================
// APPCORUS
// AFINADOR CROMÁTICO V1
// ======================================================

let afinadorActivo = false;

let afinadorStream = null;
let afinadorAudioContext = null;
let afinadorAnalizador = null;
let afinadorFuente = null;
let afinadorAnimacion = null;
let afinadorBuffer = null;

let historialFrecuencias = [];

let ultimaDeteccionAfinador = 0;


// ======================================================
// ELEMENTOS
// ======================================================

const btnAfinador =
    document.getElementById(
        "btnAfinador"
    );

const elementoNota =
    document.getElementById(
        "afinadorNota"
    );

const elementoFrecuencia =
    document.getElementById(
        "afinadorFrecuencia"
    );

const elementoCents =
    document.getElementById(
        "afinadorCents"
    );

const elementoEstado =
    document.getElementById(
        "afinadorEstado"
    );

const elementoAguja =
    document.getElementById(
        "afinadorAguja"
    );


// ======================================================
// NOTAS
// ======================================================

const NOMBRES_NOTAS = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B"
];


// ======================================================
// BOTÓN
// ======================================================

if (btnAfinador) {

    btnAfinador.addEventListener(
        "click",
        async () => {

            if (afinadorActivo) {

                detenerAfinador();

            }
            else {

                await iniciarAfinador();

            }

        }
    );

}


// ======================================================
// INICIAR
// ======================================================

async function iniciarAfinador() {

    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Este navegador no permite utilizar el micrófono."
            );

        }


        elementoEstado.textContent =
            "Solicitando acceso al micrófono...";


        elementoEstado.style.color =
            "#66788a";


        afinadorStream =
            await navigator.mediaDevices.getUserMedia({

                audio: {

                    echoCancellation:
                        false,

                    noiseSuppression:
                        false,

                    autoGainControl:
                        false

                }

            });


        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        afinadorAudioContext =
            new AudioContext();


        if (
            afinadorAudioContext.state ===
            "suspended"
        ) {

            await afinadorAudioContext.resume();

        }


        afinadorFuente =
            afinadorAudioContext
                .createMediaStreamSource(
                    afinadorStream
                );


        afinadorAnalizador =
            afinadorAudioContext
                .createAnalyser();


        afinadorAnalizador.fftSize =
            4096;


        afinadorAnalizador.smoothingTimeConstant =
            0;


        afinadorBuffer =
            new Float32Array(
                afinadorAnalizador.fftSize
            );


        afinadorFuente.connect(
            afinadorAnalizador
        );


        afinadorActivo =
            true;


        historialFrecuencias =
            [];


        ultimaDeteccionAfinador =
            0;


        btnAfinador.textContent =
            "■ Detener afinador";


        elementoEstado.textContent =
            "Escuchando...";


        procesarAfinador();

    }
    catch(error) {

        console.error(
            "Error iniciando afinador:",
            error
        );


        afinadorActivo =
            false;


        btnAfinador.textContent =
            "🎤 Iniciar afinador";


        elementoEstado.textContent =
            "No fue posible acceder al micrófono";


        elementoEstado.style.color =
            "#c62828";


        alert(
            "No fue posible utilizar el micrófono.\n\n" +
            "Verifica que el navegador tenga permiso para usarlo."
        );

    }

}


// ======================================================
// DETENER
// ======================================================

function detenerAfinador() {

    afinadorActivo =
        false;


    if (afinadorAnimacion) {

        cancelAnimationFrame(
            afinadorAnimacion
        );

        afinadorAnimacion =
            null;

    }


    if (afinadorStream) {

        afinadorStream
            .getTracks()
            .forEach(
                track => track.stop()
            );


        afinadorStream =
            null;

    }


    if (afinadorFuente) {

        try {

            afinadorFuente.disconnect();

        }
        catch(error) {

            // Sin acción.

        }

        afinadorFuente =
            null;

    }


    if (afinadorAudioContext) {

        afinadorAudioContext
            .close()
            .catch(
                () => {}
            );


        afinadorAudioContext =
            null;

    }


    afinadorAnalizador =
        null;


    afinadorBuffer =
        null;


    historialFrecuencias =
        [];


    ultimaDeteccionAfinador =
        0;


    if (btnAfinador) {

        btnAfinador.textContent =
            "🎤 Iniciar afinador";

    }


    reiniciarPantallaAfinador();

}


// ======================================================
// REINICIAR PANTALLA
// ======================================================

function reiniciarPantallaAfinador() {

    if (elementoNota) {

        elementoNota.textContent =
            "—";

        elementoNota.style.color =
            "#172033";

    }


    if (elementoFrecuencia) {

        elementoFrecuencia.textContent =
            "-- Hz";

    }


    if (elementoCents) {

        elementoCents.textContent =
            "0 cents";

    }


    if (elementoAguja) {

    elementoAguja.style.transform =
        "translateX(-50%) rotate(0deg)";

    }


    if (elementoEstado) {

        elementoEstado.textContent =
            "Afinador detenido";

        elementoEstado.style.color =
            "#66788a";

    }

}


// ======================================================
// PROCESAR AUDIO
// ======================================================

function procesarAfinador() {

    if (
        !afinadorActivo ||
        !afinadorAnalizador ||
        !afinadorAudioContext ||
        !afinadorBuffer
    ) {

        return;

    }


    afinadorAnalizador
        .getFloatTimeDomainData(
            afinadorBuffer
        );


    const frecuencia =
        detectarFrecuencia(
            afinadorBuffer,
            afinadorAudioContext.sampleRate
        );


    if (
        frecuencia &&
        frecuencia >= 45 &&
        frecuencia <= 2000
    ) {

        ultimaDeteccionAfinador =
            Date.now();


        const frecuenciaEstable =
            estabilizarFrecuencia(
                frecuencia
            );


        mostrarFrecuencia(
            frecuenciaEstable
        );

    }
    else {

        if (
            ultimaDeteccionAfinador === 0 ||
            Date.now() -
            ultimaDeteccionAfinador >
            700
        ) {

            mostrarEsperandoNota();

        }

    }


    afinadorAnimacion =
        requestAnimationFrame(
            procesarAfinador
        );

}


// ======================================================
// SIN SEÑAL
// ======================================================

function mostrarEsperandoNota() {

    elementoNota.textContent =
        "—";


    elementoFrecuencia.textContent =
        "-- Hz";


    elementoCents.textContent =
        "0 cents";


    elementoAguja.style.left =
        "50%";


    elementoNota.style.color =
        "#172033";


    elementoEstado.style.color =
        "#66788a";


    elementoEstado.textContent =
        "Escuchando...";

}


// ======================================================
// DETECTOR DE FRECUENCIA
// AUTOCORRELACIÓN
// ======================================================

function detectarFrecuencia(
    buffer,
    sampleRate
) {

    const tamaño =
        buffer.length;


    let sumaCuadrados =
        0;


    for (
        let i = 0;
        i < tamaño;
        i++
    ) {

        sumaCuadrados +=
            buffer[i] *
            buffer[i];

    }


    const rms =
        Math.sqrt(
            sumaCuadrados /
            tamaño
        );


    if (
        rms < 0.008
    ) {

        return null;

    }


    let inicio =
        0;


    let fin =
        tamaño - 1;


    const limite =
        0.02;


    while (
        inicio < tamaño / 2 &&
        Math.abs(
            buffer[inicio]
        ) < limite
    ) {

        inicio++;

    }


    while (
        fin > tamaño / 2 &&
        Math.abs(
            buffer[fin]
        ) < limite
    ) {

        fin--;

    }


    const señal =
        buffer.slice(
            inicio,
            fin + 1
        );


    const longitud =
        señal.length;


    if (
        longitud < 100
    ) {

        return null;

    }


    const correlaciones =
        new Float32Array(
            longitud
        );


    for (
        let desplazamiento = 0;
        desplazamiento < longitud;
        desplazamiento++
    ) {

        let suma =
            0;


        for (
            let i = 0;
            i <
            longitud -
            desplazamiento;
            i++
        ) {

            suma +=
                señal[i] *
                señal[
                    i +
                    desplazamiento
                ];

        }


        correlaciones[
            desplazamiento
        ] =
            suma;

    }


    let desplazamiento =
        0;


    while (
        desplazamiento + 1 <
        longitud &&
        correlaciones[
            desplazamiento
        ] >
        correlaciones[
            desplazamiento + 1
        ]
    ) {

        desplazamiento++;

    }


    let mejorDesplazamiento =
        -1;


    let mejorCorrelacion =
        -Infinity;


    for (
        let i = desplazamiento;
        i < longitud;
        i++
    ) {

        if (
            correlaciones[i] >
            mejorCorrelacion
        ) {

            mejorCorrelacion =
                correlaciones[i];


            mejorDesplazamiento =
                i;

        }

    }


    if (
        mejorDesplazamiento <= 0
    ) {

        return null;

    }


    let periodo =
        mejorDesplazamiento;


    if (
        mejorDesplazamiento > 0 &&
        mejorDesplazamiento <
        longitud - 1
    ) {

        const izquierda =
            correlaciones[
                mejorDesplazamiento - 1
            ];


        const centro =
            correlaciones[
                mejorDesplazamiento
            ];


        const derecha =
            correlaciones[
                mejorDesplazamiento + 1
            ];


        const denominador =
            izquierda -
            2 * centro +
            derecha;


        if (
            denominador !== 0
        ) {

            periodo +=
                0.5 *
                (
                    izquierda -
                    derecha
                ) /
                denominador;

        }

    }


    return (
        sampleRate /
        periodo
    );

}


// ======================================================
// ESTABILIZACIÓN
// ======================================================

function estabilizarFrecuencia(
    frecuencia
) {

    historialFrecuencias.push(
        frecuencia
    );


    if (
        historialFrecuencias.length >
        5
    ) {

        historialFrecuencias.shift();

    }


    const ordenadas =
        [...historialFrecuencias]
            .sort(
                (a, b) =>
                    a - b
            );


    const mitad =
        Math.floor(
            ordenadas.length /
            2
        );


    return ordenadas[
        mitad
    ];

}


// ======================================================
// MOSTRAR FRECUENCIA
// ======================================================

function mostrarFrecuencia(
    frecuencia
) {

    const midi =
        Math.round(

            69 +
            12 *
            Math.log2(
                frecuencia /
                440
            )

        );


    const indiceNota =
        (
            midi % 12 +
            12
        ) % 12;


    const octava =
        Math.floor(
            midi /
            12
        ) - 1;


    const nota =
        NOMBRES_NOTAS[
            indiceNota
        ];


    const frecuenciaObjetivo =
        440 *
        Math.pow(

            2,

            (
                midi -
                69
            ) /
            12

        );


    const cents =
        1200 *
        Math.log2(
            frecuencia /
            frecuenciaObjetivo
        );


    const centsRedondeados =
        Math.round(
            cents
        );


    elementoNota.textContent =
        nota + octava;


    elementoFrecuencia.textContent =
        frecuencia.toFixed(
            1
        ) +
        " Hz";


    elementoCents.textContent =
        (
            centsRedondeados > 0
                ? "+"
                : ""
        ) +
        centsRedondeados +
        " cents";


    const centsLimitados =
        Math.max(
            -50,
            Math.min(
                50,
                cents
            )
        );


    const anguloAguja =
        (
            centsLimitados /
            50
        ) *
        45;


    elementoAguja.style.transform =
        `translateX(-50%) rotate(${anguloAguja}deg)`;


    actualizarEstadoAfinacion(
        cents
    );

}


// ======================================================
// ESTADO
// ======================================================

function actualizarEstadoAfinacion(
    cents
) {

    const desviacion =
        Math.abs(
            cents
        );


    if (
        desviacion <= 5
    ) {

        elementoEstado.textContent =
            "✓ Afinado";


        elementoEstado.style.color =
            "#2e7d32";


        elementoNota.style.color =
            "#2e7d32";


        return;

    }


    elementoNota.style.color =
        "#172033";


    elementoEstado.style.color =
        "#ef6c00";


    if (
        cents < 0
    ) {

        elementoEstado.textContent =
            desviacion <= 15
                ? "Un poco grave"
                : "♭ Demasiado grave";

    }
    else {

        elementoEstado.textContent =
            desviacion <= 15
                ? "Un poco agudo"
                : "Demasiado agudo ♯";

    }

}


// ======================================================
// APAGAR MICRÓFONO AL CAMBIAR DE SECCIÓN
// ======================================================

document
    .querySelectorAll(
        ".bottom-nav .nav-item"
    )
    .forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const destino =
                        boton.dataset.seccion;


                    if (
                        destino !== "afinador" &&
                        afinadorActivo
                    ) {

                        detenerAfinador();

                    }

                }
            );

        }
    );


// ======================================================
// CERRAR / OCULTAR PÁGINA
// ======================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (
            afinadorActivo
        ) {

            detenerAfinador();

        }

    }
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            afinadorActivo
        ) {

            detenerAfinador();

        }

    }
);


// Disponible también para app.js
window.detenerAfinador =
    detenerAfinador;


console.log(
    "🎵 Afinador cromático AppCorus V1 listo"
);