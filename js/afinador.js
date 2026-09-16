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

/*
   Suavizado visual del afinador.
   No cambia el detector de frecuencia ni el acceso al micrófono.
*/
let centsSuavizados = null;
let afinacionEstable = false;

/*
   Limita únicamente la actualización visual de la aguja y lecturas.
   El análisis del micrófono sigue ejecutándose normalmente.
*/
let ultimaActualizacionVisualAfinador = 0;


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


/*
   Indicadores laterales Grave / Agudo.
   Usa el HTML actual; no requiere modificar el index.
*/
const etiquetasExtremos =
    document.querySelectorAll(
        ".afinador-extremos span"
    );

const etiquetaGrave =
    etiquetasExtremos[0] || null;

const etiquetaAgudo =
    etiquetasExtremos[1] || null;


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
// COLOR DE GRAVE / AGUDO
// ======================================================

function actualizarColorExtremos(
    cents = null,
    afinado = false
) {

    const neutro =
        "#66758d";

    const verde =
        "#2e7d32";

    const rojo =
        "#e53935";

    const naranja =
        "#ef6c00";


    if (etiquetaGrave) {

        etiquetaGrave.style.color =
            neutro;

    }


    if (etiquetaAgudo) {

        etiquetaAgudo.style.color =
            neutro;

    }


    if (afinado) {

        if (etiquetaGrave) {

            etiquetaGrave.style.color =
                verde;

        }


        if (etiquetaAgudo) {

            etiquetaAgudo.style.color =
                verde;

        }


        return;

    }


    if (
        cents === null ||
        !Number.isFinite(cents)
    ) {

        return;

    }


    if (
        cents < 0
    ) {

        if (etiquetaGrave) {

            etiquetaGrave.style.color =
                Math.abs(cents) > 15
                    ? rojo
                    : naranja;

        }

    }
    else if (
        cents > 0
    ) {

        if (etiquetaAgudo) {

            etiquetaAgudo.style.color =
                naranja;

        }

    }

}


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


    centsSuavizados = null;
    afinacionEstable = false;
    ultimaActualizacionVisualAfinador = 0;


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


    actualizarColorExtremos();

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


    centsSuavizados = null;
    afinacionEstable = false;
    ultimaActualizacionVisualAfinador = 0;


    elementoAguja.style.transform =
        "translateX(-50%) rotate(0deg)";


    afinacionEstable =
        false;


    elementoNota.style.color =
        "#172033";


    elementoEstado.style.color =
        "#66788a";


    elementoEstado.textContent =
        "Escuchando...";


    actualizarColorExtremos();

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
        13
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

    const ahoraVisual =
        performance.now();


    /*
       Evita que la interfaz intente redibujarse ~60 veces por segundo.
       El audio sigue analizándose continuamente; solo la aguja y
       los textos se actualizan a un ritmo más fácil de leer.
    */
    if (
        ahoraVisual -
        ultimaActualizacionVisualAfinador <
        90
    ) {

        return;

    }


    ultimaActualizacionVisualAfinador =
        ahoraVisual;

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


    /*
       Filtro exponencial para que la aguja no persiga
       cada microvariación instantánea de la afinación.
       0.12 prioriza estabilidad visual sin volver lenta la afinación.
    */
    if (
        centsSuavizados === null
    ) {

        centsSuavizados =
            cents;

    }
    else {

        centsSuavizados +=
            (
                cents -
                centsSuavizados
            ) *
            0.12;

    }


    /*
       Pequeña zona muerta alrededor del centro.
       Si ya estamos prácticamente afinados, la aguja
       se queda en el centro en vez de temblar.
    */
    if (
        Math.abs(
            centsSuavizados
        ) <= 3
    ) {

        centsSuavizados =
            0;

    }


    const centsRedondeados =
        Math.round(
            centsSuavizados
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
                centsSuavizados
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
        centsSuavizados
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


    const limiteAfinado =
        afinacionEstable
            ? 9
            : 5;


    if (
        desviacion <=
        limiteAfinado
    ) {

        afinacionEstable =
            true;


        elementoEstado.textContent =
            "✓ Afinado";


        elementoEstado.style.color =
            "#2e7d32";


        elementoNota.style.color =
            "#2e7d32";


        actualizarColorExtremos(
            cents,
            true
        );


        return;

    }


    afinacionEstable =
        false;


    elementoNota.style.color =
        "#172033";


    if (
        cents < 0
    ) {

        if (
            desviacion <= 15
        ) {

            elementoEstado.textContent =
                "Un poco grave";

            elementoEstado.style.color =
                "#ef6c00";

        }
        else {

            elementoEstado.textContent =
                "♭ Demasiado grave";

            elementoEstado.style.color =
                "#e53935";

        }

    }
    else {

        elementoEstado.textContent =
            desviacion <= 15
                ? "Un poco agudo"
                : "Demasiado agudo ♯";

        elementoEstado.style.color =
            "#ef6c00";

    }


    actualizarColorExtremos(
        cents,
        false
    );

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