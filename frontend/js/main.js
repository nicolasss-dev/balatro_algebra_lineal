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

// Cartas del menú
document.querySelectorAll("#menu .carta").forEach(carta => {
  carta.addEventListener("click", () => fadeTo(carta.dataset.target));
  carta.addEventListener("keydown", (e) => { if (e.key === "Enter") fadeTo(carta.dataset.target); });
});

// Botones volver
document.querySelectorAll(".volver").forEach(btn => {
  btn.addEventListener("click", () => fadeTo(btn.dataset.target));
});

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

