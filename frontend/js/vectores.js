import { postJSON, showMessage } from './main.js';

const inputsA = document.getElementById('inputsA');
const inputsB = document.getElementById('inputsB');
const panelRes = document.getElementById('resultadoVectores');
const canvas = document.getElementById('plano');
const ctx = canvas.getContext('2d');

let currentScale = 20; // Escala inicial: 20 píxeles por unidad
let offsetX = 0; // Desplazamiento X del origen del lienzo
let offsetY = 0; // Desplazamiento Y del origen del lienzo

let currentA = { x: 0, y: 0 };
let currentB = { x: 0, y: 0 };
let currentR = { x: 0, y: 0 };

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function setInputs(container, modo) {
  if (modo === 'rect') {
    container.innerHTML = `
      <label>Componente X <input type="number" step="any" class="vx"></label>
      <label>Componente Y <input type="number" step="any" class="vy"></label>
    `;
  } else {
    container.innerHTML = `
      <label>Magnitud <input type="number" step="any" min="0" class="vm"></label>
      <label>Dirección (°) <input type="number" step="any" min="0" max="360" class="va"></label>
    `;
  }
}

function getVector(container, modo) {
  if (modo === 'rect') {
    const x = Number(container.querySelector('.vx')?.value || 0);
    const y = Number(container.querySelector('.vy')?.value || 0);
    return { x, y };
  } else {
    const magnitud = Number(container.querySelector('.vm')?.value || 0);
    const angulo = Number(container.querySelector('.va')?.value || 0);
    return { magnitud, angulo };
  }
}

// Radio buttons
document.querySelectorAll('input[name="modoA"]').forEach(r => r.addEventListener('change', () => setInputs(inputsA, document.querySelector('input[name="modoA"]:checked').value)));
document.querySelectorAll('input[name="modoB"]').forEach(r => r.addEventListener('change', () => setInputs(inputsB, document.querySelector('input[name="modoB"]:checked').value)));
setInputs(inputsA, 'rect');
setInputs(inputsB, 'rect');

function drawGridLines() {
  const w = canvas.width;
  const h = canvas.height;

  // Calcular el rango visible en coordenadas del mundo
  const worldVisibleLeft = (-w / 2 - offsetX) / currentScale;
  const worldVisibleRight = (w / 2 - offsetX) / currentScale;
  const worldVisibleTop = (-h / 2 - offsetY) / currentScale;
  const worldVisibleBottom = (h / 2 - offsetY) / currentScale;

  ctx.strokeStyle = 'rgba(212,175,55,0.3)';
  ctx.lineWidth = 1 / currentScale; // Ajustar el ancho de línea para el zoom

  // Dibujar líneas de cuadrícula verticales
  for (let i = Math.floor(worldVisibleLeft); i <= Math.ceil(worldVisibleRight); i++) {
    ctx.beginPath();
    ctx.moveTo(i, worldVisibleTop);
    ctx.lineTo(i, worldVisibleBottom);
    ctx.stroke();
  }

  // Dibujar líneas de cuadrícula horizontales
  for (let j = Math.floor(worldVisibleTop); j <= Math.ceil(worldVisibleBottom); j++) {
    ctx.beginPath();
    ctx.moveTo(worldVisibleLeft, j);
    ctx.lineTo(worldVisibleRight, j);
    ctx.stroke();
  }
}

