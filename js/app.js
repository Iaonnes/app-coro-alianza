// ==========================================
// CONFIGURACIÓN
// ==========================================

const URL_API =
"https://script.google.com/macros/s/AKfycbxVWRznDw17Y-O6Eub8NqSIQjSslaftR2dyARUhFMcjsP0vzRsddJ7053xjJGzNp8U_/exec";


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

// async function cargarEsquemas() {

    // try {

        // const response = await fetch(URL_API);
        // const data = await response.json();
        
        // console.log(data);
        
        
        
        // const contenedor =
            // document.getElementById("listaEsquemas");

        // contenedor.innerHTML = "";

        // data.esquemas.forEach(item => {

            // contenedor.innerHTML += `
                // <div class="card">
                    // <h3>${item.momento}</h3>
                    // <p>🎵 ${item.canto}</p>
                // </div>
            // `;
        // });

    // } catch (error) {

        // console.error("Error esquemas:", error);

        // document.getElementById("listaEsquemas").innerHTML = `
            // <div class="card">
                // Error al cargar los esquemas.
            // </div>
        // `;
    // }
// }
async function cargarEsquemas() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();

        console.log("VERSION NUEVA");
        console.log(data.esquemas[0]);


        const contenedor =
            document.getElementById("listaEsquemas");

        contenedor.innerHTML = "";

        let encabezadoActual = "";

        data.esquemas.forEach(item => {

        const encabezado =
            
        `${item.fecha}-${item.hora}-${item.descripcion}`;

    if (encabezado !== encabezadoActual) {

        encabezadoActual = encabezado;

        contenedor.innerHTML += `
            <h2>Esquema del ${item.fecha} a las ${item.hora}</h2>
            <p>${item.descripcion}</p>

            <div class="card" id="card-${encabezadoActual}">
            </div>
        `;
    }

    const card =
        document.getElementById(`card-${encabezadoActual}`);

    card.innerHTML += `
        <h3>${item.momento}</h3>
        <p>🎵 ${item.canto}</p>
        <hr>
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
// ==========================================
// CANTOS
// ==========================================

/* async function cargarCantos() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();

        console.log("URL:", URL_API);
        console.log("DATA:", data);
        console.log("CANTOS:", data.cantos);
``

        const lista =
            document.getElementById("listaCantos");

                data.cantos.forEach(canto => {

                    lista.innerHTML += `
                        <li class="card">
                            <a href="https://drive.google.com/drive/folders/1wo3zI4_rYH8_HxiYp__dWjxPeDfWamXJ "
                                🎵 ${canto.url}
                            </a>
                            <p>${canto.categoria}</p>
                        </li>
                    `;

                }); -->

    } catch(error) {

        console.error("Error cantos:", error);

    }
} */
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

// ==========================================
// INICIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    cargarEnsayos();
    cargarEsquemas();
    cargarCantos();

});