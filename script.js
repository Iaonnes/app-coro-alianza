// Configuración: reemplaza con tu propio ID de hoja y API Key
const SHEET_ID = "TU_ID_DE_HOJA"; 
const API_KEY = "TU_API_KEY";
const RANGE = "Hoja1!A:E"; // columnas A a E

async function cargarDatos() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  mostrarDatos(data.values);
}

function mostrarDatos(rows) {
  const listaEsquemas = document.getElementById("listaEsquemas");
  const listaEnsayos = document.getElementById("listaEnsayos");
  listaEsquemas.innerHTML = "";
  listaEnsayos.innerHTML = "";

  rows.slice(1).forEach(r => {
    const fecha = r[0];
    const hora = r[1];
    const lugar = r[2];
    const tipo = r[3];
    const archivo = r[4];

    const card = `
      <div class="card">
        <strong>${fecha} - ${hora}</strong><br>
        Lugar: ${lugar}<br>
        <a href="${archivo}" target="_blank">Ver archivo</a>
      </div>`;

    if (tipo.toLowerCase() === "esquema") {
      listaEsquemas.innerHTML += card;
    } else if (tipo.toLowerCase() === "ensayo") {
      listaEnsayos.innerHTML += card;
    }
  });
}

cargarDatos(); 