// Función para obtener un paso "bonito" para los números (movida fuera de drawGridNumbers)
function getAdaptiveNiceStep(currentScale, minPixelSpacing) {
  let worldUnitPerPixel = 1 / currentScale; // Cuántas unidades del mundo corresponden a 1 píxel
  let targetWorldStep = minPixelSpacing * worldUnitPerPixel; // El paso en unidades del mundo que daría el minPixelSpacing

  // Encontrar el número "bonito" más cercano (1, 2, 5, 10, 20, 50, 0.1, 0.2, 0.5, etc.) a targetWorldStep
  const powers = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  let bestStep = 1; // Valor por defecto

  for (let i = 0; i < powers.length; i++) {
    if (powers[i] >= targetWorldStep) {
      // Elegir la potencia actual o la anterior, la que esté más cerca de targetWorldStep
      if (i === 0) {
        bestStep = powers[i];
      } else {
        const diffCurrent = powers[i] - targetWorldStep;
        const diffPrevious = targetWorldStep - powers[i - 1];
        bestStep = (diffCurrent < diffPrevious) ? powers[i] : powers[i - 1];
      }
      break;
    }
  }
  return bestStep;
}

function drawGridNumbers() {
  const w = canvas.width;
  const h = canvas.height;

  // Calcular el rango visible en coordenadas del mundo
  const worldVisibleLeft = (-w / 2 - offsetX) / currentScale;
  const worldVisibleRight = (w / 2 - offsetX) / currentScale;
  const worldVisibleTop = (-h / 2 - offsetY) / currentScale;
  const worldVisibleBottom = (h / 2 - offsetY) / currentScale;

  // Números en los ejes
  ctx.fillStyle = '#FFF1D6';
  ctx.font = `14px Arial`; // Tamaño de fuente fijo en píxeles de pantalla

  // Espaciado mínimo para que los números no se amontonen (restauramos comportamiento anterior)
  const minPixelSpacingForNumbers = 60;
  const step = getAdaptiveNiceStep(currentScale, minPixelSpacingForNumbers);

  // Determinar la precisión para toFixed
  let precision = 0;
  if (step < 1) {
    precision = -Math.floor(Math.log10(step));
  }

  // Evitar problemas de acumulación de error flotante y el "-0"
  const EPS = 1e-10;
  const formatLabel = (value) => {
    const text = value.toFixed(precision);
    return text === '-0' ? '0' : text;
  };

  // Números del eje X
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  {
    const startIndexX = Math.ceil(worldVisibleLeft / step);
    const endIndexX = Math.floor(worldVisibleRight / step);
    for (let k = startIndexX; k <= endIndexX; k++) {
      const i = k * step;
      if (Math.abs(i) < EPS) continue; // omitir el 0
      const screenX = (i * currentScale) + (w / 2 + offsetX);
      const screenY = 5 + (h / 2 + offsetY);
      ctx.fillText(formatLabel(i), screenX, screenY);
    }
  }

  // Números del eje Y
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  {
    const startIndexY = Math.ceil(worldVisibleTop / step);
    const endIndexY = Math.floor(worldVisibleBottom / step);
    for (let k = startIndexY; k <= endIndexY; k++) {
      const j = k * step;
      if (Math.abs(j) < EPS) continue; // omitir el 0
      const screenX = 5 + (w / 2 + offsetX);
      const screenY = (j * currentScale) + (h / 2 + offsetY); // mundo->pantalla (sin invertir)
      // Mostrar positivos arriba y negativos abajo (convención matemática): etiqueta = -j
      ctx.fillText(formatLabel(-j), screenX, screenY);
    }
  }
}

function drawAxes() {
  const w = canvas.width;
  const h = canvas.height;

  // Calcular el rango visible en coordenadas del mundo
  const worldVisibleLeft = (-w / 2 - offsetX) / currentScale;
  const worldVisibleRight = (w / 2 - offsetX) / currentScale;
  const worldVisibleTop = (-h / 2 - offsetY) / currentScale;
  const worldVisibleBottom = (h / 2 - offsetY) / currentScale;

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2 / currentScale; // Ajustar el ancho de línea para el zoom

  // Eje X
  ctx.beginPath();
  ctx.moveTo(worldVisibleLeft, 0);
  ctx.lineTo(worldVisibleRight, 0);
  ctx.stroke();

  // Eje Y
  ctx.beginPath();
  ctx.moveTo(0, worldVisibleTop);
  ctx.lineTo(0, worldVisibleBottom);
  ctx.stroke();
}

