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
  console.log('Fade transition to:', id);
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

// Transición con rombo alargado: escala desde 0 hasta cubrir y vuelve a 0
function diamondTransitionTo(id) {
  console.log('Diamond transition called for:', id);
  const overlay = document.getElementById('transitionOverlay');
  const diamond = overlay?.querySelector('.diamond');
  console.log('Overlay found:', overlay);
  console.log('Diamond found:', diamond);
  
  if (!overlay || !diamond) { 
    console.log('Fallback to fade transition');
    fadeTo(id); 
    return; 
  } // fallback

  overlay.style.display = 'flex';
  console.log('Starting diamond expansion animation');
  
  // Calcula un factor de escala dinámico para que el rombo cubra TODA la pantalla
  const W = window.innerWidth;
  const H = window.innerHeight;
  // offsetWidth/offsetHeight no se ven afectados por transform, así que son el tamaño base
  const baseW = diamond.offsetWidth || (W * 0.08);
  const baseH = diamond.offsetHeight || (H * 0.04);
  // Fórmula para incluir las esquinas del viewport dentro del rombo (L1):
  // s >= (W/baseW) + (H/baseH)
  let scaleTarget = (W / baseW) + (H / baseH);
  scaleTarget += 2; // pequeño margen por seguridad
  
  // Asegura que sea un número razonable en cualquier caso
  if (!isFinite(scaleTarget) || scaleTarget < 50) scaleTarget = 50;
  
  // Fallback para navegadores que no soportan Web Animations API
  if (!diamond.animate) {
    console.log('Web Animations API not supported, using CSS fallback');
    diamond.style.transition = 'transform 800ms ease-in';
    diamond.style.transform = `scale(${scaleTarget})`;
    
    setTimeout(() => {
      console.log('Expansion complete, changing screen');
      showScreen(id);
      diamond.style.transition = 'transform 800ms ease-out';
      diamond.style.transform = 'scale(0)';
      
      setTimeout(() => {
        console.log('Collapse complete, hiding overlay');
        overlay.style.display = 'none';
        diamond.style.transition = '';
      }, 1000);
    }, 1000);
    return;
  }
  
  const expand = diamond.animate([
    { transform: 'scale(0)' },
    { transform: `scale(${scaleTarget})` }  
  ], { duration: 800, easing: 'ease-in' });

  expand.finished.then(() => {
    console.log('Expansion complete, changing screen');
    showScreen(id); // cambiar de escena cuando el rombo cubre pantalla
    const collapse = diamond.animate([
      { transform: `scale(${scaleTarget})` },
      { transform: 'scale(0)' }
    ], { duration: 800, easing: 'ease-out' });
    collapse.finished.then(() => {
      console.log('Collapse complete, hiding overlay');
      overlay.style.display = 'none';
    });
  }).catch(err => {
    console.error('Animation failed:', err);
    overlay.style.display = 'none';
    fadeTo(id);
  });
}

// Inicio -> Menú
document.getElementById("btnIniciar").addEventListener("click", () => {
  console.log('Iniciar button clicked');
  diamondTransitionTo("menu");
});
// Cartas del menú
document.querySelectorAll("#menu .carta").forEach(carta => {
  console.log('Setting up carta listener for:', carta.dataset.target);
  carta.addEventListener("click", () => {
    console.log('Carta clicked:', carta.dataset.target);
    diamondTransitionTo(carta.dataset.target);
  });
  carta.addEventListener("keydown", (e) => { 
    if (e.key === "Enter") {
      console.log('Carta Enter pressed:', carta.dataset.target);
      diamondTransitionTo(carta.dataset.target); 
    }
  });
});

// Botones volver
document.querySelectorAll(".volver").forEach(btn => {
  btn.addEventListener("click", () => diamondTransitionTo(btn.dataset.target));
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
