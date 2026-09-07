// ==========================================
// CONFIGURACIÓN
// ==========================================

// API AppScript AppCorus V2.2
const URL_API =
"https://script.google.com/macros/s/AKfycbx7IkTSR91bHhRS0OL_48OUBM7GNkvBkgZY5casEGFqYUN2vM2W6ylUlYiR-LLxF112/exec";

const GOOGLE_CLIENT_ID =
"765205397306-q1qna5aj3j5ifk62j28us4lqrgjk7ig8.apps.googleusercontent.com";

let googleLoginInicializado = false;


// ==========================================
// SESIÓN ADMINISTRATIVA
// ==========================================
//
// Se conserva únicamente mientras la página
// permanezca abierta.
// ==========================================

let adminCredential = null;
let adminUsuario = null;


// ==========================================
// ABRIR ADMINISTRACIÓN
// ==========================================

function abrirAccesoAdministracion() {

    mostrarSeccion("administracion");


    if (adminUsuario) {

        mostrarPanelAdministracion(
            adminUsuario
        );

        return;
    }


    inicializarGoogleLogin();

}


// ==========================================
// GOOGLE LOGIN
// ==========================================

function inicializarGoogleLogin() {

    // ==========================================
    // DESARROLLO LOCAL
    // ==========================================

    if (
        window.location.protocol === "file:"
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

            contenedor.innerHTML = "";

        }


        if (mensaje) {

            mensaje.innerHTML = `

                <div class="admin-validando">

                    🔐 El acceso administrativo está disponible
                    en la versión publicada de AppCorus.

                </div>

            `;

        }


        return;

    }


    // ==========================================
    // EVITAR DOBLE INICIALIZACIÓN
    // ==========================================

    if (googleLoginInicializado) {

        return;

    }


    // ==========================================
    // COMPROBAR GOOGLE IDENTITY
    // ==========================================

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

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            manejarLoginGoogle

    });


    const contenedor =
        document.getElementById(
            "googleLoginButton"
        );


    if (!contenedor) {

        return;

    }


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


    googleLoginInicializado = true;

}


