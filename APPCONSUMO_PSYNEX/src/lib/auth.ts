const API_URL = "http://localhost:8001";

// Pregunta al backend (GET /api/auth/me) quién es el usuario dueño de la cookie.
// Devuelve el usuario (sin contraseña) o null si no hay sesión válida.
export async function obtenerUsuario(cookieHeader: string | undefined) {
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader }, // reenviamos la cookie tal cual llegó
    });

    if (!res.ok) return null; // 401: token inválido, vencido o cuenta inactiva
    const data = await res.json();
    return data.usuario ?? null;
  } catch (error) {
    // Si el backend está apagado o no responde, no rompemos la página:
    // tratamos al usuario como "sin sesión" y el middleware lo manda al login.
    console.error("No se pudo consultar /api/auth/me:", error);
    return null;
  }
}
