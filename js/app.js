// ======================================================
// APPCORUS V3.2
// OPTIMIZACIÓN DE CARGA
// ======================================================


// ======================================================
// CONFIGURACIÓN
// ======================================================

const URL_API =
"https://script.google.com/macros/s/AKfycbx7IkTSR91bHhRS0OL_48OUBM7GNkvBkgZY5casEGFqYUN2vM2W6ylUlYiR-LLxF112/exec";


const GOOGLE_CLIENT_ID =
"765205397306-q1qna5aj3j5ifk62j28us4lqrgjk7ig8.apps.googleusercontent.com";


let googleLoginInicializado = false;


// ======================================================
// CACHÉ DE DATOS DE LA APP
// ======================================================
//
// Antes:
// Inicio     → fetch
// Esquemas   → fetch
// Cantos     → fetch
// Calendario → fetch
//
// Ahora:
//              1 fetch
//                 ↓
//             appDataCache
//           ↙   ↓   ↓   ↘
//     Inicio Esquemas Cantos Calendario
//
// ======================================================

let appDataCache = null;

let appDataPromise = null;

let appDataGeneracion = 0;


// ======================================================
// OBTENER DATOS
// ======================================================

async function obtenerDatosApp(
    forzar = false
) {

    // Ya tenemos datos en memoria.
    if (
        !forzar &&
        appDataCache
    ) {

        return appDataCache;

    }


    // Ya existe una consulta en proceso.
    if (
        !forzar &&
        appDataPromise
    ) {

        return appDataPromise;

    }


    const generacion =
        ++appDataGeneracion;


    const consulta =
        fetch(

            URL_API,

            {
                cache: "no-store"
            }

        )
        .then(
            async respuesta => {

                if (
                    !respuesta.ok
                ) {

                    throw new Error(
                        "Error HTTP " +
                        respuesta.status
                    );

                }


                const data =
                    await respuesta.json();


                if (
                    data.meta &&
                    data.meta.ok === false
                ) {

                    throw new Error(
                        data.meta.error ||
                        "La API devolvió un error."
                    );

                }


                return data;

            }
        );


    appDataPromise =
        consulta;


    try {

        const data =
            await consulta;


        // Evita que una consulta vieja reemplace
        // datos obtenidos por una consulta más nueva.
        if (
            generacion ===
            appDataGeneracion
        ) {

            appDataCache =
                data;

        }


        return data;


    } finally {

        if (
            appDataPromise ===
            consulta
        ) {

            appDataPromise =
                null;

        }

    }

}


// ======================================================
// INVALIDAR CACHÉ
// ======================================================

function invalidarDatosApp() {

    appDataCache =
        null;


    appDataGeneracion++;

}


// ======================================================
// RECARGAR DATOS DESDE GOOGLE
// ======================================================

async function refrescarDatosApp() {

    invalidarDatosApp();


    return await obtenerDatosApp(
        true
    );

}


// ======================================================
// SESIÓN ADMINISTRATIVA
// ======================================================

let adminCredential =
    null;


let adminUsuario =
    null;


// ======================================================
// ABRIR ADMINISTRACIÓN
// ======================================================

function abrirAccesoAdministracion() {

    mostrarSeccion(
        "administracion"
    );


    if (
        adminUsuario
    ) {

        mostrarPanelAdministracion(
            adminUsuario
        );


        return;

    }


    inicializarGoogleLogin();

}


// ======================================================
// GOOGLE LOGIN
// ======================================================

function inicializarGoogleLogin() {

    if (
        window.location.protocol ===
        "file:"
    ) {

        const contenedor =
            document.getElementById(
                "googleLoginButton"
            );


        const mensaje =
            document.getElementById(
                "adminMensaje"
            );


        if (contenedor) {

            contenedor.innerHTML =
                "";

        }


        if (mensaje) {

            mensaje.innerHTML = `

                <div class="admin-validando">

                    🔐 El acceso administrativo está
                    disponible en la versión publicada
                    de AppCorus.

                </div>

            `;

        }


        return;

    }


    if (
        googleLoginInicializado
    ) {

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


    const contenedor =
        document.getElementById(
            "googleLoginButton"
        );


    if (
        !contenedor
    ) {

        return;

    }


    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            manejarLoginGoogle

    });


    google.accounts.id.renderButton(

        contenedor,

        {

            theme:
                "outline",

            size:
                "large",

            shape:
                "pill",

            text:
                "continue_with",

            width:
                280

        }

    );


    googleLoginInicializado =
        true;

}


// ======================================================
// PROCESAR LOGIN GOOGLE
// ======================================================

async function manejarLoginGoogle(
    respuestaGoogle
) {

    const mensaje =
        document.getElementById(
            "adminMensaje"
        );


    if (mensaje) {

        mensaje.innerHTML = `

            <div class="admin-validando">

                Validando cuenta...

            </div>

        `;

    }


    try {

        const respuesta =
            await fetch(

                URL_API,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            accion:
                                "validarAdmin",

                            credential:
                                respuestaGoogle.credential

                        })

                }

            );


        const resultado =
            await respuesta.json();


        if (
            !resultado.ok
        ) {

            if (mensaje) {

                mensaje.innerHTML = `

                    <div class="admin-error">

                        ⛔ ${
                            escaparHtml(
                                resultado.error ||
                                "Cuenta no autorizada"
                            )
                        }

                    </div>

                `;

            }


            return;

        }


        adminCredential =
            respuestaGoogle.credential;


        adminUsuario =
            resultado.usuario;


        mostrarPanelAdministracion(
            resultado.usuario
        );


    } catch(error) {

        console.error(
            "Error validando administrador:",
            error
        );


        if (mensaje) {

            mensaje.innerHTML = `

                <div class="admin-error">

                    No fue posible validar la cuenta.

                </div>

            `;

        }

    }

}


// ======================================================
// PANEL ADMINISTRACIÓN
// ======================================================

