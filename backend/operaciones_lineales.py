import numpy as np


def validar_sistema_cuadrado(n_ecuaciones: int, n_variables: int):
    if n_ecuaciones != n_variables:
        return False, "Introduzca un sistema de ecuaciones cuadrado"
    return True, None


def resolver_cramer(A: np.ndarray, b: np.ndarray):
    det_A = float(np.linalg.det(A))
    if abs(det_A) < 1e-10:
        return None, "El sistema de ecuaciones no tiene solución |A| = 0"

    soluciones = []
    for i in range(len(b)):
        A_i = A.copy()
        A_i[:, i] = b
        det_Ai = float(np.linalg.det(A_i))
        soluciones.append(det_Ai / det_A)

    return soluciones, None


def resolver_inversa(A: np.ndarray, b: np.ndarray):
    det_A = float(np.linalg.det(A))
    if abs(det_A) < 1e-10:
        return None, None, "El sistema de ecuaciones no tiene solución |A| = 0 y la matriz A no tiene inversa"

    A_inv = np.linalg.inv(A)
    solucion = A_inv @ b
    return solucion, A_inv, None

