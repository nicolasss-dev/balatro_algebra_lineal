// Navegación entre pantallas y utilidades generales
const screens = ["menu", "matrices", "lineales", "vectores"];

function showScreen(id) {
  screens.forEach(s => {
    const el = document.getElementById(s);
    if (!el) return;
    el.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function fadeTo(id) {
  // simple fade-out/fade-in usando las clases .screen
  const current = screens.find(s => document.getElementById(s).classList.contains("active"));
  if (current) {
    const el = document.getElementById(current);
    el.classList.remove("active");
    setTimeout(() => showScreen(id), 300);
  } else {
    showScreen(id);
  }
}

// Función para inicializar las cartas del menú
function initMenuCards() {
  const cartas = document.querySelectorAll("#menu .carta");
  
  cartas.forEach(carta => {
    // Verificar que la carta tenga un target válido
    if (!carta.dataset.target) {
      console.warn("Carta sin target:", carta);
      return;
    }
    
    // Click normal
    carta.addEventListener("click", () => fadeTo(carta.dataset.target));
    
    // Eventos de teclado mejorados
    carta.addEventListener("keydown", (e) => {
      // Permitir tanto Enter como Espacio para activar
      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault(); // Prevenir el scroll con espacio
        fadeTo(carta.dataset.target);
      }
    });
    // Espacio también activa en keyup para emular comportamiento nativo de botón
    carta.addEventListener("keyup", (e) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        fadeTo(carta.dataset.target);
      }
    });
    
    // Asegurar que las cartas sean clickeables con el estilo de cursor
    carta.style.cursor = "pointer";
    
    // Agregar efecto hover visual para feedback
    carta.addEventListener("mouseenter", () => {
      carta.style.transform = "translateY(-8px)";
      carta.style.boxShadow = "0 12px 24px rgba(186, 140, 60, 0.5)";
    });
    
    carta.addEventListener("mouseleave", () => {
      carta.style.transform = "";
      carta.style.boxShadow = "";
    });
  });
}

// Botones volver: accesibles por tecla Enter/Espacio además de click
function initVolverButtons() {
  document.querySelectorAll(".volver").forEach(btn => {
    const activate = () => {
      const target = btn?.dataset?.target;
      if (target) fadeTo(target);
    };

    btn.addEventListener("click", activate);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault();
        activate();
      }
    });
    btn.addEventListener("keyup", (e) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        activate();
      }
    });
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initMenuCards();
    initVolverButtons();
  });
} else {
  // DOM ya está cargado
  initMenuCards();
  initVolverButtons();
}

// Helpers
export async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error desconocido");
  return data;
}

export function createTableFromMatrix(matrix) {
  const table = document.createElement("table");
  matrix.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(val => {
      const td = document.createElement("td");
      td.textContent = Number(val).toFixed(4);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  return table;
}

export function showMessage(container, msg) {
  container.innerHTML = `<p>${msg}</p>`;
}