function mostrarPanelAdministracion(
    usuario
) {

    const seccion =
        document.getElementById(
            "administracion"
        );


    if (
        !seccion
    ) {

        return;

    }


    seccion.innerHTML = `

        <div class="admin-panel">


            <div class="admin-usuario">

                <span class="admin-avatar">
                    👤
                </span>


                <div>

                    <h2>
                        Hola, ${escaparHtml(usuario.nombre)}
                    </h2>

                    <p>
                        ${escaparHtml(usuario.rol)}
                    </p>

                    <small>
                        ${escaparHtml(usuario.nombreCoro)}
                    </small>

                </div>

            </div>


            <div class="admin-opciones">


                <button
                    id="btnAdminEventos"
                    class="admin-card"
                    type="button">

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


                <button
                    id="btnAdminEsquemas"
                    class="admin-card"
                    type="button">

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


    document
        .getElementById(
            "btnAdminEventos"
        )
        ?.addEventListener(

            "click",

            () =>
                abrirAdminEventos()

        );


    document
        .getElementById(
            "btnAdminEsquemas"
        )
        ?.addEventListener(

            "click",

            () =>
                abrirAdminEsquemas()

        );

}


// ======================================================
// ADMINISTRACIÓN - EVENTOS
// ======================================================

async function abrirAdminEventos(
    datosPrecargados = null
) {

    if (
        !adminUsuario ||
        !adminCredential
    ) {

        abrirAccesoAdministracion();


        return;

    }


    const seccion =
        document.getElementById(
            "administracion"
        );


    if (
        !seccion
    ) {

        return;

    }


    seccion.innerHTML = `

        <div class="admin-eventos">


            <div class="admin-eventos-cabecera">

                <div>

                    <button
                        id="btnVolverAdmin"
                        class="admin-volver"
                        type="button">

                        ← Administración

                    </button>


                    <h2>
                        📅 Eventos
                    </h2>


                    <p>

                        Administra las actividades de
                        ${
                            escaparHtml(
                                adminUsuario.nombreCoro ||
                                "tu coro"
                            )
                        }.

                    </p>

                </div>


                <button
                    id="btnNuevoEvento"
                    class="admin-nuevo-evento"
                    type="button">

                    + Nuevo evento

                </button>

            </div>


            <div
                id="adminListaEventos"
                class="admin-lista-eventos">

                <div class="admin-validando">

                    Cargando eventos...

                </div>

            </div>


        </div>

    `;


    document
        .getElementById(
            "btnVolverAdmin"
        )
        ?.addEventListener(

            "click",

            () => {

                mostrarPanelAdministracion(
                    adminUsuario
                );

            }

        );


    document
        .getElementById(
            "btnNuevoEvento"
        )
        ?.addEventListener(

            "click",

            () =>
                abrirFormularioNuevoEvento()

        );


    try {

        // ======================================
        // AQUÍ YA NO HACEMOS FETCH NUEVO
        // SI LOS DATOS ESTÁN EN CACHÉ
        // ======================================

        const data =
            datosPrecargados ||
            await obtenerDatosApp();


        const eventos =
            Array.isArray(
                data.eventos
            )

                ? [...data.eventos]

                : [];


        eventos.sort(

            (a, b) =>

                obtenerFechaHoraAdmin(a) -

                obtenerFechaHoraAdmin(b)

        );


        renderizarAdminEventos(
            eventos
        );


    } catch(error) {

        console.error(
            "Error cargando eventos:",
            error
        );


        const lista =
            document.getElementById(
                "adminListaEventos"
            );


        if (lista) {

            lista.innerHTML = `

                <div class="admin-error">

                    No fue posible cargar los eventos.

                </div>

            `;

        }

    }

}


// ======================================================
// RENDER EVENTOS ADMIN
// ======================================================

function renderizarAdminEventos(
    eventos
) {

    const contenedor =
        document.getElementById(
            "adminListaEventos"
        );


    if (
        !contenedor
    ) {

        return;

    }


    if (
        !eventos.length
    ) {

        contenedor.innerHTML = `

            <div class="admin-eventos-vacio">

                <div class="admin-eventos-vacio-icono">
                    📅
                </div>

                <h3>
                    No hay eventos registrados
                </h3>

                <p>
                    Crea el primer evento desde
                    “Nuevo evento”.
                </p>

            </div>

        `;


        return;

    }


    const ahora =
        new Date();


    const proximos =
        eventos.filter(

            evento =>
                obtenerFechaHoraAdmin(
                    evento
                ) >= ahora

        );


    const anteriores =
        eventos.filter(

            evento =>
                obtenerFechaHoraAdmin(
                    evento
                ) < ahora

        );


    let html =
        "";


    if (
        proximos.length
    ) {

        html += `

            <div class="admin-eventos-grupo">

                <h3 class="admin-eventos-subtitulo">

                    Próximos eventos

                </h3>


                ${
                    proximos
                        .map(
                            evento =>
                                crearTarjetaAdminEvento(
                                    evento
                                )
                        )
                        .join("")
                }

            </div>

        `;

    }


    if (
        anteriores.length
    ) {

        html += `

            <details class="admin-eventos-anteriores">

                <summary>

                    Ver eventos anteriores
                    (${anteriores.length})

                </summary>


                <div
                    class="
                        admin-eventos-grupo
                        admin-eventos-grupo-anteriores
                    ">

                    ${
                        anteriores
                            .slice()
                            .reverse()
                            .map(
                                evento =>
                                    crearTarjetaAdminEvento(
                                        evento,
                                        true
                                    )
                            )
                            .join("")
                    }

                </div>

            </details>

        `;

    }


    contenedor.innerHTML =
        html;

}


// ======================================================
// TARJETA EVENTO ADMIN
// ======================================================

function crearTarjetaAdminEvento(
    evento,
    esAnterior = false
) {

    const estilo =
        obtenerEstiloEvento(
            evento.tipo
        );


    const fecha =
        obtenerFechaAdmin(
            evento
        );


    const idEvento =
        escaparHtml(
            evento.idEvento || ""
        );


    const tipo =
        escaparHtml(
            evento.tipo ||
            "Evento"
        );


    const titulo =
        escaparHtml(
            evento.titulo ||
            evento.tipo ||
            "Evento"
        );


    const hora =
        escaparHtml(

            String(
                evento.hora ||
                ""
            )
            .substring(
                0,
                5
            )

        );


    const lugar =
        escaparHtml(
            evento.lugar ||
            ""
        );


    return `

        <article
            class="
                admin-evento-card
                ${estilo.clase}
                ${
                    esAnterior
                        ? "admin-evento-anterior"
                        : ""
                }
            ">


            <div class="admin-evento-fecha">

                <strong>
                    ${fecha.dia}
                </strong>

                <span>
                    ${fecha.mes}
                </span>

            </div>


            <div class="admin-evento-info">

                <div class="admin-evento-tipo">

                    ${estilo.icono}
                    ${tipo}

                </div>


                <h3>
                    ${titulo}
                </h3>


                <div class="admin-evento-meta">

                    ${
                        hora
                            ? `
                                <span>
                                    🕒 ${hora}
                                </span>
                            `
                            : ""
                    }


                    ${
                        lugar
                            ? `
                                <span>
                                    📍 ${lugar}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="admin-evento-acciones">


                <button
                    class="admin-evento-editar"
                    type="button"
                    onclick="editarEventoAdmin('${idEvento}')">

                    Editar

                </button>


                <button
                    class="admin-evento-eliminar"
                    type="button"
                    onclick="eliminarEventoAdmin('${idEvento}')">

                    Eliminar

                </button>


            </div>

        </article>

    `;

}


// ======================================================
// FECHA/HORA ADMIN
// ======================================================

function obtenerFechaHoraAdmin(
    evento
) {

    const fechaISO =
        String(
            evento.fechaISO ||
            ""
        )
        .trim();


    const hora =
        String(
            evento.hora ||
            "00:00"
        )
        .substring(
            0,
            5
        );


    if (
        fechaISO
    ) {

        const fecha =
            new Date(

                `${fechaISO}T${
                    hora ||
                    "00:00"
                }:00`

            );


        if (
            !isNaN(
                fecha.getTime()
            )
        ) {

            return fecha;

        }

    }


    return new Date(
        9999,
        0,
        1
    );

}


// ======================================================
// FECHA ADMIN
// ======================================================

function obtenerFechaAdmin(
    evento
) {

    const fecha =
        obtenerFechaHoraAdmin(
            evento
        );


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


    if (
        fecha.getFullYear() ===
        9999
    ) {

        return {

            dia:
                "--",

            mes:
                "---"

        };

    }


    return {

        dia:
            String(
                fecha.getDate()
            )
            .padStart(
                2,
                "0"
            ),

        mes:
            meses[
                fecha.getMonth()
            ]

    };

}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escaparHtml(
    valor
) {

    return String(
        valor ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ======================================================
// NUEVO EVENTO
// ======================================================

async function abrirFormularioNuevoEvento(
    datosPrecargados = null
) {

    if (
        !adminUsuario ||
        !adminCredential
    ) {

        abrirAccesoAdministracion();


        return;

    }


    const seccion =
        document.getElementById(
            "administracion"
        );


    if (
        !seccion
    ) {

        return;

    }


    seccion.innerHTML = `

        <div class="admin-formulario-evento">

            <button
                id="btnVolverEventos"
                class="admin-volver"
                type="button">

                ← Eventos

            </button>


            <div class="admin-formulario-encabezado">

                <div class="admin-formulario-icono">
                    📅
                </div>

                <div>

                    <h2>
                        Nuevo evento
                    </h2>

                    <p>
                        ${
                            escaparHtml(
                                adminUsuario.nombreCoro ||
                                ""
                            )
                        }
                    </p>

                </div>

            </div>


            <div id="adminFormularioContenido">

                <div class="admin-validando">

                    Cargando formulario...

                </div>

            </div>

        </div>

    `;


    document
        .getElementById(
            "btnVolverEventos"
        )
        ?.addEventListener(

            "click",

            () =>
                abrirAdminEventos()

        );


    try {

        // ======================================
        // USA LOS MISMOS DATOS DEL FETCH INICIAL
        // ======================================

        const data =
            datosPrecargados ||
            await obtenerDatosApp();


        const catalogos =
            data.catalogos ||
            {};


        const tiposEvento =
            Array.isArray(
                catalogos.tiposEvento
            )
                ? catalogos.tiposEvento
                : [];


        const lugares =
            Array.isArray(
                catalogos.lugares
            )
                ? catalogos.lugares
                : [];


        if (
            tiposEvento.length ===
            0
        ) {

            throw new Error(
                "No existen tipos de evento en el catálogo."
            );

        }


        renderizarFormularioNuevoEvento(
            tiposEvento,
            lugares
        );


    } catch(error) {

        console.error(
            "Error cargando formulario:",
            error
        );


        const contenido =
            document.getElementById(
                "adminFormularioContenido"
            );


        if (contenido) {

            contenido.innerHTML = `

                <div class="admin-error">

                    No fue posible cargar los catálogos.

                </div>

            `;

        }

    }

}


// ======================================================
// RENDER NUEVO EVENTO
// ======================================================

function renderizarFormularioNuevoEvento(
    tiposEvento,
    lugares
) {

    const contenido =
        document.getElementById(
            "adminFormularioContenido"
        );


    if (
        !contenido
    ) {

        return;

    }


    const opcionesTipo =
        tiposEvento
            .map(
                tipo => `

                    <option
                        value="${escaparHtml(tipo)}">

                        ${escaparHtml(tipo)}

                    </option>

                `
            )
            .join("");


    const opcionesLugar =
        lugares
            .map(
                lugar => `

                    <option
                        value="${escaparHtml(lugar)}">

                        ${escaparHtml(lugar)}

                    </option>

                `
            )
            .join("");


    contenido.innerHTML = `

        <form
            id="formNuevoEvento"
            class="admin-evento-form">


            <div class="admin-form-fila">


                <div class="admin-form-campo">

                    <label for="eventoFecha">
                        Fecha *
                    </label>

                    <input
                        type="date"
                        id="eventoFecha"
                        required>

                </div>


                <div class="admin-form-campo">

                    <label for="eventoHora">
                        Hora *
                    </label>

                    <input
                        type="time"
                        id="eventoHora"
                        required>

                </div>


            </div>


            <div class="admin-form-campo">

                <label for="eventoTipo">
                    Tipo de evento *
                </label>


                <select
                    id="eventoTipo"
                    required>

                    <option value="">
                        Selecciona un tipo
                    </option>

                    ${opcionesTipo}

                </select>

            </div>


            <div class="admin-form-campo">

                <label for="eventoDescripcion">
                    Descripción *
                </label>

                <input
                    type="text"
                    id="eventoDescripcion"
                    maxlength="150"
                    placeholder="Ej. Ensayo Coro Nueva Alianza"
                    required>

            </div>


            <div class="admin-form-campo">

                <label for="eventoLugar">
                    Lugar
                </label>


                <select id="eventoLugar">

                    <option value="">
                        Sin lugar / Por definir
                    </option>

                    ${opcionesLugar}

                    <option value="__NUEVO_LUGAR__">
                        ➕ Agregar nueva ubicación...
                    </option>

                </select>


                <div
                    id="contenedorNuevoLugar"
                    class="admin-nuevo-lugar-box"
                    style="display:none;">


                    <label for="nuevoLugarNombre">

                        Nueva ubicación

                    </label>


                    <div class="admin-nuevo-lugar-fila">

                        <input
                            type="text"
                            id="nuevoLugarNombre"
                            maxlength="120"
                            placeholder="Ej. Casa de Juan">


                        <button
                            type="button"
                            id="btnAgregarNuevoLugar"
                            class="admin-btn-agregar-lugar">

                            Agregar ubicación

                        </button>

                    </div>


                    <small>

                        La ubicación quedará disponible
                        para futuros eventos.

                    </small>


                    <div id="mensajeNuevoLugar">
                    </div>

                </div>

            </div>


            <div class="admin-form-campo">

                <label for="eventoReferencia">
                    Notas / referencia
                </label>

                <input
                    type="text"
                    id="eventoReferencia"
                    maxlength="200"
                    placeholder="Información adicional opcional">

            </div>


            <label class="admin-form-activo">

                <div>

                    <strong>
                        Evento activo
                    </strong>

                    <small>
                        Se mostrará en AppCorus
                    </small>

                </div>


                <input
                    type="checkbox"
                    id="eventoActivo"
                    checked>

            </label>


            <div id="adminFormMensaje">
            </div>


            <div class="admin-form-acciones">


                <button
                    type="button"
                    id="btnCancelarEvento"
                    class="admin-btn-cancelar">

                    Cancelar

                </button>


                <button
                    type="submit"
                    id="btnGuardarEvento"
                    class="admin-btn-guardar">

                    Guardar evento

                </button>


            </div>


        </form>

    `;


    document
        .getElementById(
            "formNuevoEvento"
        )
        ?.addEventListener(

            "submit",

            evento => {

                evento.preventDefault();

                guardarNuevoEvento();

            }

        );


    document
        .getElementById(
            "btnCancelarEvento"
        )
        ?.addEventListener(

            "click",

            () =>
                abrirAdminEventos()

        );


    const selectLugar =
        document.getElementById(
            "eventoLugar"
        );


    const contenedorNuevoLugar =
        document.getElementById(
            "contenedorNuevoLugar"
        );


    selectLugar
        ?.addEventListener(

            "change",

            () => {

                if (
                    selectLugar.value ===
                    "__NUEVO_LUGAR__"
                ) {

                    contenedorNuevoLugar
                        .style
                        .display =
                            "block";


                    setTimeout(
                        () =>
                            document
                                .getElementById(
                                    "nuevoLugarNombre"
                                )
                                ?.focus(),
                        50
                    );

                } else {

                    contenedorNuevoLugar
                        .style
                        .display =
                            "none";

                }

            }

        );


    document
        .getElementById(
            "btnAgregarNuevoLugar"
        )
        ?.addEventListener(

            "click",

            guardarNuevaUbicacion

        );

}


// ======================================================
// GUARDAR NUEVA UBICACIÓN
// ======================================================

async function guardarNuevaUbicacion() {

    if (
        !adminCredential
    ) {

        abrirAccesoAdministracion();


        return;

    }


    const input =
        document.getElementById(
            "nuevoLugarNombre"
        );


    const boton =
        document.getElementById(
            "btnAgregarNuevoLugar"
        );


    const mensaje =
        document.getElementById(
            "mensajeNuevoLugar"
        );


    const select =
        document.getElementById(
            "eventoLugar"
        );


    const contenedor =
        document.getElementById(
            "contenedorNuevoLugar"
        );


    const lugar =
        input
            ?.value
            .trim();


    if (
        !lugar
    ) {

        mensaje.innerHTML = `

            <div class="admin-error">

                Escribe el nombre de la ubicación.

            </div>

        `;


        input?.focus();


        return;

    }


    boton.disabled =
        true;


    boton.textContent =
        "Agregando...";


    mensaje.innerHTML = `

        <div class="admin-validando">

            Guardando ubicación...

        </div>

    `;


    try {

        const respuesta =
            await fetch(

                URL_API,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            accion:
                                "crearLugar",

                            credential:
                                adminCredential,

                            lugar:
                                lugar

                        })

                }

            );


        const resultado =
            await respuesta.json();


        if (
            !resultado.ok
        ) {

            throw new Error(
                resultado.error ||
                "No fue posible agregar la ubicación."
            );

        }


        const nombreLugar =
            String(
                resultado.lugar ||
                lugar
            )
            .trim();


        let opcion =
            Array
                .from(
                    select.options
                )
                .find(
                    item =>
                        item.value ===
                        nombreLugar
                );


        if (
            !opcion
        ) {

            opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                nombreLugar;


            opcion.textContent =
                nombreLugar;


            const opcionNueva =
                Array
                    .from(
                        select.options
                    )
                    .find(
                        item =>
                            item.value ===
                            "__NUEVO_LUGAR__"
                    );


            select.insertBefore(
                opcion,
                opcionNueva ||
                null
            );

        }


        select.value =
            nombreLugar;


        contenedor.style.display =
            "none";


        input.value =
            "";


        mensaje.innerHTML =
            "";


        // ======================================
        // ACTUALIZAMOS EL CACHÉ LOCAL
        // SIN VOLVER A CONSULTAR GOOGLE
        // ======================================

        if (
            appDataCache &&
            appDataCache.catalogos
        ) {

            if (
                !Array.isArray(
                    appDataCache
                        .catalogos
                        .lugares
                )
            ) {

                appDataCache
                    .catalogos
                    .lugares =
                        [];

            }


            if (
                !appDataCache
                    .catalogos
                    .lugares
                    .includes(
                        nombreLugar
                    )
            ) {

                appDataCache
                    .catalogos
                    .lugares
                    .push(
                        nombreLugar
                    );

            }

        }


        mostrarMensajeFormulario(

            resultado.existente

                ? "La ubicación ya existía y fue seleccionada."

                : "Ubicación agregada correctamente.",

            "exito"

        );


    } catch(error) {

        console.error(
            "Error agregando ubicación:",
            error
        );


        mensaje.innerHTML = `

            <div class="admin-error">

                ${
                    escaparHtml(
                        error.message
                    )
                }

            </div>

        `;


    } finally {

        boton.disabled =
            false;


        boton.textContent =
            "Agregar ubicación";

    }

}