function drawVector(vec, color, name) {
  // No se necesita currentScale, offsetX, offsetY aquí, ya que el canvas ya está transformado
  const x = vec.x;
  const y = -vec.y; // invertimos Y

  ctx.strokeStyle = color;
  ctx.lineWidth = 3 / currentScale; // Ajustar el ancho de línea para el zoom
  ctx.shadowColor = color;
  ctx.shadowBlur = 6 / currentScale; // Ajustar el desenfoque de sombra para el zoom

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(x, y);
  ctx.stroke();

  // punta
  const angle = Math.atan2(y, x);
  const head = 10 / currentScale; // Ajustar el tamaño de la punta de flecha para el zoom
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - head * Math.cos(angle - Math.PI / 6), y - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x - head * Math.cos(angle + Math.PI / 6), y - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // etiqueta
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFF1D6';
  ctx.font = `${10 / currentScale}px Arial`; // Ajustar el tamaño de fuente para el zoom
  ctx.fillText(name, x + 6 / currentScale, y - 6 / currentScale); // 6px de desplazamiento
}

function getModo(name) { return document.querySelector(`input[name="${name}"]:checked`).value; }

function redrawCanvas() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, w, h);

  ctx.save(); // Guardar el estado actual del canvas

  // Trasladar al centro del canvas, luego aplicar el desplazamiento
  ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
  // Aplicar la escala
  ctx.scale(currentScale, currentScale);

  drawGridLines(); // Dibuja las líneas de la cuadrícula
  drawAxes(); // Dibuja los ejes

  // Dibujar vectores
  if (currentA.x !== undefined) drawVector(currentA, '#D4AF37', 'A');
  if (currentB.x !== undefined) drawVector(currentB, '#BA8C3C', 'B');
  if (currentR.x !== undefined) drawVector(currentR, '#FFF1D6', 'R');

  ctx.restore(); // Restaurar el canvas a su estado original

  drawGridNumbers(); // Dibuja los números de la cuadrícula después de restaurar el contexto

  // Mostrar el nivel de zoom
  ctx.fillStyle = '#FFF1D6';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Zoom: ${currentScale.toFixed(2)}x`, 10, 10);
}

async function sumarVectores() {
  try {
    const modoA = getModo('modoA'); const modoB = getModo('modoB');
    const A = getVector(inputsA, modoA); const B = getVector(inputsB, modoB);
    const data = await postJSON('/api/vectores/suma', { A, B });
    panelRes.innerHTML = `
      <h4>Suma de Vectores</h4>
      <p>R = A + B</p>
      <p>Rₓ = ${Number(data.rectangular.x).toFixed(4)}, Rᵧ = ${Number(data.rectangular.y).toFixed(4)}</p>
      <p>|R| = ${Number(data.polar.magnitud).toFixed(4)}; θ = ${Number(data.polar.direccion).toFixed(2)}°</p>
    `;
    // convertir entradas a rect para dibujar
    const Arect = await convertirARect(A); const Brect = await convertirARect(B);

    currentA = Arect;
    currentB = Brect;
    currentR = data.rectangular;

    const allVectors = [currentA, currentB, currentR];
    const maxCoord = Math.max(...allVectors.map(v => Math.max(Math.abs(v.x), Math.abs(v.y))));
    currentScale = Math.min(20, Math.floor(canvas.width / 2 / (maxCoord + 1))); // +1 para margen
    offsetX = 0; // Reset offset on new calculation
    offsetY = 0; // Reset offset on new calculation

    redrawCanvas();
  } catch (err) { showMessage(panelRes, err.message); }
}

async function convertirARect(v) {
  if ('x' in v) return v;
  const conv = await postJSON('/api/vectores/convertir-polar-rectangular', { modo: 'polar', magnitud: v.magnitud, angulo: v.angulo });
  return { x: conv.x, y: conv.y };
}

async function productoPunto() {
  try {
    const A = getVector(inputsA, getModo('modoA')); const B = getVector(inputsB, getModo('modoB'));
    const data = await postJSON('/api/vectores/producto-punto', { A, B });
    panelRes.innerHTML = `
      <h4>Producto Punto</h4>
      <p>A · B = ${Number(data.producto_punto).toFixed(4)}</p>
      <p>Ángulo entre vectores: ${data.angulo !== null ? Number(data.angulo).toFixed(2) : 'indefinido'}°</p>
    `;
    const Arect = await convertirARect(A); const Brect = await convertirARect(B);

    currentA = Arect;
    currentB = Brect;
    currentR = {}; // Clear result vector for dot product

    const allVectors = [currentA, currentB];
    const maxCoord = Math.max(...allVectors.map(v => Math.max(Math.abs(v.x), Math.abs(v.y))));
    currentScale = Math.min(20, Math.floor(canvas.width / 2 / (maxCoord + 1)));
    offsetX = 0; // Reset offset on new calculation
    offsetY = 0; // Reset offset on new calculation

    redrawCanvas();
  } catch (err) { showMessage(panelRes, err.message); }
}

async function productoCruz() {
  try {
    const A = getVector(inputsA, getModo('modoA')); const B = getVector(inputsB, getModo('modoB'));
    const data = await postJSON('/api/vectores/producto-cruz', { A, B });
    panelRes.innerHTML = `
      <h4>Producto Cruz</h4>
      <p>A × B = ${Number(data.producto_cruz).toFixed(4)} k̂</p>
      <p>Área del paralelogramo: ${Math.abs(Number(data.producto_cruz)).toFixed(4)} unidades²</p>
    `;
    const Arect = await convertirARect(A); const Brect = await convertirARect(B);

    currentA = Arect;
    currentB = Brect;
    currentR = {}; // Clear result vector for cross product

    const allVectors = [currentA, currentB];
    const maxCoord = Math.max(...allVectors.map(v => Math.max(Math.abs(v.x), Math.abs(v.y))));
    currentScale = Math.min(20, Math.floor(canvas.width / 2 / (maxCoord + 1)));
    offsetX = 0; // Reset offset on new calculation
    offsetY = 0; // Reset offset on new calculation

    redrawCanvas();
  } catch (err) { showMessage(panelRes, err.message); }
}

document.getElementById('btnSumarV').addEventListener('click', sumarVectores);
document.getElementById('btnPunto').addEventListener('click', productoPunto);
document.getElementById('btnCruz').addEventListener('click', productoCruz);

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const zoomFactor = 1.1;

  // Posición del ratón relativa al canvas (no transformada)
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  // Convertir la posición del ratón a coordenadas del "mundo" antes del zoom
  const worldX = (mouseX - (canvas.width / 2 + offsetX)) / currentScale;
  const worldY = (mouseY - (canvas.height / 2 + offsetY)) / currentScale;

  const oldScale = currentScale;

  if (event.deltaY < 0) {
    currentScale *= zoomFactor; // Zoom in
  } else {
    currentScale /= zoomFactor; // Zoom out
  }

  // Limitar el zoom
  currentScale = Math.max(1, Math.min(100, currentScale));

  // Calcular el nuevo offset para mantener worldX, worldY bajo el ratón
  offsetX = mouseX - (canvas.width / 2 + worldX * currentScale);
  offsetY = mouseY - (canvas.height / 2 + worldY * currentScale);

  redrawCanvas();
});

canvas.addEventListener('mousedown', (event) => {
  if (event.button === 0) { // Botón izquierdo del ratón
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging) {
    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    offsetX += deltaX;
    offsetY += deltaY;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    redrawCanvas();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('mouseout', () => {
  isDragging = false;
});

// inicializar lienzo
redrawCanvas();
