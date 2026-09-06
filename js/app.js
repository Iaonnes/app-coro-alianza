// ==========================================
// CONFIGURACIÓN
// ==========================================

// API AppScript AppCorus V_2
const URL_API =
"https://script.google.com/macros/s/AKfycbx7IkTSR91bHhRS0OL_48OUBM7GNkvBkgZY5casEGFqYUN2vM2W6ylUlYiR-LLxF112/exec";

const GOOGLE_CLIENT_ID =
    "765205397306-q1qna5aj3j5ifk62j28us4lqrgjk7ig8.apps.googleusercontent.com";

let googleLoginInicializado = false;


function abrirAccesoAdministracion() {

    mostrarSeccion("administracion");

    inicializarGoogleLogin();

}


function inicializarGoogleLogin() {

    if (googleLoginInicializado) {
        return;
    }

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.log(
            "Google Identity todavía no está disponible."
        );

        return;
    }


    google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: manejarLoginGoogle

    });


    google.accounts.id.renderButton(

        document.getElementById(
            "googleLoginButton"
        ),

        {
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "continue_with",
            width: 280
        }

    );


    googleLoginInicializado = true;

}


async function manejarLoginGoogle(respuestaGoogle) {

    const mensaje =
        document.getElementById(
            "adminMensaje"
        );


    mensaje.innerHTML = `
        <div class="admin-validando">
            Validando cuenta...
        </div>
    `;


    try {

        const respuesta =
            await fetch(
                URL_API,
                {
                    method: "POST",

                    body: JSON.stringify({

                        accion:
                            "validarAdmin",

                        credential:
                            respuestaGoogle.credential

                    })

                }
            );


        const resultado =
            await respuesta.json();


        if (!resultado.ok) {

            mensaje.innerHTML = `
                <div class="admin-error">
                    ⛔ ${resultado.error || "Cuenta no autorizada"}
                </div>
            `;

            return;
        }


        mostrarPanelAdministracion(
            resultado.usuario
        );


    } catch(error) {

        console.error(
            "Error validando administrador:",
            error
        );


        mensaje.innerHTML = `
            <div class="admin-error">
                No fue posible validar la cuenta.
            </div>
        `;

    }

}


function mostrarPanelAdministracion(usuario) {

    const seccion =
        document.getElementById(
            "administracion"
        );


    seccion.innerHTML = `

        <div class="admin-panel">

            <div class="admin-usuario">

                <span class="admin-avatar">
                    👤
                </span>

                <div>

                    <h2>
                        Hola, ${usuario.nombre}
                    </h2>

                    <p>
                        ${usuario.rol}
                    </p>

                    <small>
                        ${usuario.nombreCoro}
                    </small>

                </div>

            </div>


            <div class="admin-opciones">

                <button class="admin-card">

                    <span class="admin-card-icono">
                        📅
                    </span>

                    <div>
                        <strong>
                            Eventos
                        </strong>

                        <small>
                            Crear y administrar eventos
                        </small>
                    </div>

                    <span>
                        ›
                    </span>

                </button>


                <button class="admin-card">

                    <span class="admin-card-icono">
                        📖
                    </span>

                    <div>
                        <strong>
                            Esquemas
                        </strong>

                        <small>
                            Crear y modificar esquemas
                        </small>
                    </div>

                    <span>
                        ›
                    </span>

                </button>

            </div>

        </div>
    `;

}

// ==========================================
// NAVEGACIÓN
// ==========================================

function mostrarSeccion(id) {

    document.querySelectorAll(".seccion").forEach(seccion => {
        seccion.classList.remove("activa");
    });

    document.getElementById(id).classList.add("activa");
}


// ==========================================
// Resumen de Inicio
// ==========================================
// ==========================================
// INICIO
// ==========================================