// ======================================================
// GUARDAR EVENTO
// ======================================================

async function guardarNuevoEvento() {

    const fecha =
        document
            .getElementById(
                "eventoFecha"
            )
            ?.value;


    const hora =
        document
            .getElementById(
                "eventoHora"
            )
            ?.value;


    const tipo =
        document
            .getElementById(
                "eventoTipo"
            )
            ?.value
            .trim();


    const descripcion =
        document
            .getElementById(
                "eventoDescripcion"
            )
            ?.value
            .trim();


    const lugar =
        document
            .getElementById(
                "eventoLugar"
            )
            ?.value
            .trim();


    const referencia =
        document
            .getElementById(
                "eventoReferencia"
            )
            ?.value
            .trim();


    const activo =
        document
            .getElementById(
                "eventoActivo"
            )
            ?.checked;


    const boton =
        document.getElementById(
            "btnGuardarEvento"
        );


    if (
        !fecha
    ) {

        mostrarMensajeFormulario(
            "Selecciona la fecha.",
            "error"
        );


        return;

    }


    if (
        !hora
    ) {

        mostrarMensajeFormulario(
            "Selecciona la hora.",
            "error"
        );


        return;

    }


    if (
        !tipo
    ) {

        mostrarMensajeFormulario(
            "Selecciona el tipo de evento.",
            "error"
        );


        return;

    }


    if (
        !descripcion
    ) {

        mostrarMensajeFormulario(
            "Escribe la descripción del evento.",
            "error"
        );


        return;

    }


    if (
        lugar ===
        "__NUEVO_LUGAR__"
    ) {

        mostrarMensajeFormulario(
            "Primero agrega la nueva ubicación.",
            "error"
        );


        return;

    }


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    mostrarMensajeFormulario(
        "Guardando evento...",
        "validando"
    );


    try {

        const respuesta =
            await fetch(

                URL_API,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            accion:
                                "crearEvento",

                            credential:
                                adminCredential,

                            evento: {

                                fecha,
                                hora,
                                tipo,
                                descripcion,
                                lugar,
                                referencia,
                                activo

                            }

                        })

                }

            );


        const resultado =
            await respuesta.json();


        if (
            !resultado.ok
        ) {

            throw new Error(
                resultado.error ||
                "No fue posible guardar el evento."
            );

        }


        // ======================================
        // UNA SOLA RECARGA DESDE LA API
        // ======================================

        const data =
            await refrescarDatosApp();


        // ======================================
        // RENDERIZAMOS TODO DESDE EL MISMO JSON
        // SIN MÁS FETCH
        // ======================================

        cargarInicio(
            data
        );


        cargarCalendario(
            data
        );


        cargarEsquemas(
            data
        );


        await abrirAdminEventos(
            data
        );


        const pantalla =
            document.querySelector(
                ".admin-eventos"
            );


        if (
            pantalla
        ) {

            pantalla.insertAdjacentHTML(

                "afterbegin",

                `

                    <div class="admin-exito">

                        ✅ Evento creado correctamente.

                        ${
                            resultado.idEvento
                                ? `
                                    <small>
                                        ${
                                            escaparHtml(
                                                resultado.idEvento
                                            )
                                        }
                                    </small>
                                `
                                : ""
                        }

                    </div>

                `

            );

        }


    } catch(error) {

        console.error(
            "Error guardando evento:",
            error
        );


        mostrarMensajeFormulario(

            error.message ||
            "No fue posible guardar el evento.",

            "error"

        );


        boton.disabled =
            false;


        boton.textContent =
            "Guardar evento";

    }

}


// ======================================================
// MENSAJES FORMULARIO
// ======================================================

function mostrarMensajeFormulario(
    texto,
    tipo = "exito"
) {

    const mensaje =
        document.getElementById(
            "adminFormMensaje"
        );


    if (
        !mensaje
    ) {

        return;

    }


    let clase =
        "admin-exito";


    if (
        tipo === "error"
    ) {

        clase =
            "admin-error";

    }


    if (
        tipo === "validando"
    ) {

        clase =
            "admin-validando";

    }


    mensaje.innerHTML = `

        <div class="${clase}">

            ${escaparHtml(texto)}

        </div>

    `;

}


// ======================================================
// EDITAR EVENTO
// APPCORUS V3.3
// ======================================================

async function editarEventoAdmin(
    idEvento
) {

    if (
        !adminUsuario ||
        !adminCredential
    ) {

        abrirAccesoAdministracion();

        return;

    }


    try {

        const data =
            await obtenerDatosApp();


        const eventos =
            Array.isArray(
                data.eventos
            )
                ? data.eventos
                : [];


        const evento =
            eventos.find(
                item =>
                    String(
                        item.idEvento
                    ) ===
                    String(
                        idEvento
                    )
            );


        if (!evento) {

            alert(
                "No fue posible encontrar el evento."
            );

            return;

        }


        abrirFormularioEditarEvento(
            evento,
            data
        );


    } catch(error) {

        console.error(
            "Error buscando evento:",
            error
        );


        alert(
            "No fue posible cargar el evento."
        );

    }

}

// ======================================================
// ELIMINAR / DESACTIVAR EVENTO
// APPCORUS V3.3
// ======================================================

async function eliminarEventoAdmin(
    idEvento
) {

    if (
        !adminUsuario ||
        !adminCredential
    ) {

        abrirAccesoAdministracion();

        return;

    }


    try {

        // ==========================================
        // OBTENER EVENTO DESDE CACHÉ
        // ==========================================

        const data =
            await obtenerDatosApp();


        const eventos =
            Array.isArray(
                data.eventos
            )
                ? data.eventos
                : [];


        const evento =
            eventos.find(
                item =>
                    String(
                        item.idEvento
                    ) ===
                    String(
                        idEvento
                    )
            );


        if (!evento) {

            alert(
                "No fue posible encontrar el evento."
            );

            return;

        }


        // ==========================================
        // CONFIRMACIÓN
        // ==========================================

        const confirmar =
            window.confirm(

                `¿Eliminar el evento?\n\n` +

                `${evento.titulo || evento.tipo}\n` +

                `${evento.fecha || ""} · ${evento.hora || ""}\n\n` +

                `El evento dejará de mostrarse en AppCorus.`

            );


        if (!confirmar) {

            return;

        }


        // ==========================================
        // DESACTIVAR MEDIANTE editarEvento
        // ==========================================

        const respuesta =
            await fetch(

                URL_API,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            accion:
                                "editarEvento",

                            credential:
                                adminCredential,

                            evento: {

                                idEvento:
                                    evento.idEvento,

                                fecha:
                                    evento.fechaISO,

                                hora:
                                    String(
                                        evento.hora ||
                                        ""
                                    ).substring(
                                        0,
                                        5
                                    ),

                                tipo:
                                    evento.tipo,

                                descripcion:
                                    evento.titulo ||
                                    evento.tipo,

                                lugar:
                                    evento.lugar ||
                                    "",

                                referencia:
                                    evento.referencia ||
                                    "",

                                activo:
                                    false

                            }

                        })

                }

            );


        const resultado =
            await respuesta.json();


        if (!resultado.ok) {

            throw new Error(

                resultado.error ||
                "No fue posible eliminar el evento."

            );

        }


        // ==========================================
        // UNA SOLA RECARGA DE DATOS
        // ==========================================

        const datosActualizados =
            await refrescarDatosApp();


        // ==========================================
        // ACTUALIZAR APP
        // ==========================================

        renderizarInicio(
            datosActualizados
        );


        renderizarCalendario(
            datosActualizados
        );


        renderizarEsquemas(
            datosActualizados
        );


        await abrirAdminEventos(
            datosActualizados
        );


        // ==========================================
        // MENSAJE
        // ==========================================

        const pantalla =
            document.querySelector(
                ".admin-eventos"
            );


        if (pantalla) {

            pantalla.insertAdjacentHTML(

                "afterbegin",

                `

                    <div class="admin-exito">

                        ✅ Evento eliminado correctamente.

                    </div>

                `

            );

        }


    } catch(error) {

        console.error(
            "Error eliminando evento:",
            error
        );


        alert(

            error.message ||
            "No fue posible eliminar el evento."

        );

    }

}


// ======================================================
// FORMULARIO EDITAR EVENTO
// ======================================================

