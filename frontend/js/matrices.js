import { postJSON, createTableFromMatrix, showMessage } from './main.js';

const tablaA = document.getElementById('tablaA');
const tablaB = document.getElementById('tablaB');
const resultado = document.getElementById('resultadoMatrices');

function generarTabla(target, filas, cols) {
  const table = document.createElement('table');
  for (let i = 0; i < filas; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.step = 'any';
      inp.className = 'input-matriz';
      td.appendChild(inp);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  target.innerHTML = '';
  target.appendChild(table);
}

function leerMatriz(target) {
  const rows = Array.from(target.querySelectorAll('tr'));
  if (rows.length === 0) return null;
  const data = rows.map(tr => Array.from(tr.querySelectorAll('input')).map(inp => Number(inp.value || 0)));
  return data;
}

document.getElementById('genA').addEventListener('click', () => {
  const filas = parseInt(document.getElementById('filasA').value, 10);
  const cols = parseInt(document.getElementById('colsA').value, 10);
  if (!Number.isInteger(filas) || !Number.isInteger(cols)) {
    showMessage(resultado, 'El tamaño de las matrices debe ser un número entero');
    return;
  }
  generarTabla(tablaA, filas, cols);
});

document.getElementById('genB').addEventListener('click', () => {
  const filas = parseInt(document.getElementById('filasB').value, 10);
  const cols = parseInt(document.getElementById('colsB').value, 10);
  if (!Number.isInteger(filas) || !Number.isInteger(cols)) {
    showMessage(resultado, 'El tamaño de las matrices debe ser un número entero');
    return;
  }
  generarTabla(tablaB, filas, cols);
});

function flip() { resultado.classList.add('flip'); setTimeout(() => resultado.classList.remove('flip'), 800); }

async function operar(path) {
  try {
    const A = leerMatriz(tablaA);
    const B = leerMatriz(tablaB);
    if (!A) throw new Error('Genere y llene la matriz A');
    if ((path !== '/api/matrices/determinante' && path !== '/api/matrices/inversa') && !B) throw new Error('Genere y llene la matriz B');
    const payload = { A, B };
    const data = await postJSON(path, payload);
    // Render
    resultado.innerHTML = '';
    if (data.resultado) {
      resultado.appendChild(createTableFromMatrix(data.resultado));
      resultado.insertAdjacentHTML('beforeend', '<p>Resultado de operación</p>');
    } else if (data.detA !== undefined || data.detB !== undefined) {
      const list = document.createElement('div');
      if (data.detA !== undefined) list.insertAdjacentHTML('beforeend', `<p>Determinante det(A) = ${Number(data.detA).toFixed(6)}</p>`);
      if (data.detB !== undefined) list.insertAdjacentHTML('beforeend', `<p>Determinante det(B) = ${Number(data.detB).toFixed(6)}</p>`);
      resultado.appendChild(list);
    } else if (data.invA || data.invB) {
      if (data.invA) {
        resultado.insertAdjacentHTML('beforeend', '<h4>Inversa A⁻¹</h4>');
        resultado.appendChild(createTableFromMatrix(data.invA));
      }
      if (data.invB) {
        resultado.insertAdjacentHTML('beforeend', '<h4>Inversa B⁻¹</h4>');
        resultado.appendChild(createTableFromMatrix(data.invB));
      }
    }
    flip();
  } catch (err) {
    showMessage(resultado, err.message);
  }
}

document.getElementById('opSuma').addEventListener('click', () => operar('/api/matrices/suma'));
document.getElementById('opResta').addEventListener('click', () => operar('/api/matrices/resta'));
document.getElementById('opMult').addEventListener('click', () => operar('/api/matrices/multiplicacion'));
document.getElementById('opDet').addEventListener('click', () => operar('/api/matrices/determinante'));
document.getElementById('opInv').addEventListener('click', () => operar('/api/matrices/inversa'));

