// ==========================================
// CONFIGURACIÓN
// ==========================================

const URL_API =
"https://script.google.com/macros/s/AKfycbwwQ4sXBmkNj4QXQjknr3h9OTVtPzBZibLkoCd-nRVg3L7Ndi1Zpu_r8ES6dHgO26-c/exec";


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

async function cargarEsquemas() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();
        
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

    cargarInicio();
    cargarEnsayos();
    cargarEsquemas();
    cargarCantos();

});