function abrirFormularioEditarEvento(
    evento,
    data
) {

    const seccion =
        document.getElementById(
            "administracion"
        );


    if (!seccion) {

        return;

    }


    const catalogos =
        data.catalogos ||
        {};


    const tiposEvento =
        Array.isArray(
            catalogos.tiposEvento
        )
            ? catalogos.tiposEvento
            : [];


    const lugares =
        Array.isArray(
            catalogos.lugares
        )
            ? catalogos.lugares
            : [];


    const opcionesTipo =
        tiposEvento
            .map(
                tipo => {

                    const seleccionado =
                        tipo === evento.tipo
                            ? "selected"
                            : "";


                    return `

                        <option
                            value="${escaparHtml(tipo)}"
                            ${seleccionado}>

                            ${escaparHtml(tipo)}

                        </option>

                    `;

                }
            )
            .join("");


    const opcionesLugar =
        lugares
            .map(
                lugar => {

                    const seleccionado =
                        lugar === evento.lugar
                            ? "selected"
                            : "";


                    return `

                        <option
                            value="${escaparHtml(lugar)}"
                            ${seleccionado}>

                            ${escaparHtml(lugar)}

                        </option>

                    `;

                }
            )
            .join("");


    seccion.innerHTML = `

        <div class="admin-formulario-evento">


            <button
                id="btnVolverEventosEditar"
                class="admin-volver"
                type="button">

                ← Eventos

            </button>


            <div class="admin-formulario-encabezado">

                <div class="admin-formulario-icono">
                    ✏️
                </div>


                <div>

                    <h2>
                        Editar evento
                    </h2>

                    <p>
                        ${escaparHtml(evento.idEvento)}
                    </p>

                </div>

            </div>


            <form
                id="formEditarEvento"
                class="admin-evento-form">


                <!-- FECHA Y HORA -->

                <div class="admin-form-fila">


                    <div class="admin-form-campo">

                        <label for="editarEventoFecha">
                            Fecha *
                        </label>

                        <input
                            type="date"
                            id="editarEventoFecha"
                            value="${escaparHtml(evento.fechaISO)}"
                            required>

                    </div>


                    <div class="admin-form-campo">

                        <label for="editarEventoHora">
                            Hora *
                        </label>

                        <input
                            type="time"
                            id="editarEventoHora"
                            value="${escaparHtml(
                                String(
                                    evento.hora || ""
                                ).substring(
                                    0,
                                    5
                                )
                            )}"
                            required>

                    </div>


                </div>


                <!-- TIPO -->

                <div class="admin-form-campo">

                    <label for="editarEventoTipo">
                        Tipo de evento *
                    </label>

                    <select
                        id="editarEventoTipo"
                        required>

                        ${opcionesTipo}

                    </select>

                </div>


                <!-- DESCRIPCIÓN -->

                <div class="admin-form-campo">

                    <label for="editarEventoDescripcion">
                        Descripción *
                    </label>

                    <input
                        type="text"
                        id="editarEventoDescripcion"
                        maxlength="150"
                        value="${escaparHtml(
                            evento.titulo ||
                            ""
                        )}"
                        required>

                </div>


                <!-- LUGAR -->

                <div class="admin-form-campo">

                    <label for="editarEventoLugar">
                        Lugar
                    </label>

                    <select id="editarEventoLugar">

                        <option
                            value=""
                            ${
                                !evento.lugar
                                    ? "selected"
                                    : ""
                            }>

                            Sin lugar / Por definir

                        </option>

                        ${opcionesLugar}

                        <option value="__NUEVO_LUGAR__">
                            ➕ Agregar nueva ubicación...
                        </option>

                    </select>


                    <div
                        id="contenedorNuevoLugarEditar"
                        class="admin-nuevo-lugar-box"
                        style="display:none;">


                        <label for="nuevoLugarNombreEditar">

                            Nueva ubicación

                        </label>


                        <div class="admin-nuevo-lugar-fila">

                            <input
                                type="text"
                                id="nuevoLugarNombreEditar"
                                maxlength="120"
                                placeholder="Ej. Casa de Juan">


                            <button
                                type="button"
                                id="btnAgregarNuevoLugarEditar"
                                class="admin-btn-agregar-lugar">

                                Agregar ubicación

                            </button>

                        </div>


                        <small>

                            La ubicación quedará disponible
                            para futuros eventos.

                        </small>


                        <div id="mensajeNuevoLugarEditar">
                        </div>


                    </div>

                </div>


                <!-- REFERENCIA -->

                <div class="admin-form-campo">

                    <label for="editarEventoReferencia">
                        Notas / referencia
                    </label>

                    <input
                        type="text"
                        id="editarEventoReferencia"
                        maxlength="200"
                        value="${escaparHtml(
                            evento.referencia ||
                            ""
                        )}"
                        placeholder="Información adicional opcional">

                </div>


                <!-- ACTIVO -->

                <label class="admin-form-activo">

                    <div>

                        <strong>
                            Evento activo
                        </strong>

                        <small>
                            Se mostrará en AppCorus
                        </small>

                    </div>

                    <input
                        type="checkbox"
                        id="editarEventoActivo"
                        checked>

                </label>


                <div id="adminEditarMensaje">
                </div>


                <!-- ACCIONES -->

                <div class="admin-form-acciones">

                    <button
                        type="button"
                        id="btnCancelarEdicion"
                        class="admin-btn-cancelar">

                        Cancelar

                    </button>


                    <button
                        type="submit"
                        id="btnGuardarCambiosEvento"
                        class="admin-btn-guardar">

                        Guardar cambios

                    </button>

                </div>


            </form>


        </div>

    `;


    // ==================================================
    // VOLVER
    // ==================================================

    document
        .getElementById(
            "btnVolverEventosEditar"
        )
        ?.addEventListener(

            "click",

            () =>
                abrirAdminEventos()

        );


    document
        .getElementById(
            "btnCancelarEdicion"
        )
        ?.addEventListener(

            "click",

            () =>
                abrirAdminEventos()

        );


    // ==================================================
    // GUARDAR
    // ==================================================

    document
        .getElementById(
            "formEditarEvento"
        )
        ?.addEventListener(

            "submit",

            event => {

                event.preventDefault();


                guardarCambiosEvento(
                    evento.idEvento
                );

            }

        );


    // ==================================================
    // NUEVA UBICACIÓN EN EDICIÓN
    // ==================================================

    const selectLugar =
        document.getElementById(
            "editarEventoLugar"
        );


    const contenedorNuevoLugar =
        document.getElementById(
            "contenedorNuevoLugarEditar"
        );


    selectLugar
        ?.addEventListener(

            "change",

            () => {

                if (
                    selectLugar.value ===
                    "__NUEVO_LUGAR__"
                ) {

                    contenedorNuevoLugar
                        .style
                        .display =
                            "block";


                    setTimeout(
                        () =>
                            document
                                .getElementById(
                                    "nuevoLugarNombreEditar"
                                )
                                ?.focus(),
                        50
                    );


                } else {

                    contenedorNuevoLugar
                        .style
                        .display =
                            "none";

                }

            }

        );


    document
        .getElementById(
            "btnAgregarNuevoLugarEditar"
        )
        ?.addEventListener(

            "click",

            guardarNuevaUbicacionEdicion

        );

}


// ======================================================
// AGREGAR UBICACIÓN DESDE EDICIÓN
// ======================================================

async function guardarNuevaUbicacionEdicion() {

    const input =
        document.getElementById(
            "nuevoLugarNombreEditar"
        );


    const boton =
        document.getElementById(
            "btnAgregarNuevoLugarEditar"
        );


    const mensaje =
        document.getElementById(
            "mensajeNuevoLugarEditar"
        );


    const select =
        document.getElementById(
            "editarEventoLugar"
        );


    const contenedor =
        document.getElementById(
            "contenedorNuevoLugarEditar"
        );


    const lugar =
        input
            ?.value
            .trim();


    if (!lugar) {

        mensaje.innerHTML = `

            <div class="admin-error">

                Escribe el nombre de la ubicación.

            </div>

        `;


        input?.focus();

        return;

    }


    boton.disabled =
        true;


    boton.textContent =
        "Agregando...";


    mensaje.innerHTML = `

        <div class="admin-validando">

            Guardando ubicación...

        </div>

    `;


    try {

        const respuesta =
            await fetch(

                URL_API,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            accion:
                                "crearLugar",

                            credential:
                                adminCredential,

                            lugar:
                                lugar

                        })

                }

            );


        const resultado =
            await respuesta.json();


        if (!resultado.ok) {

            throw new Error(
                resultado.error ||
                "No fue posible agregar la ubicación."
            );

        }


        const nombreLugar =
            String(
                resultado.lugar ||
                lugar
            )
            .trim();


        let opcion =
            Array
                .from(
                    select.options
                )
                .find(
                    item =>
                        item.value ===
                        nombreLugar
                );


        if (!opcion) {

            opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                nombreLugar;


            opcion.textContent =
                nombreLugar;


            const opcionNueva =
                Array
                    .from(
                        select.options
                    )
                    .find(
                        item =>
                            item.value ===
                            "__NUEVO_LUGAR__"
                    );


            select.insertBefore(
                opcion,
                opcionNueva ||
                null
            );

        }


        select.value =
            nombreLugar;


        contenedor.style.display =
            "none";


        input.value =
            "";


        mensaje.innerHTML =
            "";


        // Actualizar caché local
        if (
            appDataCache &&
            appDataCache.catalogos
        ) {

            if (
                !appDataCache
                    .catalogos
                    .lugares
                    .includes(
                        nombreLugar
                    )
            ) {

                appDataCache
                    .catalogos
                    .lugares
                    .push(
                        nombreLugar
                    );

            }

        }


    } catch(error) {

        console.error(
            "Error agregando ubicación:",
            error
        );


        mensaje.innerHTML = `

            <div class="admin-error">

                ${escaparHtml(error.message)}

            </div>

        `;


    } finally {

        boton.disabled =
            false;


        boton.textContent =
            "Agregar ubicación";

    }

}


// ======================================================
// GUARDAR CAMBIOS EVENTO
// ======================================================

async function guardarCambiosEvento(
    idEvento
) {

    const fecha =
        document
            .getElementById(
                "editarEventoFecha"
            )
            ?.value;


    const hora =
        document
            .getElementById(
                "editarEventoHora"
            )
            ?.value;


    const tipo =
        document
            .getElementById(
                "editarEventoTipo"
            )
            ?.value
            .trim();


    const descripcion =
        document
            .getElementById(
                "editarEventoDescripcion"
            )
            ?.value
            .trim();


    const lugar =
        document
            .getElementById(
                "editarEventoLugar"
            )
            ?.value
            .trim();


    const referencia =
        document
            .getElementById(
                "editarEventoReferencia"
            )
            ?.value
            .trim();


    const activo =
        document
            .getElementById(
                "editarEventoActivo"
            )
            ?.checked;


    const boton =
        document.getElementById(
            "btnGuardarCambiosEvento"
        );


    const mensaje =
        document.getElementById(
            "adminEditarMensaje"
        );


    if (
        !fecha ||
        !hora ||
        !tipo ||
        !descripcion
    ) {

        mensaje.innerHTML = `

            <div class="admin-error">

                Completa los campos obligatorios.

            </div>

        `;


        return;

    }


    if (
        lugar ===
        "__NUEVO_LUGAR__"
    ) {

        mensaje.innerHTML = `

            <div class="admin-error">

                Primero agrega la nueva ubicación.

            </div>

        `;


        return;

    }


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    mensaje.innerHTML = `

        <div class="admin-validando">

            Guardando cambios...

        </div>

    `;


    try {

        const respuesta =
            await fetch(

                URL_API,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            accion:
                                "editarEvento",

                            credential:
                                adminCredential,

                            evento: {

                                idEvento:
                                    idEvento,

                                fecha:
                                    fecha,

                                hora:
                                    hora,

                                tipo:
                                    tipo,

                                descripcion:
                                    descripcion,

                                lugar:
                                    lugar,

                                referencia:
                                    referencia,

                                activo:
                                    activo

                            }

                        })

                }

            );


        const resultado =
            await respuesta.json();


        if (!resultado.ok) {

            throw new Error(

                resultado.error ||
                "No fue posible actualizar el evento."

            );

        }


        // ==========================================
        // UNA SOLA RECARGA
        // ==========================================

        const data =
            await refrescarDatosApp();


        renderizarInicio(
            data
        );


        renderizarCalendario(
            data
        );


        renderizarEsquemas(
            data
        );


        await abrirAdminEventos(
            data
        );


        const pantalla =
            document.querySelector(
                ".admin-eventos"
            );


        if (pantalla) {

            pantalla.insertAdjacentHTML(

                "afterbegin",

                `

                    <div class="admin-exito">

                        ✅ Evento actualizado correctamente.

                        <small>
                            ${escaparHtml(idEvento)}
                        </small>

                    </div>

                `

            );

        }


    } catch(error) {

        console.error(
            "Error editando evento:",
            error
        );


        mensaje.innerHTML = `

            <div class="admin-error">

                ${
                    escaparHtml(
                        error.message ||
                        "No fue posible actualizar el evento."
                    )
                }

            </div>

        `;


        boton.disabled =
            false;


        boton.textContent =
            "Guardar cambios";

    }

}

