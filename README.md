# Calculadora de Matrices y Vectores - Estilo Balatro

Aplicación web con estética casino/Balatro para operaciones con matrices, sistemas lineales y vectores. Backend en Flask + NumPy y frontend HTML/CSS/JS vanilla.

## Requisitos

- Python 3.8+
- pip

## Instalación

```bash
# En la raíz del proyecto
pip install -r backend/requirements.txt
```

## Ejecución

```bash
python backend/main.py
```

El servidor arranca en `http://127.0.0.1:5000/` y sirve el frontend junto con los endpoints `/api/...`.

## Estructura

```
proyecto-calculadora/
├── backend/
│   ├── main.py
│   ├── operaciones_matrices.py
│   ├── operaciones_vectores.py
│   ├── operaciones_lineales.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js
│       ├── matrices.js
│       ├── lineales.js
│       └── vectores.js
└── README.md
```

## Endpoints principales

- `POST /api/matrices/suma` `{A, B}`
- `POST /api/matrices/resta` `{A, B}`
- `POST /api/matrices/multiplicacion` `{A, B}`
- `POST /api/matrices/determinante` `{A, B?}`
- `POST /api/matrices/inversa` `{A, B?}`
- `POST /api/ecuaciones/cramer` `{A, b}`
- `POST /api/ecuaciones/inversa` `{A, b}`
- `POST /api/vectores/suma` `{A, B}` admite `{x,y}` o `{magnitud,angulo}`
- `POST /api/vectores/producto-punto` `{A, B}`
- `POST /api/vectores/producto-cruz` `{A, B}`
- `POST /api/vectores/convertir-polar-rectangular` `{modo:'polar'|'rectangular', ...}`

## Notas de diseño

- Paleta vinotinto/dorado, tipografía retro (Press Start 2P/VT323).
- Animaciones: fade-in, hover brillante, flip card en resultados.
- Accesibilidad: foco visible, `aria-live` en paneles de resultados.
- Responsive con breakpoints para tablet/móvil.

## Próximos pasos sugeridos

- Agregar sonidos con WebAudio y chip-click.
- Mejorar validaciones en UI y tooltips.
- Plano cartesiano interactivo (drag de puntas de vectores).

