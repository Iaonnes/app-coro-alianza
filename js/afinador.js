// ======================================================
// APPCORUS
// AFINADOR CROMÁTICO V2 - MOTOR YIN
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
let ultimaAnalisisAfinador = 0;

let midiActualAfinador = null;
let midiCandidatoAfinador = null;
let repeticionesMidiCandidato = 0;
let ultimaFrecuenciaAceptada = null;

/*
   Suavizado visual ligero.
   La precisión principal ahora la aporta el detector YIN.
*/
let centsSuavizados = null;
let afinacionEstable = false;


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
// REFERENCIA YIN / AFINACIÓN
// ======================================================

const FRECUENCIA_A4 =
    440;

const FRECUENCIA_MIN_AFINADOR =
    55;

const FRECUENCIA_MAX_AFINADOR =
    1200;

const UMBRAL_YIN =
    0.15;

const CONFIANZA_MINIMA_YIN =
    0.85;

/*
   Ejecutar YIN unas 14 veces por segundo es suficiente para un afinador
   y evita cargar innecesariamente el teléfono.
*/
const INTERVALO_ANALISIS_MS =
    70;


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

        ultimaAnalisisAfinador =
            0;

        midiActualAfinador =
            null;

        midiCandidatoAfinador =
            null;

        repeticionesMidiCandidato =
            0;

        ultimaFrecuenciaAceptada =
            null;

        centsSuavizados =
            null;

        afinacionEstable =
            false;


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

    ultimaAnalisisAfinador =
        0;

    midiActualAfinador =
        null;

    midiCandidatoAfinador =
        null;

    repeticionesMidiCandidato =
        0;

    ultimaFrecuenciaAceptada =
        null;


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
    ultimaAnalisisAfinador = 0;

    historialFrecuencias = [];
    midiActualAfinador = null;
    midiCandidatoAfinador = null;
    repeticionesMidiCandidato = 0;
    ultimaFrecuenciaAceptada = null;


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


    const ahora =
        performance.now();


    if (
        ahora -
        ultimaAnalisisAfinador <
        INTERVALO_ANALISIS_MS
    ) {

        afinadorAnimacion =
            requestAnimationFrame(
                procesarAfinador
            );

        return;

    }


    ultimaAnalisisAfinador =
        ahora;


    afinadorAnalizador
        .getFloatTimeDomainData(
            afinadorBuffer
        );


    const deteccion =
        detectarFrecuencia(
            afinadorBuffer,
            afinadorAudioContext.sampleRate
        );


    if (
        deteccion &&
        deteccion.frecuencia >=
            FRECUENCIA_MIN_AFINADOR &&
        deteccion.frecuencia <=
            FRECUENCIA_MAX_AFINADOR &&
        deteccion.confianza >=
            CONFIANZA_MINIMA_YIN
    ) {

        ultimaDeteccionAfinador =
            Date.now();


        const frecuenciaEstable =
            estabilizarFrecuencia(
                deteccion.frecuencia,
                deteccion.confianza
            );


        if (
            frecuenciaEstable
        ) {

            mostrarFrecuencia(
                frecuenciaEstable
            );

        }

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


    centsSuavizados =
        null;

    afinacionEstable =
        false;

    historialFrecuencias =
        [];

    midiActualAfinador =
        null;

    midiCandidatoAfinador =
        null;

    repeticionesMidiCandidato =
        0;

    ultimaFrecuenciaAceptada =
        null;


    elementoAguja.style.transform =
        "translateX(-50%) rotate(0deg)";


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
// YIN - FUNDAMENTAL MONOFÓNICA
// ======================================================

function detectarFrecuencia(
    buffer,
    sampleRate
) {

    const tamaño =
        buffer.length;


    if (
        tamaño < 256
    ) {

        return null;

    }


    /*
       Quitar componente DC y comprobar que la señal tenga energía
       suficiente antes de buscar periodicidad.
    */
    let media =
        0;


    for (
        let i = 0;
        i < tamaño;
        i++
    ) {

        media +=
            buffer[i];

    }


    media /=
        tamaño;


    const señal =
        new Float32Array(
            tamaño
        );


    let sumaCuadrados =
        0;


    for (
        let i = 0;
        i < tamaño;
        i++
    ) {

        const valor =
            buffer[i] -
            media;


        señal[i] =
            valor;


        sumaCuadrados +=
            valor *
            valor;

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


    /*
       tau = sampleRate / frecuencia.
       Restringir tau al rango musical que realmente nos interesa
       reduce falsos armónicos y trabajo de CPU.
    */
    const tauMin =
        Math.max(
            2,
            Math.floor(
                sampleRate /
                FRECUENCIA_MAX_AFINADOR
            )
        );


    const tauMax =
        Math.min(
            Math.floor(
                sampleRate /
                FRECUENCIA_MIN_AFINADOR
            ),
            Math.floor(
                tamaño /
                2
            )
        );


    if (
        tauMax <=
        tauMin
    ) {

        return null;

    }


    /*
       Paso 1 de YIN:
       función de diferencia cuadrática.
       Usamos una ventana de comparación fija para que todos los tau
       se evalúen con el mismo número de muestras.
    */
    const ventanaComparacion =
        tamaño -
        tauMax;


    if (
        ventanaComparacion <
        128
    ) {

        return null;

    }


    const diferencia =
        new Float64Array(
            tauMax + 1
        );


    for (
        let tau = 1;
        tau <= tauMax;
        tau++
    ) {

        let suma =
            0;


        for (
            let i = 0;
            i < ventanaComparacion;
            i++
        ) {

            const delta =
                señal[i] -
                señal[
                    i +
                    tau
                ];


            suma +=
                delta *
                delta;

        }


        diferencia[tau] =
            suma;

    }


    /*
       Paso 2:
       cumulative mean normalized difference (CMND).
       Un mínimo cercano a 0 indica una periodicidad fuerte.
    */
    const cmnd =
        new Float64Array(
            tauMax + 1
        );


    cmnd[0] =
        1;


    let sumaAcumulada =
        0;


    for (
        let tau = 1;
        tau <= tauMax;
        tau++
    ) {

        sumaAcumulada +=
            diferencia[tau];


        cmnd[tau] =
            sumaAcumulada > 0
                ? (
                    diferencia[tau] *
                    tau
                ) /
                sumaAcumulada
                : 1;

    }


    /*
       Paso 3:
       tomar el primer mínimo local que cruza el umbral.
       Elegir el primero ayuda a evitar errores de subarmónicos.
    */
    let tauEstimado =
        -1;


    for (
        let tau = tauMin;
        tau <= tauMax;
        tau++
    ) {

        if (
            cmnd[tau] <
            UMBRAL_YIN
        ) {

            while (
                tau + 1 <= tauMax &&
                cmnd[
                    tau + 1
                ] <
                cmnd[tau]
            ) {

                tau++;

            }


            tauEstimado =
                tau;

            break;

        }

    }


    if (
        tauEstimado < 0
    ) {

        return null;

    }


    const confianza =
        Math.max(
            0,
            Math.min(
                1,
                1 -
                cmnd[
                    tauEstimado
                ]
            )
        );


    if (
        confianza <
        CONFIANZA_MINIMA_YIN
    ) {

        return null;

    }


    /*
       Paso 4:
       interpolación parabólica alrededor del mínimo para obtener
       un periodo fraccional y mejorar la precisión en cents.
    */
    let periodo =
        tauEstimado;


    if (
        tauEstimado >
            tauMin &&
        tauEstimado <
            tauMax
    ) {

        const izquierda =
            cmnd[
                tauEstimado -
                1
            ];


        const centro =
            cmnd[
                tauEstimado
            ];


        const derecha =
            cmnd[
                tauEstimado +
                1
            ];


        const denominador =
            izquierda -
            2 *
            centro +
            derecha;


        if (
            Math.abs(
                denominador
            ) >
            1e-12
        ) {

            const correccion =
                0.5 *
                (
                    izquierda -
                    derecha
                ) /
                denominador;


            if (
                Math.abs(
                    correccion
                ) <= 1
            ) {

                periodo +=
                    correccion;

            }

        }

    }


    const frecuencia =
        sampleRate /
        periodo;


    if (
        !Number.isFinite(
            frecuencia
        )
    ) {

        return null;

    }


    return {

        frecuencia,
        confianza

    };

}


// ======================================================
// ESTABILIZACIÓN
// ======================================================

function estabilizarFrecuencia(
    frecuencia,
    confianza
) {

    const midiDetectado =
        Math.round(

            69 +
            12 *
            Math.log2(
                frecuencia /
                FRECUENCIA_A4
            )

        );


    /*
       Evita que un armónico aislado cambie la nota en pantalla.
       Un cambio real se confirma con dos lecturas consecutivas.
       Si YIN viene con una confianza excepcional, se permite
       el cambio inmediato.
    */
    if (
        midiActualAfinador ===
        null
    ) {

        midiActualAfinador =
            midiDetectado;

        historialFrecuencias =
            [];

    }
    else if (
        midiDetectado !==
        midiActualAfinador
    ) {

        if (
            midiCandidatoAfinador ===
            midiDetectado
        ) {

            repeticionesMidiCandidato++;

        }
        else {

            midiCandidatoAfinador =
                midiDetectado;

            repeticionesMidiCandidato =
                1;

        }


        const cambioConfirmado =
            repeticionesMidiCandidato >=
                2 ||
            confianza >=
                0.97;


        if (
            !cambioConfirmado
        ) {

            return (
                ultimaFrecuenciaAceptada ||
                null
            );

        }


        midiActualAfinador =
            midiDetectado;

        midiCandidatoAfinador =
            null;

        repeticionesMidiCandidato =
            0;

        historialFrecuencias =
            [];

        centsSuavizados =
            null;

        afinacionEstable =
            false;

    }
    else {

        midiCandidatoAfinador =
            null;

        repeticionesMidiCandidato =
            0;

    }


    historialFrecuencias.push(
        frecuencia
    );


    /*
       Cinco lecturas son suficientes porque YIN ya rechazó
       detecciones poco confiables. Una ventana grande añade retraso.
    */
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


    let mediana;


    if (
        ordenadas.length %
        2 ===
        0
    ) {

        mediana =
            (
                ordenadas[
                    mitad -
                    1
                ] +
                ordenadas[
                    mitad
                ]
            ) /
            2;

    }
    else {

        mediana =
            ordenadas[
                mitad
            ];

    }


    ultimaFrecuenciaAceptada =
        mediana;


    return mediana;

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
                FRECUENCIA_A4
            )

        );


    const indiceNota =
        (
            midi %
            12 +
            12
        ) %
        12;


    const octava =
        Math.floor(
            midi /
            12
        ) -
        1;


    const nota =
        NOMBRES_NOTAS[
            indiceNota
        ];


    const frecuenciaObjetivo =
        FRECUENCIA_A4 *
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
       YIN ya estabiliza la detección, así que aquí solo suavizamos
       ligeramente la animación. Un filtro demasiado fuerte haría
       que el afinador pareciera preciso pero llegara tarde.
    */
    if (
        centsSuavizados ===
        null
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
            0.35;

    }


    /*
       Solo anulamos variaciones prácticamente imperceptibles.
       Así no escondemos una desviación musical real de 2-3 cents.
    */
    if (
        Math.abs(
            centsSuavizados
        ) <=
        1
    ) {

        centsSuavizados =
            0;

    }


    const centsRedondeados =
        Math.round(
            centsSuavizados
        );


    elementoNota.textContent =
        nota +
        octava;


    /*
       Mostrar lectura real y frecuencia objetivo permite comprobar
       visualmente la afinación sin agregar nuevos elementos al HTML.
    */
    elementoFrecuencia.textContent =
        frecuencia.toFixed(
            1
        ) +
        " Hz · Obj. " +
        frecuenciaObjetivo.toFixed(
            1
        ) +
        " Hz";


    elementoCents.textContent =
        (
            centsRedondeados >
            0
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
            ? 5
            : 3;


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
    "🎵 Afinador cromático AppCorus V2 YIN listo"
);