// ======================================================
// ADMINISTRACIÓN ESQUEMAS
// ======================================================

// ======================================================
// ADMINISTRACIÓN - ESQUEMAS
// APPCORUS V3.4
// ======================================================
//
// Esta pantalla usa su propio caché administrativo.
//
// Primera entrada:
//      1 POST a Apps Script
//
// Entradas posteriores:
//      0 POST mientras los datos sigan vigentes.
//
// ======================================================

let adminEsquemasCache = null;
let adminEsquemasPromise = null;


// ======================================================
// OBTENER DATOS ADMIN ESQUEMAS
// ======================================================

async function obtenerDatosAdminEsquemas(
    forzar = false
) {

    if (
        !adminUsuario ||
        !adminCredential
    ) {

        throw new Error(
            "La sesión de administración no está disponible."
        );

    }


    // Ya están en memoria
    if (
        !forzar &&
        adminEsquemasCache
    ) {

        return adminEsquemasCache;

    }


    // Ya hay una petición corriendo
    if (
        !forzar &&
        adminEsquemasPromise
    ) {

        return adminEsquemasPromise;

    }


    const consulta =
        fetch(
            URL_API,
            {
                method:
                    "POST",

                body:
                    JSON.stringify({

                        accion:
                            "obtenerEsquemasAdmin",

                        credential:
                            adminCredential

                    })
            }
        )
        .then(
            async respuesta => {

                if (
                    !respuesta.ok
                ) {

                    throw new Error(
                        "Error HTTP " +
                        respuesta.status
                    );

                }


                const resultado =
                    await respuesta.json();


                if (
                    !resultado.ok
                ) {

                    throw new Error(
                        resultado.error ||
                        "No fue posible cargar los esquemas."
                    );

                }


                return resultado;

            }
        );


    adminEsquemasPromise =
        consulta;


    try {

        const resultado =
            await consulta;


        adminEsquemasCache =
            resultado;


        return resultado;


    } finally {

        if (
            adminEsquemasPromise ===
            consulta
        ) {

            adminEsquemasPromise =
                null;

        }

    }

}


// ======================================================
// INVALIDAR CACHÉ ADMIN ESQUEMAS
// ======================================================

function invalidarDatosAdminEsquemas() {

    adminEsquemasCache =
        null;

    adminEsquemasPromise =
        null;

}


// ======================================================
// ABRIR ADMINISTRACIÓN DE ESQUEMAS
// ======================================================

async function abrirAdminEsquemas(
    datosPrecargados = null
) {

    if (
        !adminUsuario ||
        !adminCredential
    ) {

        abrirAccesoAdministracion();

        return;

    }


    const seccion =
        document.getElementById(
            "administracion"
        );


    if (!seccion) {

        return;

    }


    // ==================================================
    // ESTRUCTURA DE LA PANTALLA
    // ==================================================

    seccion.innerHTML = `

        <div class="admin-eventos admin-esquemas">

            <div class="admin-eventos-cabecera">

                <div>

                    <button
                        id="btnVolverAdminEsquemas"
                        class="admin-volver"
                        type="button">

                        ← Administración

                    </button>


                    <h2>
                        📖 Esquemas
                    </h2>


                    <p>

                        Administra los esquemas de

                        ${
                            escaparHtml(
                                adminUsuario.nombreCoro ||
                                "tu coro"
                            )
                        }.

                    </p>

                </div>


                <button
                    id="btnNuevoEsquema"
                    class="admin-nuevo-evento"
                    type="button">

                    + Nuevo esquema

                </button>

            </div>


            <div
                id="adminListaEsquemas"
                class="admin-lista-eventos">

                <div class="admin-validando">

                    Cargando esquemas...

                </div>

            </div>

        </div>

    `;


    // ==================================================
    // VOLVER
    // ==================================================

    document
        .getElementById(
            "btnVolverAdminEsquemas"
        )
        ?.addEventListener(
            "click",
            () => {

                mostrarPanelAdministracion(
                    adminUsuario
                );

            }
        );


    // ==================================================
    // NUEVO ESQUEMA
    // ==================================================

    document
        .getElementById(
            "btnNuevoEsquema"
        )
        ?.addEventListener(
            "click",
            () => {

                abrirFormularioNuevoEsquema();

            }
        );


    // ==================================================
    // OBTENER DATOS
    // ==================================================

    try {

        const datos =
            datosPrecargados ||
            await obtenerDatosAdminEsquemas();


        renderizarAdminEsquemas(
            datos.esquemas || []
        );


    } catch(error) {

        console.error(
            "Error cargando administración de esquemas:",
            error
        );


        const lista =
            document.getElementById(
                "adminListaEsquemas"
            );


        if (lista) {

            lista.innerHTML = `

                <div class="admin-error">

                    No fue posible cargar los esquemas.

                    <br>

                    <small>
                        ${escaparHtml(
                            error.message || ""
                        )}
                    </small>

                </div>

            `;

        }

    }

}


// ======================================================
// RENDERIZAR LISTA DE ESQUEMAS
// ======================================================

