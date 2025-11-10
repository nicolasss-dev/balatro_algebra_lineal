import { postJSON, createTableFromMatrix, showMessage } from './main.js';

const sistemaInputs = document.getElementById('sistemaInputs');
const resultados = document.getElementById('resultadosLineales');

function generarSistema(n) {
  // Crea inputs para matriz A (n x n) y vector b (n)
  const cont = document.createElement('div');
  const tablaA = document.createElement('table');
  for (let i = 0; i < n; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < n; j++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number'; inp.step = 'any'; inp.style.width = '50px';
      td.appendChild(inp);
      tr.appendChild(td);
    }
    tablaA.appendChild(tr);
  }
  const vectorB = document.createElement('div');
  for (let i = 0; i < n; i++) {
    const inp = document.createElement('input');
    inp.type = 'number'; inp.step = 'any'; inp.style.width = '50px';
    vectorB.appendChild(inp);
  }
  cont.appendChild(document.createTextNode('Matriz de coeficientes A'));
  cont.appendChild(tablaA);
  cont.appendChild(document.createElement('hr'));
  cont.appendChild(document.createTextNode('Vector de términos independientes b'));
  cont.appendChild(vectorB);
  sistemaInputs.innerHTML = '';
  sistemaInputs.appendChild(cont);
}

function leerSistema() {
  const tabla = sistemaInputs.querySelector('table');
  const bs = sistemaInputs.querySelectorAll('div > input');
  if (!tabla || bs.length === 0) return null;
  const A = Array.from(tabla.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('input')).map(inp => Number(inp.value || 0)));
  const b = Array.from(bs).map(inp => Number(inp.value || 0));
  return { A, b };
}

document.getElementById('genSistema').addEventListener('click', () => {
  const n = parseInt(document.getElementById('tamLinea').value, 10);
  generarSistema(n);
});

async function resolverCramer() {
  try {
    const datos = leerSistema();
    if (!datos) throw new Error('Genere el sistema primero');
    const data = await postJSON('/api/ecuaciones/cramer', datos);
    resultados.innerHTML = '';
    resultados.insertAdjacentHTML('beforeend', '<h4>Matriz A</h4>');
    resultados.appendChild(createTableFromMatrix(data.A));
    resultados.insertAdjacentHTML('beforeend', `<p>Determinante |A| = ${Number(data.detA).toFixed(6)}</p>`);
    data.A_vars.forEach((Ai, idx) => {
      resultados.insertAdjacentHTML('beforeend', `<h4>Matriz A${idx}</h4>`);
      resultados.appendChild(createTableFromMatrix(Ai));
    });
    resultados.insertAdjacentHTML('beforeend', `<p>Soluciones: ${data.soluciones.map(v => Number(v).toFixed(6)).join(', ')}</p>`);
  } catch (err) { showMessage(resultados, err.message); }
}

async function resolverInversa() {
  try {
    const datos = leerSistema();
    if (!datos) throw new Error('Genere el sistema primero');
    const data = await postJSON('/api/ecuaciones/inversa', datos);
    resultados.innerHTML = '';
    resultados.insertAdjacentHTML('beforeend', '<h4>Matriz A</h4>');
    resultados.appendChild(createTableFromMatrix(data.A));
    resultados.insertAdjacentHTML('beforeend', `<p>Determinante |A| = ${Number(data.detA).toFixed(6)}</p>`);
    resultados.insertAdjacentHTML('beforeend', '<h4>Matriz Inversa A⁻¹</h4>');
    resultados.appendChild(createTableFromMatrix(data.A_inv));
    resultados.insertAdjacentHTML('beforeend', `<p>Solución X = A⁻¹ × b : ${data.solucion.map(v => Number(v).toFixed(6)).join(', ')}</p>`);
  } catch (err) { showMessage(resultados, err.message); }
}

document.getElementById('btnCramer').addEventListener('click', resolverCramer);
document.getElementById('btnInversa').addEventListener('click', resolverInversa);

// Generar uno por defecto
generarSistema(3);

