from flask import Flask, request, jsonify, send_from_directory
import numpy as np
import os

# Importaciones compatibles con ejecución como paquete (Vercel) y script local
try:
    from .operaciones_matrices import (
        suma as suma_matrices,
        resta as resta_matrices,
        multiplicacion as multiplicacion_matrices,
        determinante as det_matriz,
        inversa as inv_matriz,
    )
    from .operaciones_lineales import resolver_cramer, resolver_inversa
    from .operaciones_vectores import (
        polar_a_rectangular,
        rectangular_a_polar,
        suma_vectores,
        producto_punto,
        angulo_entre_vectores,
        producto_cruz,
    )
except ImportError:  # fallback para ejecución directa local
    from operaciones_matrices import (
        suma as suma_matrices,
        resta as resta_matrices,
        multiplicacion as multiplicacion_matrices,
        determinante as det_matriz,
        inversa as inv_matriz,
    )
    from operaciones_lineales import resolver_cramer, resolver_inversa
    from operaciones_vectores import (
        polar_a_rectangular,
        rectangular_a_polar,
        suma_vectores,
        producto_punto,
        angulo_entre_vectores,
        producto_cruz,
    )


<<<<<<< HEAD
# Servimos el frontend como estáticos desde ../frontend (ruta absoluta)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
=======
# Servimos el frontend como estáticos desde ../frontend
app = Flask(__name__, static_folder="../frontend", static_url_path="")
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
>>>>>>> jenifel


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


def _to_numpy(matriz_list):
    try:
        arr = np.array(matriz_list, dtype=float)
        return arr
    except Exception:
        return None


@app.post("/api/matrices/suma")
def api_matrices_suma():
    data = request.get_json(force=True)
    A = _to_numpy(data.get("A"))
    B = _to_numpy(data.get("B"))
    if A is None or B is None:
        return jsonify({"error": "Entrada inválida"}), 400
    res, err = suma_matrices(A, B)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"resultado": res.tolist()})


@app.post("/api/matrices/resta")
def api_matrices_resta():
    data = request.get_json(force=True)
    A = _to_numpy(data.get("A"))
    B = _to_numpy(data.get("B"))
    if A is None or B is None:
        return jsonify({"error": "Entrada inválida"}), 400
    res, err = resta_matrices(A, B)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"resultado": res.tolist()})


@app.post("/api/matrices/multiplicacion")
def api_matrices_multiplicacion():
    data = request.get_json(force=True)
    A = _to_numpy(data.get("A"))
    B = _to_numpy(data.get("B"))
    if A is None or B is None:
        return jsonify({"error": "Entrada inválida"}), 400
    res, err = multiplicacion_matrices(A, B)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"resultado": res.tolist()})


@app.post("/api/matrices/determinante")
def api_matrices_determinante():
    data = request.get_json(force=True)
    A = data.get("A")
    B = data.get("B")
    out = {}
    if A is not None:
        A_np = _to_numpy(A)
        detA, errA = det_matriz(A_np)
        if errA:
            return jsonify({"error": f"A: {errA}"}), 400
        out["detA"] = detA
    if B is not None:
        B_np = _to_numpy(B)
        detB, errB = det_matriz(B_np)
        if errB:
            return jsonify({"error": f"B: {errB}"}), 400
        out["detB"] = detB
    return jsonify(out)


@app.post("/api/matrices/inversa")
def api_matrices_inversa():
    data = request.get_json(force=True)
    A = data.get("A")
    B = data.get("B")
    out = {}
    if A is not None:
        A_np = _to_numpy(A)
        invA, errA = inv_matriz(A_np)
        if errA:
            return jsonify({"error": f"A: {errA}"}), 400
        out["invA"] = invA.tolist()
    if B is not None:
        B_np = _to_numpy(B)
        invB, errB = inv_matriz(B_np)
        if errB:
            return jsonify({"error": f"B: {errB}"}), 400
        out["invB"] = invB.tolist()
    return jsonify(out)