function renderizarAdminEsquemas(
    esquemas
) {

    const contenedor =
        document.getElementById(
            "adminListaEsquemas"
        );


    if (!contenedor) {

        return;

    }


    const lista =
        Array.isArray(
            esquemas
        )
            ? [...esquemas]
            : [];


    if (
        lista.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="admin-sin-eventos">

                <div class="admin-sin-eventos-icono">
                    📖
                </div>

                <strong>
                    No hay esquemas
                </strong>

                <p>
                    Crea el primer esquema del coro.
                </p>

            </div>

        `;

        return;

    }


    // ==================================================
    // ORDENAR POR EVENTO PRINCIPAL
    // ==================================================

    lista.sort(
        (
            a,
            b
        ) => {

            const fechaA =
                obtenerFechaPrincipalEsquema(
                    a
                );


            const fechaB =
                obtenerFechaPrincipalEsquema(
                    b
                );


            return (
                fechaA -
                fechaB
            );

        }
    );


    contenedor.innerHTML =
        lista
            .map(
                esquema =>
                    crearTarjetaAdminEsquema(
                        esquema
                    )
            )
            .join("");

}


// ======================================================
// CREAR TARJETA DE ESQUEMA
// ======================================================

function crearTarjetaAdminEsquema(
    esquema
) {

    const idEsquema =
        escaparHtml(
            esquema.idEsquema || ""
        );


    const tipo =
        escaparHtml(
            esquema.tipoEsquema ||
            "Sin tipo"
        );


    const descripcion =
        escaparHtml(
            esquema.descripcion ||
            "Sin descripción"
        );


    const totalCantos =
        Number(
            esquema.totalCantos ||
            (
                Array.isArray(
                    esquema.detalles
                )
                    ? esquema.detalles.length
                    : 0
            )
        );


    // ==================================================
    // EVENTO PRINCIPAL
    // ==================================================

    const relacionPrincipal =
        obtenerRelacionPrincipalEsquema(
            esquema
        );


    const evento =
        relacionPrincipal
            ?.evento ||
        null;


    const fecha =
        evento
            ? obtenerFechaVisualEsquema(
                evento.fecha
            )
            : {
                dia:
                    "--",

                mes:
                    "---"
            };


    const uso =
        relacionPrincipal
            ? escaparHtml(
                relacionPrincipal.uso ||
                ""
            )
            : "Sin evento";


    const hora =
        evento &&
        evento.hora
            ? escaparHtml(
                String(
                    evento.hora
                ).substring(
                    0,
                    5
                )
            )
            : "";


    const lugar =
        evento &&
        evento.lugar
            ? escaparHtml(
                evento.lugar
            )
            : "";


    const descripcionEvento =
        evento &&
        evento.descripcion
            ? escaparHtml(
                evento.descripcion
            )
            : "";


    const estadoEvento =
        evento &&
        evento.activo === false
            ? `
                <span class="admin-esquema-historico">
                    Evento histórico
                </span>
            `
            : "";


    // ==================================================
    // ENSAYOS
    // ==================================================

    const totalEnsayos =
        Array.isArray(
            esquema.ensayos
        )
            ? esquema.ensayos.length
            : 0;


    return `

        <article
            class="admin-evento-card admin-esquema-card">

            <div class="admin-evento-fecha">

                <strong>
                    ${fecha.dia}
                </strong>

                <span>
                    ${fecha.mes}
                </span>

            </div>


            <div class="admin-evento-info">

                <span class="admin-evento-tipo">

                    📖 ${tipo}

                </span>


                <h3>
                    ${descripcion}
                </h3>


                ${
                    relacionPrincipal
                        ? `

                            <div class="admin-evento-meta">

                                <span>
                                    ${uso}
                                </span>

                                ${
                                    hora
                                        ? `
                                            <span>
                                                🕒 ${hora}
                                            </span>
                                        `
                                        : ""
                                }

                                ${
                                    lugar
                                        ? `
                                            <span>
                                                📍 ${lugar}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        `
                        : `

                            <div class="admin-evento-meta">

                                <span>
                                    ⚠️ Sin evento relacionado
                                </span>

                            </div>

                        `
                }


                ${
                    descripcionEvento
                        ? `

                            <small class="admin-esquema-evento">

                                ${descripcionEvento}

                            </small>

                        `
                        : ""
                }


                ${estadoEvento}


                <div class="admin-esquema-resumen">

                    <span>
                        🎵 ${totalCantos}
                        ${
                            totalCantos === 1
                                ? "canto"
                                : "cantos"
                        }
                    </span>


                    ${
                        totalEnsayos > 0
                            ? `

                                <span>
                                    🎤 ${totalEnsayos}
                                    ${
                                        totalEnsayos === 1
                                            ? "ensayo"
                                            : "ensayos"
                                    }
                                </span>

                            `
                            : ""
                    }

                </div>

            </div>


            <div class="admin-evento-acciones">

                <button
                    class="admin-evento-editar"
                    type="button"
                    onclick="editarEsquemaAdmin('${idEsquema}')">

                    Editar

                </button>


                <button
                    class="admin-evento-eliminar"
                    type="button"
                    onclick="eliminarEsquemaAdmin('${idEsquema}')">

                    Eliminar

                </button>

            </div>

        </article>

    `;

}


// ======================================================
// OBTENER RELACIÓN PRINCIPAL
// ======================================================

function obtenerRelacionPrincipalEsquema(
    esquema
) {

    // Primero celebración

    if (
        esquema.celebracion &&
        esquema.celebracion.evento
    ) {

        return esquema.celebracion;

    }


    // Si aún no tiene celebración,
    // mostrar el primer ensayo.

    if (
        Array.isArray(
            esquema.ensayos
        ) &&
        esquema.ensayos.length > 0
    ) {

        return esquema.ensayos[0];

    }


    // Cualquier otra relación

    if (
        Array.isArray(
            esquema.relaciones
        ) &&
        esquema.relaciones.length > 0
    ) {

        return esquema.relaciones[0];

    }


    return null;

}


// ======================================================
// FECHA PRINCIPAL PARA ORDENAR
// ======================================================

function obtenerFechaPrincipalEsquema(
    esquema
) {

    const relacion =
        obtenerRelacionPrincipalEsquema(
            esquema
        );


    const fechaISO =
        relacion
            ?.evento
            ?.fecha;


    const hora =
        relacion
            ?.evento
            ?.hora ||
        "00:00";


    if (!fechaISO) {

        return new Date(
            9999,
            0,
            1
        );

    }


    const fecha =
        new Date(
            `${fechaISO}T${String(
                hora
            ).substring(
                0,
                5
            )}:00`
        );


    if (
        isNaN(
            fecha.getTime()
        )
    ) {

        return new Date(
            9999,
            0,
            1
        );

    }


    return fecha;

}


// ======================================================
// FECHA VISUAL
// ======================================================

function obtenerFechaVisualEsquema(
    fechaISO
) {

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


    if (!fechaISO) {

        return {

            dia:
                "--",

            mes:
                "---"

        };

    }


    const partes =
        String(
            fechaISO
        )
        .split("-");


    if (
        partes.length !== 3
    ) {

        return {

            dia:
                "--",

            mes:
                "---"

        };

    }


    const mes =
        Number(
            partes[1]
        ) - 1;


    return {

        dia:
            String(
                partes[2]
            )
            .padStart(
                2,
                "0"
            ),

        mes:
            meses[mes] ||
            "---"

    };

}


// ======================================================
// NUEVO ESQUEMA
// ======================================================
//
// El formulario real será el siguiente paso.
// Dejamos la función creada para que el botón
// nunca genere un error.
//
// ======================================================

// ======================================================
// NUEVO ESQUEMA
// APPCORUS V3.4
// ======================================================

async function abrirFormularioNuevoEsquema() {

    if (
        !adminUsuario ||
        !adminCredential
    ) {

        abrirAccesoAdministracion();

        return;

    }


    const seccion =
        document.getElementById(
            "administracion"
        );


    if (!seccion) {

        return;

    }


    // ==================================================
    // CARGANDO
    // ==================================================

    seccion.innerHTML = `

        <div class="admin-formulario-evento">

            <button
                id="btnVolverEsquemas"
                class="admin-volver"
                type="button">

                ← Esquemas

            </button>


            <div class="admin-formulario-encabezado">

                <div class="admin-formulario-icono">
                    📖
                </div>


                <div>

                    <h2>
                        Nuevo esquema
                    </h2>

                    <p>
                        ${
                            escaparHtml(
                                adminUsuario.nombreCoro ||
                                ""
                            )
                        }
                    </p>

                </div>

            </div>


            <div id="adminFormularioEsquema">

                <div class="admin-validando">
                    Cargando formulario...
                </div>

            </div>

        </div>

    `;


    document
        .getElementById(
            "btnVolverEsquemas"
        )
        ?.addEventListener(
            "click",
            () =>
                abrirAdminEsquemas()
        );


    try {

        // ==================================================
        // USA EL CACHÉ DE ADMINISTRACIÓN
        // ==================================================

        const datos =
            await obtenerDatosAdminEsquemas();


        renderizarFormularioNuevoEsquema(
            datos
        );


    } catch(error) {

        console.error(
            "Error cargando formulario de esquema:",
            error
        );


        const contenido =
            document.getElementById(
                "adminFormularioEsquema"
            );


        if (contenido) {

            contenido.innerHTML = `

                <div class="admin-error">

                    No fue posible cargar el formulario.

                    <br>

                    <small>
                        ${escaparHtml(
                            error.message || ""
                        )}
                    </small>

                </div>

            `;

        }

    }

}


// ======================================================
// RENDER FORMULARIO NUEVO ESQUEMA
// ======================================================

function renderizarFormularioNuevoEsquema(
    datos
) {

    const contenido =
        document.getElementById(
            "adminFormularioEsquema"
        );


    if (!contenido) {

        return;

    }


    const catalogos =
        datos.catalogos || {};


    const tiposEsquema =
        Array.isArray(
            catalogos.tiposEsquema
        )
            ? catalogos.tiposEsquema
            : [];


    const momentos =
        Array.isArray(
            catalogos.momentosMisa
        )
            ? catalogos.momentosMisa
            : [];


    const eventos =
        Array.isArray(
            datos.eventos
        )
            ? datos.eventos
            : [];


    // ==================================================
    // CELEBRACIONES
    // No mostramos ensayos dentro de Nuevo esquema.
    // ==================================================

    const eventosCelebracion =
        eventos.filter(
            evento =>
                !normalizarTextoEsquema(
                    evento.tipo
                )
                .includes(
                    "ensayo"
                )
        );


    // ==================================================
    // TIPOS
    // ==================================================

    const opcionesTipo =
        tiposEsquema
            .map(
                tipo => `

                    <option
                        value="${escaparHtml(tipo)}">

                        ${escaparHtml(tipo)}

                    </option>

                `
            )
            .join("");


    // ==================================================
    // CELEBRACIONES
    // ==================================================

    const opcionesCelebracion =
        eventosCelebracion
            .map(
                evento => `

                    <option
                        value="${escaparHtml(
                            evento.idEvento
                        )}">

                        ${escaparHtml(
                            obtenerTextoEventoEsquema(
                                evento
                            )
                        )}

                    </option>

                `
            )
            .join("");


    // ==================================================
    // MOMENTOS
    // ==================================================

    const camposMomentos =
        momentos
            .map(
                (
                    momento,
                    indice
                ) => `

                    <div class="admin-esquema-momento">

                        <div class="admin-esquema-momento-titulo">

                            <span class="admin-esquema-numero">
                                ${indice + 1}
                            </span>

                            <strong>
                                ${escaparHtml(momento)}
                            </strong>

                        </div>


                        <div class="admin-form-campo">

                            <label>
                                Canto
                            </label>

                            <input
                                type="text"
                                class="esquema-canto-input"
                                data-momento="${escaparHtml(momento)}"
                                maxlength="200"
                                placeholder="Nombre del canto">

                        </div>


                        <div class="admin-form-campo">

                            <label>
                                Observaciones
                            </label>

                            <input
                                type="text"
                                class="esquema-canto-observaciones"
                                data-momento="${escaparHtml(momento)}"
                                maxlength="200"
                                placeholder="Opcional">

                        </div>

                    </div>

                `
            )
            .join("");


    // ==================================================
    // FORMULARIO
    // ==================================================

    contenido.innerHTML = `

        <form
            id="formNuevoEsquema"
            class="admin-evento-form">


            <div class="admin-esquema-seccion">

                <h3>
                    📖 Información general
                </h3>


                <div class="admin-form-campo">

                    <label for="nuevoEsquemaTipo">
                        Tipo de esquema *
                    </label>

                    <select
                        id="nuevoEsquemaTipo"
                        required>

                        <option value="">
                            Selecciona...
                        </option>

                        ${opcionesTipo}

                    </select>

                </div>


                <div class="admin-form-campo">

                    <label for="nuevoEsquemaDescripcion">
                        Descripción *
                    </label>

                    <input
                        type="text"
                        id="nuevoEsquemaDescripcion"
                        maxlength="200"
                        required
                        placeholder="Ej. Misa dominical 20 de septiembre">

                </div>


                <div class="admin-form-campo">

                    <label for="nuevoEsquemaObservaciones">
                        Observaciones
                    </label>

                    <textarea
                        id="nuevoEsquemaObservaciones"
                        rows="3"
                        maxlength="500"
                        placeholder="Información adicional opcional"></textarea>

                </div>

            </div>


            <div class="admin-esquema-seccion">

                <h3>
                    ⛪ Celebración
                </h3>

                <p class="admin-esquema-ayuda">
                    Selecciona el evento donde se utilizará este esquema.
                </p>


                <div class="admin-form-campo">

                    <label for="nuevoEsquemaCelebracion">
                        Evento
                    </label>

                    <select
                        id="nuevoEsquemaCelebracion">

                        <option value="">
                            Sin celebración asignada
                        </option>

                        ${opcionesCelebracion}

                    </select>

                </div>

            </div>


            <div class="admin-esquema-seccion">

                <h3>
                    🎵 Cantos
                </h3>

                <p class="admin-esquema-ayuda">
                    Deja vacío cualquier momento que no se utilice.
                </p>


                <div class="admin-esquema-momentos">

                    ${camposMomentos}

                </div>

            </div>


            <div id="adminNuevoEsquemaMensaje">
            </div>


            <div class="admin-form-acciones">

                <button
                    id="btnCancelarNuevoEsquema"
                    type="button"
                    class="admin-btn-cancelar">

                    Cancelar

                </button>


                <button
                    id="btnGuardarNuevoEsquema"
                    type="submit"
                    class="admin-btn-guardar">

                    Guardar esquema

                </button>

            </div>

        </form>

    `;


    // ==================================================
    // CANCELAR
    // ==================================================

    document
        .getElementById(
            "btnCancelarNuevoEsquema"
        )
        ?.addEventListener(
            "click",
            () =>
                abrirAdminEsquemas(
                    datos
                )
        );


    // ==================================================
    // GUARDAR
    // ==================================================

    document
        .getElementById(
            "formNuevoEsquema"
        )
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                guardarNuevoEsquema();

            }
        );

}


// ======================================================
// GUARDAR NUEVO ESQUEMA
// ======================================================

async function guardarNuevoEsquema() {

    const tipoEsquema =
        document
            .getElementById(
                "nuevoEsquemaTipo"
            )
            ?.value
            .trim();


    const descripcion =
        document
            .getElementById(
                "nuevoEsquemaDescripcion"
            )
            ?.value
            .trim();


    const observaciones =
        document
            .getElementById(
                "nuevoEsquemaObservaciones"
            )
            ?.value
            .trim() ||
        "";


    const idEventoCelebracion =
        document
            .getElementById(
                "nuevoEsquemaCelebracion"
            )
            ?.value
            .trim() ||
        "";


    const boton =
        document.getElementById(
            "btnGuardarNuevoEsquema"
        );


    const mensaje =
        document.getElementById(
            "adminNuevoEsquemaMensaje"
        );


    // ==================================================
    // VALIDACIONES
    // ==================================================

    if (!tipoEsquema) {

        mostrarMensajeNuevoEsquema(
            "Selecciona el tipo de esquema.",
            "error"
        );

        return;

    }


    if (!descripcion) {

        mostrarMensajeNuevoEsquema(
            "Escribe la descripción del esquema.",
            "error"
        );

        return;

    }


    // ==================================================
    // CANTOS
    // ==================================================

    const detalles =
        [];


    document
        .querySelectorAll(
            ".esquema-canto-input"
        )
        .forEach(
            input => {

                const canto =
                    input.value.trim();


                if (!canto) {

                    return;

                }


                const momento =
                    input.dataset.momento ||
                    "";


                const observacionesInput =
                    Array
                        .from(
                            document.querySelectorAll(
                                ".esquema-canto-observaciones"
                            )
                        )
                        .find(
                            elemento =>
                                elemento.dataset.momento ===
                                momento
                        );


                detalles.push({

                    momento:
                        momento,

                    canto:
                        canto,

                    observaciones:
                        observacionesInput
                            ?.value
                            .trim() ||
                        ""

                });

            }
        );


    // ==================================================
    // BLOQUEAR BOTÓN
    // ==================================================

    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    mostrarMensajeNuevoEsquema(
        "Guardando esquema...",
        "validando"
    );


    try {

        // ==================================================
        // UN SOLO POST
        // ==================================================

        const respuesta =
            await fetch(
                URL_API,
                {
                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            accion:
                                "crearEsquema",

                            credential:
                                adminCredential,

                            esquema: {

                                tipoEsquema:
                                    tipoEsquema,

                                descripcion:
                                    descripcion,

                                observaciones:
                                    observaciones,

                                idEventoCelebracion:
                                    idEventoCelebracion,

                                // Los ensayos no se gestionan desde este formulario.
                                // Se envía vacío para conservar compatibilidad con el backend.
                                idsEventosEnsayo:
                                    [],

                                detalles:
                                    detalles

                            }

                        })
                }
            );


        const resultado =
            await respuesta.json();


        if (
            !resultado.ok
        ) {

            throw new Error(
                resultado.error ||
                "No fue posible crear el esquema."
            );

        }


        // ==================================================
        // INVALIDAR CACHÉS
        // ==================================================

        invalidarDatosAdminEsquemas();

        invalidarDatosApp();


        // ==================================================
        // RECARGAR SOLO ADMIN ESQUEMAS
        // ==================================================

        const datosActualizados =
            await obtenerDatosAdminEsquemas(
                true
            );


        await abrirAdminEsquemas(
            datosActualizados
        );


        const pantalla =
            document.querySelector(
                ".admin-esquemas"
            );


        if (pantalla) {

            pantalla.insertAdjacentHTML(
                "afterbegin",
                `

                    <div class="admin-exito">

                        ✅ Esquema creado correctamente.

                    </div>

                `
            );

        }


    } catch(error) {

        console.error(
            "Error creando esquema:",
            error
        );


        mostrarMensajeNuevoEsquema(

            error.message ||
            "No fue posible crear el esquema.",

            "error"

        );


        boton.disabled =
            false;


        boton.textContent =
            "Guardar esquema";

    }

}


