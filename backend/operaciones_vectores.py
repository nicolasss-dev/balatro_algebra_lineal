import math


def grados_a_radianes(grados):
    return grados * math.pi / 180


def radianes_a_grados(radianes):
    return radianes * 180 / math.pi


def polar_a_rectangular(magnitud, angulo_grados):
    angulo_rad = grados_a_radianes(angulo_grados)
    x = magnitud * math.cos(angulo_rad)
    y = magnitud * math.sin(angulo_rad)
    return x, y


def rectangular_a_polar(x, y):
    magnitud = math.sqrt(x**2 + y**2)
    angulo_rad = math.atan2(y, x)
    angulo_grados = radianes_a_grados(angulo_rad)
    if angulo_grados < 0:
        angulo_grados += 360
    return magnitud, angulo_grados


def suma_vectores(A, B):
    Rx = A[0] + B[0]
    Ry = A[1] + B[1]
    magnitud, direccion = rectangular_a_polar(Rx, Ry)
    return (Rx, Ry), magnitud, direccion


def producto_punto(A, B):
    return A[0] * B[0] + A[1] * B[1]


def angulo_entre_vectores(A, B):
    dot = producto_punto(A, B)
    mag_A = math.sqrt(A[0]**2 + A[1]**2)
    mag_B = math.sqrt(B[0]**2 + B[1]**2)
    if mag_A == 0 or mag_B == 0:
        return None  # ángulo indefinido
    cos_theta = dot / (mag_A * mag_B)
    cos_theta = max(-1, min(1, cos_theta))
    angulo_rad = math.acos(cos_theta)
    return radianes_a_grados(angulo_rad)


def producto_cruz(A, B):
    return A[0] * B[1] - A[1] * B[0]