@app.post("/api/ecuaciones/cramer")
def api_ecuaciones_cramer():
    data = request.get_json(force=True)
    A = _to_numpy(data.get("A"))
    b = _to_numpy(data.get("b"))
    if A is None or b is None:
        return jsonify({"error": "Entrada inválida"}), 400
    if A.shape[0] != A.shape[1] or A.shape[0] != b.shape[0]:
        return jsonify({"error": "Introduzca un sistema de ecuaciones cuadrado"}), 400
    soluciones, err = resolver_cramer(A, b)
    if err:
        return jsonify({"error": err}), 400
    # Construimos matrices Ax, Ay, Az para visualización opcional
    Ax_list = []
    for i in range(len(b)):
        Ai = A.copy()
        Ai[:, i] = b
        Ax_list.append(Ai.tolist())
    return jsonify({
        "A": A.tolist(),
        "b": b.tolist(),
        "detA": float(np.linalg.det(A)),
        "A_vars": Ax_list,
        "soluciones": soluciones,
    })


@app.post("/api/ecuaciones/inversa")
def api_ecuaciones_inversa():
    data = request.get_json(force=True)
    A = _to_numpy(data.get("A"))
    b = _to_numpy(data.get("b"))
    if A is None or b is None:
        return jsonify({"error": "Entrada inválida"}), 400
    if A.shape[0] != A.shape[1] or A.shape[0] != b.shape[0]:
        return jsonify({"error": "Introduzca un sistema de ecuaciones cuadrado"}), 400
    solucion, A_inv, err = resolver_inversa(A, b)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({
        "A": A.tolist(),
        "detA": float(np.linalg.det(A)),
        "A_inv": A_inv.tolist(),
        "solucion": solucion.tolist(),
    })


@app.post("/api/vectores/convertir-polar-rectangular")
def api_vectores_convertir():
    data = request.get_json(force=True)
    modo = data.get("modo")
    if modo == "polar":
        magnitud = float(data.get("magnitud", 0))
        angulo = float(data.get("angulo", 0))
        x, y = polar_a_rectangular(magnitud, angulo)
        return jsonify({"x": x, "y": y})
    elif modo == "rectangular":
        x = float(data.get("x", 0))
        y = float(data.get("y", 0))
        mag, dir_deg = rectangular_a_polar(x, y)
        return jsonify({"magnitud": mag, "direccion": dir_deg})
    else:
        return jsonify({"error": "Modo inválido"}), 400


def _parse_vector(obj):
    # admite {"x": .., "y": ..} o {"magnitud": .., "angulo": ..}
    if obj is None:
        return None
    if "x" in obj and "y" in obj:
        return float(obj["x"]), float(obj["y"])  # rectangular
    elif "magnitud" in obj and "angulo" in obj:
        x, y = polar_a_rectangular(float(obj["magnitud"]), float(obj["angulo"]))
        return x, y
    return None


@app.post("/api/vectores/suma")
def api_vectores_suma():
    data = request.get_json(force=True)
    A = _parse_vector(data.get("A"))
    B = _parse_vector(data.get("B"))
    if A is None or B is None:
        return jsonify({"error": "Entrada inválida"}), 400
    (Rx, Ry), mag, dir_deg = suma_vectores(A, B)
    return jsonify({
        "rectangular": {"x": Rx, "y": Ry},
        "polar": {"magnitud": mag, "direccion": dir_deg},
    })


@app.post("/api/vectores/producto-punto")
def api_vectores_producto_punto():
    data = request.get_json(force=True)
    A = _parse_vector(data.get("A"))
    B = _parse_vector(data.get("B"))
    if A is None or B is None:
        return jsonify({"error": "Entrada inválida"}), 400
    dot = producto_punto(A, B)
    ang = angulo_entre_vectores(A, B)
    return jsonify({"producto_punto": dot, "angulo": ang})


@app.post("/api/vectores/producto-cruz")
def api_vectores_producto_cruz():
    data = request.get_json(force=True)
    A = _parse_vector(data.get("A"))
    B = _parse_vector(data.get("B"))
    if A is None or B is None:
        return jsonify({"error": "Entrada inválida"}), 400
    cruz = producto_cruz(A, B)
    return jsonify({"producto_cruz": cruz})


if __name__ == "__main__":
    # Ejecutar en desarrollo
    app.run(host="127.0.0.1", port=5000, debug=True)
