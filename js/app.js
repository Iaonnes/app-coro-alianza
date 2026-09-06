// ==========================================
// CONFIGURACIÓN
// ==========================================

const URL_API =
"https://script.google.com/macros/s/AKfycbw9uoDMOHR1k1BoGnZJWgBUVyjxreMTn0_Hw7ffHKDV8tQqSXpclpaUrV-OMzWS-0Zc/exec";


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

async function cargarInicio() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();

        const resumenMisa =
            document.getElementById("resumenMisa");

        const resumenEnsayos =
            document.getElementById("resumenEnsayos");

        resumenMisa.innerHTML = "";
        resumenEnsayos.innerHTML = "";

        // ==========================
        // PRÓXIMA MISA
        // ==========================

        const misas = [];

        data.esquemas.forEach(item => {

            const clave =
                `${item.fecha}-${item.hora}-${item.descripcion}`;

            if (!misas.some(m => m.clave === clave)) {

                misas.push({
                    clave,
                    fecha: item.fecha,
                    hora: item.hora,
                    descripcion: item.descripcion
                });

            }

        });

        if (misas.length > 0) {

            const misa = misas[0];

            resumenMisa.innerHTML = `
                <div class="card-resumen">
                    <h2>📖 Próxima Misa</h2>
                    <p><strong>${misa.fecha}</strong></p>
                    <p>⏰${misa.hora}</p>
                    <p>📍${misa.descripcion}</p>
                </div>
            `;

        }

        // ==========================
        // PRÓXIMOS 2 ENSAYOS
        // ==========================

        data.ensayos.slice(0, 2).forEach(item => {

            resumenEnsayos.innerHTML += `
                <div class="card-resumen">
                    <h2>📅 Próximo Ensayo</h2>
                    <p><strong>${item.fecha}</strong></p>
                    <p>⏰${item.hora}</p>
                    <p>📍${item.lugar}</p>
                </div>
            `;

        });

    } catch(error) {

        console.error("Error inicio:", error);

    }

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

                    <strong>
                        ${item.momento} :  
                    </strong>

                    <span>
                            🎵 ${item.canto}
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

        const response = await fetch(URL_API);
        const data = await response.json();

        const lista =
            document.getElementById("listaCantos");

        lista.innerHTML = "";

        data.cantos.forEach(categoria => {

            lista.innerHTML += `
                <li class="card">
                    <a href= ${categoria.url}
                    </a>
                    <p>📂 ${categoria.categoria}</p>
                </li>
            `;

        });

    } catch(error) {

        console.error("Error cantos:", error);

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
            <div class="cabecera-calendario">

                <button onclick="mesAnterior()">
                    ◀
                </button>

                <h2>
                    ${meses[mesActual]} ${añoActual}
                </h2>

                <button onclick="mesSiguiente()">
                    ▶
                </button>

            </div>

            <div class="calendar-grid">

                <div>L</div>
                <div>M</div>
                <div>M</div>
                <div>J</div>
                <div>V</div>
                <div>S</div>
                <div>D</div>

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
                    class="calendar-day ${color}"
                    onclick="mostrarEventosDia(${dia})">

                    ${dia}

                </div>
            `;

        }

        window.mostrarEventosDia = function(dia) {

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
                <div class="card">

                    <h2>
                        📅 ${dia} de
                        ${meses[mesActual].toLowerCase()}
                    </h2>

                </div>
            `;

            lista.forEach(evento => {

                detalle.innerHTML += `
                    <div class="card">

                        <h3 class="
                            ${String(evento.tipo).toLowerCase().includes("ensayo") ? "tipo-ensayo" : ""}
                            ${String(evento.tipo).toLowerCase().includes("misa") ? "tipo-misa" : ""}
                            ${String(evento.tipo).toLowerCase().includes("evento") ? "tipo-evento" : ""}
                            ${String(evento.tipo).toLowerCase().includes("present") ? "tipo-presentacion" : ""}
                        ">

                            ${
                                String(evento.tipo).toLowerCase().includes("misa")
                                    ? "🟡 Misa"
                                : String(evento.tipo).toLowerCase().includes("ensayo")
                                    ? "🔵 Ensayo"
                                : String(evento.tipo).toLowerCase().includes("evento")
                                    ? "🟢 Evento Especial"
                                : String(evento.tipo).toLowerCase().includes("present")
                                    ? "🟣 Presentación"
                                : evento.tipo
                            }

                        </h3>

                        <p>${evento.titulo}</p>

                        <p>⏰ ${evento.hora}</p>

                        <p>📍 ${evento.lugar}</p>

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