// ==========================================
// PROCESAR LOGIN GOOGLE
// ==========================================

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


        if (!resultado.ok) {

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


// ==========================================
// PANEL PRINCIPAL ADMIN
// ==========================================

function mostrarPanelAdministracion(
    usuario
) {

    const seccion =
        document.getElementById(
            "administracion"
        );


    if (!seccion) {

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


    const btnEventos =
        document.getElementById(
            "btnAdminEventos"
        );


    const btnEsquemas =
        document.getElementById(
            "btnAdminEsquemas"
        );


    if (btnEventos) {

        btnEventos.addEventListener(
            "click",
            abrirAdminEventos
        );

    }


    if (btnEsquemas) {

        btnEsquemas.addEventListener(
            "click",
            abrirAdminEsquemas
        );

    }

}


// ==========================================
// ADMINISTRACIÓN - EVENTOS
// ==========================================

async function abrirAdminEventos() {

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


    const btnVolver =
        document.getElementById(
            "btnVolverAdmin"
        );


    const btnNuevo =
        document.getElementById(
            "btnNuevoEvento"
        );


    if (btnVolver) {

        btnVolver.addEventListener(
            "click",
            () => {

                mostrarPanelAdministracion(
                    adminUsuario
                );

            }
        );

    }


    if (btnNuevo) {

        btnNuevo.addEventListener(
            "click",
            abrirFormularioNuevoEvento
        );

    }


    try {

        const respuesta =
            await fetch(
                URL_API
            );


        const data =
            await respuesta.json();


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
            "Error cargando eventos de Administración:",
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


// ==========================================
// RENDERIZAR EVENTOS ADMIN
// ==========================================

function renderizarAdminEventos(
    eventos
) {

    const contenedor =
        document.getElementById(
            "adminListaEventos"
        );


    if (!contenedor) {

        return;

    }


    if (!eventos.length) {

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


    if (proximos.length) {

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


    if (anteriores.length) {

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


// ==========================================
// TARJETA ADMIN EVENTO
// ==========================================

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

        <article class="
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


            <button
                class="admin-evento-editar"
                type="button"
                onclick="editarEventoAdmin('${idEvento}')">

                Editar

            </button>


        </article>

    `;

}


// ==========================================
// OBTENER FECHA/HORA ADMIN
// ==========================================

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


    if (fechaISO) {

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


// ==========================================
// FORMATO FECHA ADMIN
// ==========================================

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


// ==========================================
// ESCAPAR HTML
// ==========================================

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


// ==========================================
// NUEVO EVENTO
// ==========================================

async function abrirFormularioNuevoEvento() {

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


    const btnVolver =
        document.getElementById(
            "btnVolverEventos"
        );


    if (btnVolver) {

        btnVolver.addEventListener(
            "click",
            abrirAdminEventos
        );

    }


    try {

        const respuesta =
            await fetch(
                URL_API
            );


        const data =
            await respuesta.json();


        const catalogos =
            data.catalogos || {};


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
            tiposEvento.length === 0
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
            "Error cargando formulario de evento:",
            error
        );


        const contenido =
            document.getElementById(
                "adminFormularioContenido"
            );


        if (contenido) {

            contenido.innerHTML = `

                <div class="admin-error">

                    No fue posible cargar
                    los catálogos del evento.

                </div>

            `;

        }

    }

}


// ==========================================
// RENDERIZAR FORMULARIO NUEVO EVENTO
// ==========================================

function renderizarFormularioNuevoEvento(
    tiposEvento,
    lugares
) {

    const contenido =
        document.getElementById(
            "adminFormularioContenido"
        );


    if (!contenido) {

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


            <!-- =====================================
                 LUGAR
            ====================================== -->

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


                <!-- NUEVA UBICACIÓN -->

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


            <!-- =====================================
                 REFERENCIA
            ====================================== -->

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


            <!-- =====================================
                 ACTIVO
            ====================================== -->

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


    // ==========================================
    // SUBMIT
    // ==========================================

    const formulario =
        document.getElementById(
            "formNuevoEvento"
        );


    if (formulario) {

        formulario.addEventListener(
            "submit",
            function(evento) {

                evento.preventDefault();

                guardarNuevoEvento();

            }
        );

    }


    // ==========================================
    // CANCELAR
    // ==========================================

    const btnCancelar =
        document.getElementById(
            "btnCancelarEvento"
        );


    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            abrirAdminEventos
        );

    }


    // ==========================================
    // NUEVA UBICACIÓN
    // ==========================================

    const selectLugar =
        document.getElementById(
            "eventoLugar"
        );


    const contenedorNuevoLugar =
        document.getElementById(
            "contenedorNuevoLugar"
        );


    const btnAgregarNuevoLugar =
        document.getElementById(
            "btnAgregarNuevoLugar"
        );


    if (
        selectLugar &&
        contenedorNuevoLugar
    ) {

        selectLugar.addEventListener(
            "change",
            function() {

                if (
                    selectLugar.value ===
                    "__NUEVO_LUGAR__"
                ) {

                    contenedorNuevoLugar
                        .style
                        .display =
                            "block";


                    setTimeout(
                        () => {

                            const input =
                                document.getElementById(
                                    "nuevoLugarNombre"
                                );


                            if (input) {

                                input.focus();

                            }

                        },
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

    }


    if (btnAgregarNuevoLugar) {

        btnAgregarNuevoLugar.addEventListener(
            "click",
            guardarNuevaUbicacion
        );

    }

}


// ==========================================
// GUARDAR NUEVA UBICACIÓN
// ==========================================

async function guardarNuevaUbicacion() {

    if (
        !adminCredential ||
        !adminUsuario
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


    if (
        !input ||
        !boton ||
        !select
    ) {

        return;

    }


    const lugar =
        input.value.trim();


    if (!lugar) {

        if (mensaje) {

            mensaje.innerHTML = `

                <div class="admin-error">

                    Escribe el nombre de la ubicación.

                </div>

            `;

        }


        input.focus();

        return;

    }


    boton.disabled =
        true;


    boton.textContent =
        "Agregando...";


    if (mensaje) {

        mensaje.innerHTML = `

            <div class="admin-validando">

                Guardando ubicación...

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
            ).trim();


        // ==========================================
        // BUSCAR SI YA ESTÁ EN EL SELECT
        // ==========================================

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


        // ==========================================
        // SI NO ESTÁ, AGREGARLA
        // ==========================================

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
                opcionNueva || null
            );

        }


        // ==========================================
        // SELECCIONAR UBICACIÓN
        // ==========================================

        select.value =
            nombreLugar;


        if (contenedor) {

            contenedor.style.display =
                "none";

        }


        input.value =
            "";


        if (mensaje) {

            mensaje.innerHTML =
                "";

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


        if (mensaje) {

            mensaje.innerHTML = `

                <div class="admin-error">

                    ${
                        escaparHtml(
                            error.message ||
                            "No fue posible agregar la ubicación."
                        )
                    }

                </div>

            `;

        }


    } finally {

        boton.disabled =
            false;


        boton.textContent =
            "Agregar ubicación";

    }

}


// ==========================================
// GUARDAR NUEVO EVENTO
// ==========================================

async function guardarNuevoEvento() {

    if (
        !adminCredential ||
        !adminUsuario
    ) {

        abrirAccesoAdministracion();

        return;

    }


    const campoFecha =
        document.getElementById(
            "eventoFecha"
        );


    const campoHora =
        document.getElementById(
            "eventoHora"
        );


    const campoTipo =
        document.getElementById(
            "eventoTipo"
        );


    const campoDescripcion =
        document.getElementById(
            "eventoDescripcion"
        );


    const campoLugar =
        document.getElementById(
            "eventoLugar"
        );


    const campoReferencia =
        document.getElementById(
            "eventoReferencia"
        );


    const campoActivo =
        document.getElementById(
            "eventoActivo"
        );


    const boton =
        document.getElementById(
            "btnGuardarEvento"
        );


    if (
        !campoFecha ||
        !campoHora ||
        !campoTipo ||
        !campoDescripcion ||
        !campoLugar ||
        !campoReferencia ||
        !campoActivo ||
        !boton
    ) {

        return;

    }


    const fecha =
        campoFecha.value;


    const hora =
        campoHora.value;


    const tipo =
        campoTipo.value.trim();


    const descripcion =
        campoDescripcion.value.trim();


    const lugar =
        campoLugar.value.trim();


    const referencia =
        campoReferencia.value.trim();


    const activo =
        campoActivo.checked;


    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (!fecha) {

        mostrarMensajeFormulario(
            "Selecciona la fecha.",
            "error"
        );

        campoFecha.focus();

        return;

    }


    if (!hora) {

        mostrarMensajeFormulario(
            "Selecciona la hora.",
            "error"
        );

        campoHora.focus();

        return;

    }


    if (!tipo) {

        mostrarMensajeFormulario(
            "Selecciona el tipo de evento.",
            "error"
        );

        campoTipo.focus();

        return;

    }


    if (!descripcion) {

        mostrarMensajeFormulario(
            "Escribe la descripción del evento.",
            "error"
        );

        campoDescripcion.focus();

        return;

    }


    // ==========================================
    // NO PERMITIR GUARDAR LA OPCIÓN
    // "AGREGAR NUEVA UBICACIÓN"
    // ==========================================

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
                "No fue posible guardar el evento."

            );

        }


        // ==========================================
        // ACTUALIZAR SECCIONES PÚBLICAS
        // ==========================================

        await cargarInicio();

        await cargarCalendario();


        // ==========================================
        // VOLVER A LISTA DE EVENTOS
        // ==========================================

        await abrirAdminEventos();


        // ==========================================
        // CONFIRMACIÓN
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


// ==========================================
// MENSAJES DEL FORMULARIO
// ==========================================

function mostrarMensajeFormulario(
    texto,
    tipo = "exito"
) {

    const mensaje =
        document.getElementById(
            "adminFormMensaje"
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


// ==========================================
// EDITAR EVENTO
// ==========================================
//
// Lo conectaremos en el siguiente paso.
// ==========================================

function editarEventoAdmin(
    idEvento
) {

    alert(

        "Edición del evento " +
        idEvento +
        " será el siguiente paso."

    );

}


// ==========================================
// ADMINISTRACIÓN - ESQUEMAS
// ==========================================

function abrirAdminEsquemas() {

    alert(
        "Administración de Esquemas será el siguiente módulo."
    );

}


// ==========================================
// NAVEGACIÓN
// ==========================================

function mostrarSeccion(id) {

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


    const destino =
        document.getElementById(
            id
        );


    if (destino) {

        destino.classList.add(
            "activa"
        );

    }

}


// ==========================================
// INICIO
// ==========================================

async function cargarInicio() {

    try {

        const response =
            await fetch(
                URL_API
            );


        const data =
            await response.json();


        const contenedor =
            document.getElementById(
                "inicioEventos"
            );


        if (!contenedor) {

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

                                ? evento.hora
                                    .substring(
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


// ==========================================
// FECHA PRINCIPAL
// ==========================================

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


// ==========================================
// FECHA COMPACTA
// ==========================================

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

                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long"

            }

        );

}


// ==========================================
// HOY / MAÑANA / FALTAN DÍAS
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


// ==========================================
// ESQUEMAS
// ==========================================

let indiceEsquema =
    0;

let fechasDisponibles =
    [];


async function cargarEsquemas() {

    try {

        const response =
            await fetch(
                URL_API
            );


        const data =
            await response.json();


        const contenedor =
            document.getElementById(
                "listaEsquemas"
            );


        if (!contenedor) {

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
            esquemas.length === 0
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

                        clave:
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


        const esquemaActual =
            fechasDisponibles[
                indiceEsquema
            ];


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
                    ${
                        indiceEsquema === 0
                            ? "disabled"
                            : ""
                    }>

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
                ${descripcionSeleccionada}
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


        const esquemaDelDia =
            esquemas.filter(
                item =>

                    item.fecha ===
                        fechaSeleccionada

                    &&

                    item.hora ===
                        horaSeleccionada

                    &&

                    item.descripcion ===
                        descripcionSeleccionada
            );


        esquemaDelDia.forEach(
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


    } catch(error) {

        console.error(
            "Error esquemas:",
            error
        );


        const contenedor =
            document.getElementById(
                "listaEsquemas"
            );


        if (contenedor) {

            contenedor.innerHTML = `

                <div class="card">

                    Error al cargar los esquemas.

                </div>

            `;

        }

    }

}


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


    cargarEsquemas();

}


// ==========================================
// CANTOS
// ==========================================

async function cargarCantos() {

    try {

        const response =
            await fetch(
                URL_API
            );


        const data =
            await response.json();


        const lista =
            document.getElementById(
                "listaCantos"
            );


        if (!lista) {

            return;

        }


        lista.innerHTML =
            "";


        const cantos =
            Array.isArray(
                data.cantos
            )
                ? data.cantos
                : [];


        if (
            cantos.length === 0
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

let mesActual =
    0;

let añoActual =
    0;

let eventosCalendario =
    [];

let mesesDisponibles =
    [];


async function cargarCalendario() {

    try {

        const response =
            await fetch(
                URL_API
            );


        const data =
            await response.json();


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

                if (!evento.fechaISO) {

                    return;

                }


                const partesISO =
                    evento.fechaISO.split(
                        "-"
                    );


                if (
                    partesISO.length !== 3
                ) {

                    return;

                }


                const anio =
                    Number(
                        partesISO[0]
                    );


                const indiceMes =
                    Number(
                        partesISO[1]
                    ) - 1;


                const clave =
                    `${indiceMes}-${anio}`;


                if (
                    !mesesDisponibles.some(
                        item =>
                            item.clave ===
                            clave
                    )
                ) {

                    mesesDisponibles.push({

                        clave:
                            clave,

                        mes:
                            indiceMes,

                        año:
                            anio

                    });

                }

            }
        );


        mesesDisponibles.sort(
            (a, b) => {

                if (
                    a.año !==
                    b.año
                ) {

                    return (
                        a.año -
                        b.año
                    );

                }


                return (
                    a.mes -
                    b.mes
                );

            }
        );


        if (
            !mesesDisponibles.length
        ) {

            return;

        }


        const mesExiste =
            mesesDisponibles.some(
                item =>

                    item.mes ===
                        mesActual

                    &&

                    item.año ===
                        añoActual
            );


        if (!mesExiste) {

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

                            ${
                                meses[
                                    mesActual
                                ]
                            }

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

            const eventoDia =
                eventosCalendario.filter(
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


                        const anioEvento =
                            Number(
                                partes[0]
                            );


                        const mesEvento =
                            Number(
                                partes[1]
                            ) - 1;


                        const diaEvento =
                            Number(
                                partes[2]
                            );


                        return (

                            diaEvento ===
                                dia

                            &&

                            mesEvento ===
                                mesActual

                            &&

                            anioEvento ===
                                añoActual

                        );

                    }
                );


            let color =
                "";


            if (
                eventoDia.length > 0
            ) {

                color =
                    obtenerClaseCalendario(
                        eventoDia[0].tipo
                    );

            }


            grid.innerHTML += `

                <div
                    class="
                        calendar-day
                        ${color}
                        ${
                            eventoDia.length > 0
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


        window.mostrarEventosDia =
            function(dia) {

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


                const diaActivo =
                    document.querySelector(

                        `.calendar-day[data-day="${dia}"]`

                    );


                if (diaActivo) {

                    diaActivo.classList.add(
                        "selected"
                    );

                }


                const lista =
                    eventosCalendario.filter(
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
                                ) ===
                                    dia

                                &&

                                Number(
                                    partes[1]
                                ) - 1 ===
                                    mesActual

                                &&

                                Number(
                                    partes[0]
                                ) ===
                                    añoActual

                            );

                        }
                    );


                detalle.innerHTML = `

                    <div class="card card-dia-seleccionado">

                        <h2>

                            📅 ${dia} de
                            ${
                                meses[
                                    mesActual
                                ]
                                .toLowerCase()
                            }

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

            };


    } catch(error) {

        console.error(
            "Error calendario:",
            error
        );

    }

}


// ==========================================
// CLASE CALENDARIO
// ==========================================

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


// ==========================================
// ESTILO DETALLE CALENDARIO
// ==========================================

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


// ==========================================
// MES ANTERIOR
// ==========================================

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


        cargarCalendario();

    }

}


// ==========================================
// MES SIGUIENTE
// ==========================================

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


        cargarCalendario();

    }

}


// ==========================================
// FILTRAR CANTOS
// ==========================================

function filtrarCantos() {

    const input =
        document.getElementById(
            "buscarCanto"
        );


    if (!input) {

        return;

    }


    const texto =
        input.value
            .toLowerCase();


    const elementos =
        document.querySelectorAll(
            "#listaCantos li"
        );


    elementos.forEach(
        item => {

            const nombre =
                item.textContent
                    .toLowerCase();


            item.style.display =
                nombre.includes(
                    texto
                )

                    ? ""

                    : "none";

        }
    );

}


// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarInicio();

        cargarEsquemas();

        cargarCantos();

        cargarCalendario();

    }
);