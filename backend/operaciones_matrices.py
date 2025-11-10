import numpy as np


def validar_tamano_matriz(filas, columnas):
    if not (isinstance(filas, int) and isinstance(columnas, int)):
        return False, "El tamaño de las matrices debe ser un número entero"
    if filas <= 0 or columnas <= 0:
        return False, "El tamaño debe ser positivo"
    return True, None


def validar_suma(matrizA: np.ndarray, matrizB: np.ndarray):
    if matrizA.shape != matrizB.shape:
        return False, "Las matrices no se pueden sumar"
    return True, None


def validar_resta(matrizA: np.ndarray, matrizB: np.ndarray):
    if matrizA.shape != matrizB.shape:
        return False, "Las matrices no se pueden restar"
    return True, None


def validar_multiplicacion(matrizA: np.ndarray, matrizB: np.ndarray):
    if matrizA.shape[1] != matrizB.shape[0]:
        return False, "Las matrices no se pueden multiplicar"
    return True, None


def validar_matriz_cuadrada(matriz: np.ndarray):
    if matriz.shape[0] != matriz.shape[1]:
        return False, "La matriz debe ser cuadrada"
    return True, None


def validar_determinante(det: float):
    if abs(det) < 1e-12:
        return False, "El determinante es 0, la matriz no tiene inversa"
    return True, None


def suma(A: np.ndarray, B: np.ndarray):
    ok, err = validar_suma(A, B)
    if not ok:
        return None, err
    return A + B, None


def resta(A: np.ndarray, B: np.ndarray):
    ok, err = validar_resta(A, B)
    if not ok:
        return None, err
    return A - B, None


def multiplicacion(A: np.ndarray, B: np.ndarray):
    ok, err = validar_multiplicacion(A, B)
    if not ok:
        return None, err
    return A @ B, None


def determinante(M: np.ndarray):
    ok, err = validar_matriz_cuadrada(M)
    if not ok:
        return None, err
    det = float(np.linalg.det(M))
    return det, None


def inversa(M: np.ndarray):
    ok, err = validar_matriz_cuadrada(M)
    if not ok:
        return None, err
    det = float(np.linalg.det(M))
    ok_det, err_det = validar_determinante(det)
    if not ok_det:
        return None, err_det
    inv = np.linalg.inv(M)
    return inv, None