// ======================================================
// MENSAJES NUEVO ESQUEMA
// ======================================================

function mostrarMensajeNuevoEsquema(
    texto,
    tipo = "exito"
) {

    const mensaje =
        document.getElementById(
            "adminNuevoEsquemaMensaje"
        );


    if (!mensaje) {

        return;

    }


    let clase =
        "admin-exito";


    if (
        tipo === "error"
    ) {

        clase =
            "admin-error";

    }


    if (
        tipo === "validando"
    ) {

        clase =
            "admin-validando";

    }


    mensaje.innerHTML = `

        <div class="${clase}">

            ${escaparHtml(texto)}

        </div>

    `;

}


// ======================================================
// TEXTO DE EVENTO EN SELECT
// ======================================================

function obtenerTextoEventoEsquema(
    evento
) {

    const fecha =
        obtenerFechaVisualEsquema(
            evento.fecha
        );


    const hora =
        String(
            evento.hora ||
            ""
        )
        .substring(
            0,
            5
        );


    const descripcion =
        evento.descripcion ||
        evento.tipo ||
        "Evento";


    return (

        fecha.dia +
        " " +
        fecha.mes +

        (
            hora
                ? " · " + hora
                : ""
        ) +

        " · " +

        descripcion

    );

}


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizarTextoEsquema(
    texto
) {

    return String(
        texto || ""
    )
    .trim()
    .toLowerCase()
    .normalize(
        "NFD"
    )
    .replace(
        /[\u0300-\u036f]/g,
        ""
    );

}

// ======================================================
// EDITAR ESQUEMA
// ======================================================

function editarEsquemaAdmin(
    idEsquema
) {

    alert(
        "Ahora vamos a editar " +
        idEsquema
    );

}


// ======================================================
// ELIMINAR ESQUEMA
// ======================================================

function eliminarEsquemaAdmin(
    idEsquema
) {

    alert(
        "La eliminación de " +
        idEsquema +
        " será el siguiente paso."
    );

}


// ======================================================
// NAVEGACIÓN
// ======================================================

function mostrarSeccion(
    id
) {

    document
        .querySelectorAll(
            ".seccion"
        )
        .forEach(
            seccion => {

                seccion.classList.remove(
                    "activa"
                );

            }
        );


    document
        .getElementById(
            id
        )
        ?.classList
        .add(
            "activa"
        );

}


// ======================================================
// INICIO
// ======================================================

async function cargarInicio(
    datosPrecargados = null
) {

    try {

        const data =
            datosPrecargados ||
            await obtenerDatosApp();


        renderizarInicio(
            data
        );


    } catch(error) {

        console.error(
            "Error inicio:",
            error
        );

    }

}


// ======================================================
// RENDER INICIO
// ======================================================

function renderizarInicio(
    data
) {

    const contenedor =
        document.getElementById(
            "inicioEventos"
        );


    if (
        !contenedor
    ) {

        return;

    }


    contenedor.innerHTML =
        "";


    const ahora =
        new Date();


    const eventos =
        Array.isArray(
            data.eventos
        )

            ? data.eventos

            : [];


    const eventosProximos =
        eventos

            .map(
                evento => {

                    const hora =
                        evento.hora

                            ? evento.hora.substring(
                                0,
                                5
                            )

                            : "00:00";


                    const fechaHora =
                        new Date(

                            `${evento.fechaISO}T${hora}:00`

                        );


                    return {

                        ...evento,

                        fechaHora

                    };

                }
            )

            .filter(
                evento =>
                    evento.fechaHora >=
                    ahora
            )

            .sort(
                (a, b) =>
                    a.fechaHora -
                    b.fechaHora
            )

            .slice(
                0,
                4
            );


    if (
        eventosProximos.length ===
        0
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


        <div
            class="
                evento-destacado
                ${estiloPrincipal.clase}
            ">

            <div class="evento-destacado-superior">

                <span class="evento-tipo-badge">

                    ${estiloPrincipal.icono}

                    ${escaparHtml(principal.tipo)}

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

                        ${
                            escaparHtml(
                                principal.titulo ||
                                principal.tipo
                            )
                        }

                    </h3>

                    <p>
                        🕒 ${escaparHtml(principal.hora)}
                    </p>

                    ${
                        principal.lugar
                            ? `
                                <p>
                                    📍 ${
                                        escaparHtml(
                                            principal.lugar
                                        )
                                    }
                                </p>
                            `
                            : ""
                    }

                </div>

            </div>

        </div>

    `;


    const siguientes =
        eventosProximos.slice(
            1
        );


    if (
        siguientes.length
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

                    <div
                        class="
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

                                ${
                                    escaparHtml(
                                        evento.tipo
                                    )
                                }

                            </strong>

                            <span>

                                ${
                                    escaparHtml(
                                        evento.titulo ||
                                        ""
                                    )
                                }

                            </span>

                            <small>

                                🕒 ${
                                    escaparHtml(
                                        evento.hora
                                    )
                                }

                                ${
                                    evento.lugar
                                        ? ` · 📍 ${
                                            escaparHtml(
                                                evento.lugar
                                            )
                                        }`
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

}


// ======================================================
// ESTILO EVENTO
// ======================================================

function obtenerEstiloEvento(
    tipo
) {

    const texto =
        String(
            tipo || ""
        )
        .toLowerCase();


    if (
        texto.includes(
            "ensayo"
        )
    ) {

        return {

            icono:
                "🎼",

            clase:
                "evento-ensayo"

        };

    }


    if (
        texto.includes(
            "misa"
        )
    ) {

        return {

            icono:
                "⛪",

            clase:
                "evento-misa"

        };

    }


    if (
        texto.includes(
            "present"
        )
    ) {

        return {

            icono:
                "🎤",

            clase:
                "evento-presentacion"

        };

    }


    if (
        texto.includes(
            "evento"
        )
    ) {

        return {

            icono:
                "✨",

            clase:
                "evento-especial"

        };

    }


    return {

        icono:
            "📌",

        clase:
            "evento-otro"

    };

}


// ======================================================
// FORMATEAR FECHA INICIO
// ======================================================

function formatearFechaInicio(
    fecha
) {

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
            )
            .padStart(
                2,
                "0"
            ),

        mes:
            meses[
                fecha.getMonth()
            ]

    };

}


// ======================================================
// FECHA COMPACTA
// ======================================================

function formatearFechaCompacta(
    fecha
) {

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


// ======================================================
// FECHA HOY
// ======================================================

function formatearFechaHoy() {

    return new Date()
        .toLocaleDateString(

            "es-MX",

            {

                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long"

            }

        );

}


// ======================================================
// TEXTO FALTANTE
// ======================================================

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
            )

            /

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


// ======================================================
// ESQUEMAS
// ======================================================

let indiceEsquema =
    0;


let fechasDisponibles =
    [];


async function cargarEsquemas(
    datosPrecargados = null
) {

    try {

        const data =
            datosPrecargados ||
            await obtenerDatosApp();


        renderizarEsquemas(
            data
        );


    } catch(error) {

        console.error(
            "Error esquemas:",
            error
        );

    }

}


// ======================================================
// RENDER ESQUEMAS
// ======================================================

function renderizarEsquemas(
    data
) {

    const contenedor =
        document.getElementById(
            "listaEsquemas"
        );


    if (
        !contenedor
    ) {

        return;

    }


    contenedor.innerHTML =
        "";


    const esquemas =
        Array.isArray(
            data.esquemas
        )
            ? data.esquemas
            : [];


    if (
        !esquemas.length
    ) {

        contenedor.innerHTML = `

            <div class="card">
                No hay esquemas disponibles.
            </div>

        `;


        return;

    }


    fechasDisponibles =
        [];


    esquemas.forEach(
        item => {

            const clave =
                `${item.fecha}-${item.hora}-${item.descripcion}`;


            if (
                !fechasDisponibles
                    .some(
                        f =>
                            f.clave ===
                            clave
                    )
            ) {

                fechasDisponibles.push({

                    clave,
                    fecha:
                        item.fecha,

                    hora:
                        item.hora,

                    descripcion:
                        item.descripcion

                });

            }

        }
    );


    if (
        indiceEsquema >
        fechasDisponibles.length - 1
    ) {

        indiceEsquema =
            fechasDisponibles.length - 1;

    }


    if (
        indiceEsquema < 0
    ) {

        indiceEsquema =
            0;

    }


    const actual =
        fechasDisponibles[
            indiceEsquema
        ];


    contenedor.innerHTML = `

        <div class="navegacion-esquema">

            <button
                onclick="cambiarEsquema(-1)"
                ${
                    indiceEsquema === 0
                        ? "disabled"
                        : ""
                }>

                ◀

            </button>


            <div class="titulo-esquema">

                <h2>
                    📅 Esquema del ${actual.fecha}
                </h2>

                <p>
                    🕒 ${actual.hora}
                </p>

            </div>


            <button
                onclick="cambiarEsquema(1)"
                ${
                    indiceEsquema ===
                    fechasDisponibles.length - 1
                        ? "disabled"
                        : ""
                }>

                ▶

            </button>

        </div>


        <p class="descripcion-esquema">
            ${escaparHtml(actual.descripcion)}
        </p>


        <div
            class="card"
            id="cardEsquema">
        </div>

    `;


    const card =
        document.getElementById(
            "cardEsquema"
        );


    esquemas
        .filter(
            item =>

                item.fecha ===
                    actual.fecha

                &&

                item.hora ===
                    actual.hora

                &&

                item.descripcion ===
                    actual.descripcion
        )
        .forEach(
            item => {

                card.innerHTML += `

                    <div class="linea-canto">

                        <span class="momento">

                            ${
                                escaparHtml(
                                    item.momento
                                )
                            } :

                        </span>

                        <span class="canto">

                            ${
                                item.canto &&
                                item.canto.trim() !== ""

                                    ? `🎵 ${
                                        escaparHtml(
                                            item.canto
                                        )
                                    }`

                                    : `
                                        <span class="canto-vacio">
                                            Pendiente
                                        </span>
                                    `
                            }

                        </span>

                    </div>

                `;

            }
        );

}


// ======================================================
// CAMBIAR ESQUEMA
// ======================================================

function cambiarEsquema(
    direccion
) {

    indiceEsquema +=
        direccion;


    if (
        indiceEsquema < 0
    ) {

        indiceEsquema =
            0;

    }


    if (
        indiceEsquema >
        fechasDisponibles.length - 1
    ) {

        indiceEsquema =
            fechasDisponibles.length - 1;

    }


    // No hay fetch.
    renderizarEsquemas(
        appDataCache
    );

}


// ======================================================
// CANTOS
// ======================================================

async function cargarCantos(
    datosPrecargados = null
) {

    try {

        const data =
            datosPrecargados ||
            await obtenerDatosApp();


        renderizarCantos(
            data
        );


    } catch(error) {

        console.error(
            "Error cantos:",
            error
        );

    }

}


// ======================================================
// RENDER CANTOS
// ======================================================

function renderizarCantos(
    data
) {

    const lista =
        document.getElementById(
            "listaCantos"
        );


    if (
        !lista
    ) {

        return;

    }


    const cantos =
        Array.isArray(
            data.cantos
        )
            ? data.cantos
            : [];


    lista.innerHTML =
        "";


    if (
        !cantos.length
    ) {

        lista.innerHTML = `

            <li class="cantos-vacio">

                🎵 No hay categorías disponibles

            </li>

        `;


        return;

    }


    cantos.forEach(
        categoria => {

            lista.innerHTML += `

                <li class="canto-categoria">

                    <a
                        href="${
                            escaparHtml(
                                categoria.url
                            )
                        }"
                        target="_blank"
                        rel="noopener noreferrer">


                        <div class="canto-categoria-icono">
                            🎵
                        </div>


                        <div class="canto-categoria-info">

                            <strong>

                                ${
                                    escaparHtml(
                                        categoria.categoria
                                    )
                                }

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

        }
    );

}


