import { postJSON, showMessage } from './main.js';

const inputsA = document.getElementById('inputsA');
const inputsB = document.getElementById('inputsB');
const panelRes = document.getElementById('resultadoVectores');
const canvas = document.getElementById('plano');
const ctx = canvas.getContext('2d');

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

function drawGrid() {
  const w = canvas.width, h = canvas.height; ctx.clearRect(0,0,w,h);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = 'rgba(212,175,55,0.3)'; ctx.lineWidth = 1;
  for (let i = 0; i <= w; i += 25) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
  for (let j = 0; j <= h; j += 25) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke(); }
  // Ejes
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.stroke();
}

function drawVector(vec, color, name) {
  // Escala automática simple (20 px por unidad)
  const scale = 20; const ox = canvas.width/2; const oy = canvas.height/2;
  const x = vec.x * scale; const y = -vec.y * scale; // invertimos Y
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.shadowColor = color; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + x, oy + y); ctx.stroke();
  // punta
  const angle = Math.atan2(y, x);
  const head = 10;
  ctx.beginPath();
  ctx.moveTo(ox + x, oy + y);
  ctx.lineTo(ox + x - head * Math.cos(angle - Math.PI/6), oy + y - head * Math.sin(angle - Math.PI/6));
  ctx.lineTo(ox + x - head * Math.cos(angle + Math.PI/6), oy + y - head * Math.sin(angle + Math.PI/6));
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  // etiqueta
  ctx.shadowBlur = 0; ctx.fillStyle = '#FFF1D6';
  ctx.fillText(name, ox + x + 6, oy + y - 6);
}

function getModo(name) { return document.querySelector(`input[name="${name}"]:checked`).value; }

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
    drawGrid();
    // convertir entradas a rect para dibujar
    const Arect = await convertirARect(A); const Brect = await convertirARect(B);
    drawVector(Arect, '#D4AF37', 'A');
    drawVector(Brect, '#BA8C3C', 'B');
    drawVector(data.rectangular, '#FFF1D6', 'R');
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
    drawGrid();
    const Arect = await convertirARect(A); const Brect = await convertirARect(B);
    drawVector(Arect, '#D4AF37', 'A');
    drawVector(Brect, '#BA8C3C', 'B');
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
    drawGrid();
    const Arect = await convertirARect(A); const Brect = await convertirARect(B);
    drawVector(Arect, '#D4AF37', 'A');
    drawVector(Brect, '#BA8C3C', 'B');
  } catch (err) { showMessage(panelRes, err.message); }
}

document.getElementById('btnSumarV').addEventListener('click', sumarVectores);
document.getElementById('btnPunto').addEventListener('click', productoPunto);
document.getElementById('btnCruz').addEventListener('click', productoCruz);

// inicializar lienzo
drawGrid();