async function cargarInicio() {

    try {

        const response =
            await fetch(URL_API);

        const data =
            await response.json();

        const contenedor =
            document.getElementById("inicioEventos");

        contenedor.innerHTML = "";


        // ==========================================
        // FECHA Y HORA ACTUAL
        // ==========================================

        const ahora =
            new Date();


        // ==========================================
        // EVENTOS FUTUROS
        // ==========================================

        const eventosProximos =
            data.eventos

            .map(evento => {

                const hora =
                    evento.hora
                        ? evento.hora.substring(0, 5)
                        : "00:00";

                const fechaHora =
                    new Date(
                        `${evento.fechaISO}T${hora}:00`
                    );

                return {
                    ...evento,
                    fechaHora
                };

            })

            .filter(evento =>
                evento.fechaHora >= ahora
            )

            .sort((a, b) =>
                a.fechaHora - b.fechaHora
            )

            .slice(0, 4);


        // ==========================================
        // SIN EVENTOS
        // ==========================================

        if (
            eventosProximos.length === 0
        ) {

            contenedor.innerHTML = `
                <div class="inicio-sin-eventos">

                    <div class="inicio-sin-eventos-icono">
                        📅
                    </div>

                    <h2>
                        No hay eventos próximos
                    </h2>

                    <p>
                        Cuando agregues un nuevo evento
                        aparecerá aquí.
                    </p>

                </div>
            `;

            return;
        }


        // ==========================================
        // EVENTO PRINCIPAL
        // ==========================================

        const principal =
            eventosProximos[0];

        const estiloPrincipal =
            obtenerEstiloEvento(
                principal.tipo
            );

        const fechaPrincipal =
            formatearFechaInicio(
                principal.fechaHora
            );

        const faltante =
            obtenerTextoFaltante(
                principal.fechaHora
            );


        let html = `

            <div class="inicio-encabezado">

                <p class="inicio-fecha-hoy">
                    ${formatearFechaHoy()}
                </p>

                <h2>
                    Próximo evento
                </h2>

            </div>


            <div class="
                evento-destacado
                ${estiloPrincipal.clase}
            ">

                <div class="evento-destacado-superior">

                    <span class="evento-tipo-badge">
                        ${estiloPrincipal.icono}
                        ${principal.tipo}
                    </span>

                    <span class="evento-faltante">
                        ${faltante}
                    </span>

                </div>


                <div class="evento-destacado-contenido">

                    <div class="evento-fecha-grande">

                        <span class="evento-dia-semana">
                            ${fechaPrincipal.diaSemana}
                        </span>

                        <strong>
                            ${fechaPrincipal.dia}
                        </strong>

                        <span class="evento-mes">
                            ${fechaPrincipal.mes}
                        </span>

                    </div>


                    <div class="evento-info-principal">

                        <h3>
                            ${principal.titulo || principal.tipo}
                        </h3>

                        <p>
                            🕒 ${principal.hora}
                        </p>

                        ${
                            principal.lugar
                                ? `
                                    <p>
                                        📍 ${principal.lugar}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                </div>

            </div>
        `;


        // ==========================================
        // SIGUIENTES EVENTOS
        // ==========================================

        const siguientes =
            eventosProximos.slice(1);


        if (
            siguientes.length > 0
        ) {

            html += `

                <div class="inicio-proximamente">

                    <h3>
                        Próximamente
                    </h3>

                    <div class="lista-proximos-eventos">
            `;


            siguientes.forEach(
                evento => {

                    const estilo =
                        obtenerEstiloEvento(
                            evento.tipo
                        );

                    const fecha =
                        formatearFechaCompacta(
                            evento.fechaHora
                        );


                    html += `

                        <div class="
                            evento-proximo
                            ${estilo.clase}
                        ">

                            <div class="evento-proximo-fecha">

                                <strong>
                                    ${fecha.dia}
                                </strong>

                                <span>
                                    ${fecha.mes}
                                </span>

                            </div>


                            <div class="evento-proximo-info">

                                <strong>
                                    ${estilo.icono}
                                    ${evento.tipo}
                                </strong>

                                <span>
                                    ${evento.titulo || ""}
                                </span>

                                <small>
                                    🕒 ${evento.hora}
                                    ${
                                        evento.lugar
                                            ? ` · 📍 ${evento.lugar}`
                                            : ""
                                    }
                                </small>

                            </div>

                        </div>
                    `;

                }
            );


            html += `
                    </div>
                </div>
            `;

        }


        // ==========================================
        // BOTÓN CALENDARIO
        // ==========================================

        html += `

            <div class="inicio-acciones">

                <button
                    class="btn-ver-calendario"
                    onclick="mostrarSeccion('ensayos')">

                    📅 Ver calendario completo

                </button>

            </div>
        `;


        contenedor.innerHTML =
            html;


    } catch(error) {

        console.error(
            "Error inicio:",
            error
        );

    }

}



// ==========================================
// ESTILO SEGÚN TIPO DE EVENTO
// ==========================================

function obtenerEstiloEvento(tipo) {

    const texto =
        String(tipo || "")
            .toLowerCase();


    if (
        texto.includes("ensayo")
    ) {

        return {
            icono: "🎼",
            clase: "evento-ensayo"
        };

    }


    if (
        texto.includes("misa")
    ) {

        return {
            icono: "⛪",
            clase: "evento-misa"
        };

    }


    if (
        texto.includes("present")
    ) {

        return {
            icono: "🎤",
            clase: "evento-presentacion"
        };

    }


    if (
        texto.includes("evento")
    ) {

        return {
            icono: "✨",
            clase: "evento-especial"
        };

    }


    // Cualquier tipo nuevo que agregues
    return {
        icono: "📌",
        clase: "evento-otro"
    };

}



// ==========================================
// FECHA PRINCIPAL
// ==========================================

function formatearFechaInicio(fecha) {

    const dias = [
        "DOM",
        "LUN",
        "MAR",
        "MIÉ",
        "JUE",
        "VIE",
        "SÁB"
    ];

    const meses = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE"
    ];


    return {

        diaSemana:
            dias[
                fecha.getDay()
            ],

        dia:
            String(
                fecha.getDate()
            ).padStart(
                2,
                "0"
            ),

        mes:
            meses[
                fecha.getMonth()
            ]

    };

}



// ==========================================
// FECHA COMPACTA
// ==========================================

function formatearFechaCompacta(fecha) {

    const meses = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC"
    ];


    return {

        dia:
            fecha.getDate(),

        mes:
            meses[
                fecha.getMonth()
            ]

    };

}



// ==========================================
// FECHA ACTUAL
// ==========================================

function formatearFechaHoy() {

    const fecha =
        new Date();


    return fecha
        .toLocaleDateString(
            "es-MX",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

}



// ==========================================
// TEXTO "HOY / MAÑANA / FALTAN X DÍAS"
// ==========================================

function obtenerTextoFaltante(
    fechaEvento
) {

    const hoy =
        new Date();

    hoy.setHours(
        0,
        0,
        0,
        0
    );


    const evento =
        new Date(
            fechaEvento
        );

    evento.setHours(
        0,
        0,
        0,
        0
    );


    const diferencia =
        Math.round(
            (
                evento -
                hoy
            ) /
            86400000
        );


    if (
        diferencia === 0
    ) {

        return "Hoy";

    }


    if (
        diferencia === 1
    ) {

        return "Mañana";

    }


    return `Faltan ${diferencia} días`;

}
// ==========================================
// ENSAYOS
// ==========================================

async function cargarEnsayos() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();

        const contenedor =
            document.getElementById("listaEnsayos");

        contenedor.innerHTML = "";

        data.ensayos.forEach(item => {

            contenedor.innerHTML += `
                <div class="card">
                    <h3>📅 ${item.fecha}</h3>
                    <p>⏰ ${item.hora}</p>
                    <p>📍 ${item.lugar}</p>
                    <p>📝 ${item.descripcion || ""}</p>
                </div>
            `;
        });

    } catch(error) {

        console.error(error);

    }
}

// ==========================================
// ESQUEMAS
// ==========================================

let indiceEsquema = 0;
let fechasDisponibles = [];

async function cargarEsquemas() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();

        const contenedor =
            document.getElementById("listaEsquemas");

        contenedor.innerHTML = "";

        if (data.esquemas.length === 0) {

            contenedor.innerHTML = `
                <div class="card">
                    No hay esquemas disponibles.
                </div>
            `;

            return;
        }

        fechasDisponibles = [];

        data.esquemas.forEach(item => {

            const clave =
                `${item.fecha}-${item.hora}-${item.descripcion}`;

            if (!fechasDisponibles.some(f => f.clave === clave)) {

                fechasDisponibles.push({
                    clave,
                    fecha: item.fecha,
                    hora: item.hora,
                    descripcion: item.descripcion
                });

            }

        });

        if (
            indiceEsquema >
            fechasDisponibles.length - 1
        ) {

            indiceEsquema =
                fechasDisponibles.length - 1;

        }

        const esquemaActual =
            fechasDisponibles[indiceEsquema];

        const fechaSeleccionada =
            esquemaActual.fecha;

        const horaSeleccionada =
            esquemaActual.hora;

        const descripcionSeleccionada =
            esquemaActual.descripcion;

        contenedor.innerHTML = `
            <div class="navegacion-esquema">

                <button
                    onclick="cambiarEsquema(-1)"
                    ${indiceEsquema === 0 ? "disabled" : ""}>
                    ◀
                </button>

                <div class="titulo-esquema">

                    <h2>
                        📅 Esquema del ${fechaSeleccionada}
                    </h2>

                    <p>
                        🕒 ${horaSeleccionada}
                    </p>

                </div>

                <button
                    onclick="cambiarEsquema(1)"
                    ${indiceEsquema === fechasDisponibles.length - 1 ? "disabled" : ""}>
                    ▶
                </button>

            </div>

                <p class="descripcion-esquema">
                    ${descripcionSeleccionada}
                </p>

            <div class="card" id="cardEsquema"></div>
        `;

        const card =
            document.getElementById("cardEsquema");

        const esquemaDelDia =
            data.esquemas.filter(item =>

                item.fecha === fechaSeleccionada &&
                item.hora === horaSeleccionada &&
                item.descripcion === descripcionSeleccionada

            );

            esquemaDelDia.forEach(item => {

                card.innerHTML += `
                    <div class="linea-canto">
                        <span class="momento">
                            ${item.momento} :
                        </span>

                        <span class="canto">
                            ${
                                item.canto && item.canto.trim() !== ""
                                    ? `🎵 ${item.canto}`
                                    : `<span class="canto-vacio">Pendiente</span>`
                            }
                        </span>
                    </div>
                `;

            });

    } catch (error) {

        console.error("Error esquemas:", error);

        document.getElementById("listaEsquemas").innerHTML = `
            <div class="card">
                Error al cargar los esquemas.
            </div>
        `;

    }

}

function cambiarEsquema(direccion) {

    indiceEsquema += direccion;

    if (indiceEsquema < 0) {

        indiceEsquema = 0;

    }

    if (
        indiceEsquema >
        fechasDisponibles.length - 1
    ) {

        indiceEsquema =
            fechasDisponibles.length - 1;

    }

    cargarEsquemas();

}
// ==========================================
// CANTOS
// ==========================================

async function cargarCantos() {

    try {

        const response =
            await fetch(URL_API);

        const data =
            await response.json();

        const lista =
            document.getElementById("listaCantos");

        lista.innerHTML = "";


        if (
            !data.cantos ||
            data.cantos.length === 0
        ) {

            lista.innerHTML = `
                <li class="cantos-vacio">
                    🎵 No hay categorías disponibles
                </li>
            `;

            return;
        }


        data.cantos.forEach(categoria => {

            lista.innerHTML += `
                <li class="canto-categoria">

                    <a
                        href="${categoria.url}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <div class="canto-categoria-icono">
                            🎵
                        </div>

                        <div class="canto-categoria-info">

                            <strong>
                                ${categoria.categoria}
                            </strong>

                            <span>
                                Abrir carpeta de cantos
                            </span>

                        </div>

                        <div class="canto-categoria-flecha">
                            ›
                        </div>

                    </a>

                </li>
            `;

        });


    } catch(error) {

        console.error(
            "Error cantos:",
            error
        );

    }

}
// ==========================================
// CALENDARIO
// ==========================================

let mesActual = 0;
let añoActual = 0;
let eventosCalendario = [];
let mesesDisponibles = [];

async function cargarCalendario() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();

        eventosCalendario = data.eventos;

        const calendario =
            document.getElementById("calendarioEventos");

        const detalle =
            document.getElementById("detalleFecha");

        calendario.innerHTML = "";
        detalle.innerHTML = "";

        const meses = [
            "Enero","Febrero","Marzo",
            "Abril","Mayo","Junio",
            "Julio","Agosto","Septiembre",
            "Octubre","Noviembre","Diciembre"
        ];

        mesesDisponibles = [];

        eventosCalendario.forEach(evento => {

            const partes =
                evento.fecha.split(" de ");

            const nombreMes =
                partes[1];

            const indiceMes =
                meses.findIndex(
                    m => m.toLowerCase() === nombreMes
                );

            const clave =
                `${indiceMes}-2026`;

            if (!mesesDisponibles.some(m => m.clave === clave)) {

                mesesDisponibles.push({
                    clave,
                    mes: indiceMes,
                    año: 2026
                });

            }

        });

        if (!mesesDisponibles.length) {
            return;
        }

        if (mesActual === 0 && añoActual === 0) {

            mesActual =
                mesesDisponibles[0].mes;

            añoActual =
                mesesDisponibles[0].año;

        }

        const primerDia =
            new Date(añoActual, mesActual, 1)
                .getDay();

        const diasMes =
            new Date(
                añoActual,
                mesActual + 1,
                0
            ).getDate();

            calendario.innerHTML = `
                <div class="calendario-panel">

                    <div class="cabecera-calendario">

                        <button onclick="mesAnterior()">
                            ◀
                        </button>

                        <div class="titulo-calendario-principal">
                            <h2 class="titulo-calendario">
                                📅 Calendario
                            </h2>

                            <p class="subtitulo-calendario">
                                ${meses[mesActual]} ${añoActual}
                            </p>
                        </div>

                        <button onclick="mesSiguiente()">
                            ▶
                        </button>

                    </div>

                    <div class="calendar-grid">
                        <div class="calendar-weekday">L</div>
                        <div class="calendar-weekday">M</div>
                        <div class="calendar-weekday">M</div>
                        <div class="calendar-weekday">J</div>
                        <div class="calendar-weekday">V</div>
                        <div class="calendar-weekday">S</div>
                        <div class="calendar-weekday">D</div>
                    </div>

                </div>
            `;

        const grid =
            calendario.querySelector(".calendar-grid");

        const offset =
            primerDia === 0
                ? 6
                : primerDia - 1;

        for (let i = 0; i < offset; i++) {

            grid.innerHTML += `
                <div class="calendar-empty"></div>
            `;

        }

        for (let dia = 1; dia <= diasMes; dia++) {

            const eventoDia =
                eventosCalendario.filter(evento => {

                    const partes =
                        evento.fecha.split(" de ");

                    const diaEvento =
                        parseInt(partes[0]);

                    const mesEvento =
                        meses.findIndex(
                            m =>
                                m.toLowerCase() ===
                                partes[1]
                        );

                    return (
                        diaEvento === dia &&
                        mesEvento === mesActual
                    );

                });

            let color = "";

            if (eventoDia.length > 0) {

                const tipo =
                    String(eventoDia[0].tipo || "")
                        .toLowerCase()
                        .trim();

                if (tipo.includes("misa")) {

                    color = "calendar-misa";

                } else if (tipo.includes("ensayo")) {

                    color = "calendar-ensayo";

                } else if (tipo.includes("evento")) {

                    color = "calendar-evento";

                } else if (tipo.includes("present")) {

                    color = "calendar-presentacion";

                }

            }

                grid.innerHTML += `
                    <div
                        class="calendar-day ${color} ${eventoDia.length > 0 ? "has-event" : ""}"
                        data-day="${dia}"
                        onclick="mostrarEventosDia(${dia})">

                        ${dia}

                    </div>
                `;

        }

        window.mostrarEventosDia = function(dia) {
            
            document
                    .querySelectorAll(".calendar-day")
                    .forEach(el => el.classList.remove("selected"));

                const diaActivo =
                    document.querySelector(`.calendar-day[data-day="${dia}"]`);

                if (diaActivo) {
                    diaActivo.classList.add("selected");
                }

            const lista =
                eventosCalendario.filter(evento => {

                    const partes =
                        evento.fecha.split(" de ");

                    const diaEvento =
                        parseInt(partes[0]);

                    const mesEvento =
                        meses.findIndex(
                            m =>
                                m.toLowerCase() ===
                                partes[1]
                        );

                    return (
                        diaEvento === dia &&
                        mesEvento === mesActual
                    );

                });

                detalle.innerHTML = `
                    <div class="card card-dia-seleccionado">

                        <h2>
                            📅 ${dia} de ${meses[mesActual].toLowerCase()}
                        </h2>

                        <p>
                            ${lista.length} evento(s) programado(s)
                        </p>

                    </div>
                `;

            lista.forEach(evento => {

                const tipoTexto =
                    String(evento.tipo || "").toLowerCase().trim();

                let claseChip = "tipo-evento-chip";
                let etiqueta = "🟢 Evento";

                if (tipoTexto.includes("misa")) {
                    claseChip = "tipo-misa-chip";
                    etiqueta = "🟡 Misa";
                } else if (tipoTexto.includes("ensayo")) {
                    claseChip = "tipo-ensayo-chip";
                    etiqueta = "🔵 Ensayo";
                } else if (tipoTexto.includes("present")) {
                    claseChip = "tipo-presentacion-chip";
                    etiqueta = "🟣 Presentación";
                }

                detalle.innerHTML += `
                    <div class="card card-evento-calendario">

                        <div class="tipo-chip ${claseChip}">
                            ${etiqueta}
                        </div>

                        <div class="evento-contenido">
                            <h3>${evento.titulo}</h3>
                            <p>⏰ ${evento.hora}</p>
                            <p>📍 ${evento.lugar || "Sin ubicación"}</p>
                        </div>

                    </div>
                `;

            });

        };

    } catch(error) {

        console.error(
            "Error calendario:",
            error
        );

    }

}
function mesAnterior() {

    const indice =
        mesesDisponibles.findIndex(
            m =>
                m.mes === mesActual &&
                m.año === añoActual
        );

    if (indice > 0) {

        mesActual =
            mesesDisponibles[indice - 1].mes;

        añoActual =
            mesesDisponibles[indice - 1].año;

        cargarCalendario();

    }

}

function mesSiguiente() {

    const indice =
        mesesDisponibles.findIndex(
            m =>
                m.mes === mesActual &&
                m.año === añoActual
        );

    if (
        indice <
        mesesDisponibles.length - 1
    ) {

        mesActual =
            mesesDisponibles[indice + 1].mes;

        añoActual =
            mesesDisponibles[indice + 1].año;

        cargarCalendario();

    }

}
// ==========================================
// FILTRO
// ==========================================

function filtrarCantos() {

    const texto =
        document.getElementById("buscarCanto")
        .value
        .toLowerCase();

    const elementos =
        document.querySelectorAll("#listaCantos li");

    elementos.forEach(item => {

        const nombre =
            item.textContent.toLowerCase();

        item.style.display =
            nombre.includes(texto)
                ? ""
                : "none";
    });
}
function mostrarDetalleCalendario(evento) {

    const detalle =
        document.getElementById("detalleFecha");

    detalle.innerHTML = `
        <div class="card">

            <h2>
                📅 ${evento.fecha}
            </h2>

            <h3 class="
                ${evento.tipo === "Ensayo" ? "tipo-ensayo" : ""}
                ${evento.tipo === "Misa Dominical" ? "tipo-misa" : ""}
                ${evento.tipo === "Evento Especial" ? "tipo-evento" : ""}
                ${evento.tipo === "Presentación" ? "tipo-presentacion" : ""}
            ">

                ${
                    evento.tipo === "Ensayo"
                        ? "🔵 Ensayo"
                    : evento.tipo === "Misa Dominical"
                        ? "🟡 Misa"
                    : evento.tipo === "Evento Especial"
                        ? "🟢 Evento Especial"
                    : evento.tipo === "Presentación"
                        ? "🟣 Presentación"
                    : evento.tipo
                }

            </h3>

            <p>${evento.titulo}</p>

            <p>⏰ ${evento.hora}</p>

            ${
                evento.lugar
                    ? `<p>📍 ${evento.lugar}</p>`
                    : ""
            }

        </div>
    `;

}

// ==========================================
// INICIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    cargarInicio();
    cargarEsquemas();
    cargarCantos();
    cargarCalendario();

});