// ======================================================
// CALENDARIO
// ======================================================

let mesActual =
    0;


let añoActual =
    0;


let eventosCalendario =
    [];


let mesesDisponibles =
    [];


async function cargarCalendario(
    datosPrecargados = null
) {

    try {

        const data =
            datosPrecargados ||
            await obtenerDatosApp();


        renderizarCalendario(
            data
        );


    } catch(error) {

        console.error(
            "Error calendario:",
            error
        );

    }

}


// ======================================================
// RENDER CALENDARIO
// ======================================================

function renderizarCalendario(
    data
) {

    eventosCalendario =
        Array.isArray(
            data.eventos
        )
            ? data.eventos
            : [];


    const calendario =
        document.getElementById(
            "calendarioEventos"
        );


    const detalle =
        document.getElementById(
            "detalleFecha"
        );


    if (
        !calendario ||
        !detalle
    ) {

        return;

    }


    calendario.innerHTML =
        "";


    detalle.innerHTML =
        "";


    const meses = [

        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"

    ];


    mesesDisponibles =
        [];


    eventosCalendario.forEach(
        evento => {

            if (
                !evento.fechaISO
            ) {

                return;

            }


            const partes =
                evento.fechaISO
                    .split(
                        "-"
                    );


            const anio =
                Number(
                    partes[0]
                );


            const mes =
                Number(
                    partes[1]
                ) - 1;


            const clave =
                `${mes}-${anio}`;


            if (
                !mesesDisponibles.some(
                    item =>
                        item.clave ===
                        clave
                )
            ) {

                mesesDisponibles.push({

                    clave,
                    mes,
                    año:
                        anio

                });

            }

        }
    );


    mesesDisponibles.sort(
        (a, b) =>

            a.año !== b.año
                ? a.año - b.año
                : a.mes - b.mes
    );


    if (
        !mesesDisponibles.length
    ) {

        return;

    }


    const existe =
        mesesDisponibles.some(
            item =>

                item.mes ===
                    mesActual

                &&

                item.año ===
                    añoActual
        );


    if (
        !existe
    ) {

        mesActual =
            mesesDisponibles[0].mes;


        añoActual =
            mesesDisponibles[0].año;

    }


    const primerDia =
        new Date(
            añoActual,
            mesActual,
            1
        )
        .getDay();


    const diasMes =
        new Date(
            añoActual,
            mesActual + 1,
            0
        )
        .getDate();


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

                        ${meses[mesActual]}
                        ${añoActual}

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
        calendario.querySelector(
            ".calendar-grid"
        );


    const offset =
        primerDia === 0
            ? 6
            : primerDia - 1;


    for (
        let i = 0;
        i < offset;
        i++
    ) {

        grid.innerHTML += `

            <div class="calendar-empty">
            </div>

        `;

    }


    for (
        let dia = 1;
        dia <= diasMes;
        dia++
    ) {

        const eventosDia =
            obtenerEventosDia(
                dia
            );


        const color =
            eventosDia.length

                ? obtenerClaseCalendario(
                    eventosDia[0].tipo
                )

                : "";


        grid.innerHTML += `

            <div
                class="
                    calendar-day
                    ${color}
                    ${
                        eventosDia.length
                            ? "has-event"
                            : ""
                    }
                "
                data-day="${dia}"
                onclick="mostrarEventosDia(${dia})">

                ${dia}

            </div>

        `;

    }

}


// ======================================================
// EVENTOS DE UN DÍA
// ======================================================

function obtenerEventosDia(
    dia
) {

    return eventosCalendario.filter(
        evento => {

            if (
                !evento.fechaISO
            ) {

                return false;

            }


            const partes =
                evento.fechaISO
                    .split(
                        "-"
                    );


            return (

                Number(
                    partes[2]
                ) === dia

                &&

                Number(
                    partes[1]
                ) - 1 === mesActual

                &&

                Number(
                    partes[0]
                ) === añoActual

            );

        }
    );

}


// ======================================================
// MOSTRAR EVENTOS DÍA
// ======================================================

function mostrarEventosDia(
    dia
) {

    document
        .querySelectorAll(
            ".calendar-day"
        )
        .forEach(
            elemento => {

                elemento.classList.remove(
                    "selected"
                );

            }
        );


    document
        .querySelector(
            `.calendar-day[data-day="${dia}"]`
        )
        ?.classList
        .add(
            "selected"
        );


    const detalle =
        document.getElementById(
            "detalleFecha"
        );


    const lista =
        obtenerEventosDia(
            dia
        );


    const meses = [

        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre"

    ];


    detalle.innerHTML = `

        <div class="card card-dia-seleccionado">

            <h2>

                📅 ${dia} de
                ${meses[mesActual]}

            </h2>

            <p>
                ${lista.length}
                evento(s) programado(s)
            </p>

        </div>

    `;


    lista.forEach(
        evento => {

            const estilo =
                obtenerEstiloCalendario(
                    evento.tipo
                );


            detalle.innerHTML += `

                <div class="card card-evento-calendario">

                    <div
                        class="
                            tipo-chip
                            ${estilo.clase}
                        ">

                        ${estilo.etiqueta}

                    </div>


                    <div class="evento-contenido">

                        <h3>

                            ${
                                escaparHtml(
                                    evento.titulo
                                )
                            }

                        </h3>

                        <p>

                            ⏰ ${
                                escaparHtml(
                                    evento.hora
                                )
                            }

                        </p>

                        <p>

                            📍 ${
                                evento.lugar

                                    ? escaparHtml(
                                        evento.lugar
                                    )

                                    : "Sin ubicación"
                            }

                        </p>

                    </div>

                </div>

            `;

        }
    );

}


// ======================================================
// CLASE CALENDARIO
// ======================================================

function obtenerClaseCalendario(
    tipo
) {

    const texto =
        String(
            tipo || ""
        )
        .toLowerCase();


    if (
        texto.includes(
            "misa"
        )
    ) {

        return "calendar-misa";

    }


    if (
        texto.includes(
            "ensayo"
        )
    ) {

        return "calendar-ensayo";

    }


    if (
        texto.includes(
            "present"
        )
    ) {

        return "calendar-presentacion";

    }


    if (
        texto.includes(
            "evento"
        )
    ) {

        return "calendar-evento";

    }


    return "";

}


// ======================================================
// CHIP CALENDARIO
// ======================================================

function obtenerEstiloCalendario(
    tipo
) {

    const texto =
        String(
            tipo || ""
        )
        .toLowerCase();


    if (
        texto.includes(
            "misa"
        )
    ) {

        return {

            clase:
                "tipo-misa-chip",

            etiqueta:
                "🟡 Misa"

        };

    }


    if (
        texto.includes(
            "ensayo"
        )
    ) {

        return {

            clase:
                "tipo-ensayo-chip",

            etiqueta:
                "🔵 Ensayo"

        };

    }


    if (
        texto.includes(
            "present"
        )
    ) {

        return {

            clase:
                "tipo-presentacion-chip",

            etiqueta:
                "🟣 Presentación"

        };

    }


    return {

        clase:
            "tipo-evento-chip",

        etiqueta:
            "🟢 Evento"

    };

}


// ======================================================
// MES ANTERIOR
// ======================================================

function mesAnterior() {

    const indice =
        mesesDisponibles
            .findIndex(
                item =>

                    item.mes ===
                        mesActual

                    &&

                    item.año ===
                        añoActual
            );


    if (
        indice > 0
    ) {

        mesActual =
            mesesDisponibles[
                indice - 1
            ].mes;


        añoActual =
            mesesDisponibles[
                indice - 1
            ].año;


        // No hay fetch.
        renderizarCalendario(
            appDataCache
        );

    }

}


// ======================================================
// MES SIGUIENTE
// ======================================================

function mesSiguiente() {

    const indice =
        mesesDisponibles
            .findIndex(
                item =>

                    item.mes ===
                        mesActual

                    &&

                    item.año ===
                        añoActual
            );


    if (
        indice >= 0 &&
        indice <
        mesesDisponibles.length - 1
    ) {

        mesActual =
            mesesDisponibles[
                indice + 1
            ].mes;


        añoActual =
            mesesDisponibles[
                indice + 1
            ].año;


        // No hay fetch.
        renderizarCalendario(
            appDataCache
        );

    }

}


// ======================================================
// FILTRO CANTOS
// ======================================================

function filtrarCantos() {

    const texto =
        document
            .getElementById(
                "buscarCanto"
            )
            ?.value
            .toLowerCase() ||
        "";


    document
        .querySelectorAll(
            "#listaCantos li"
        )
        .forEach(
            item => {

                item.style.display =
                    item.textContent
                        .toLowerCase()
                        .includes(
                            texto
                        )

                        ? ""

                        : "none";

            }
        );

}


// ======================================================
// CARGA INICIAL OPTIMIZADA
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            // ======================================
            // UNA ÚNICA PETICIÓN
            // ======================================

            const data =
                await obtenerDatosApp();


            // ======================================
            // CUATRO SECCIONES
            // MISMO JSON
            // ======================================

            renderizarInicio(
                data
            );


            renderizarEsquemas(
                data
            );


            renderizarCantos(
                data
            );


            renderizarCalendario(
                data
            );


            console.log(
                "AppCorus V3.2: datos cargados con una sola consulta."
            );


        } catch(error) {

            console.error(
                "Error cargando AppCorus:",
                error
            );

        }

    }

);