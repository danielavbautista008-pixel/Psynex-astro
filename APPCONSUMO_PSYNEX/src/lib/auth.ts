const API_URL = "http://localhost:8001";

export async function obtenerUsuario(cookieHeader: string | undefined) {
  if (!cookieHeader) return null;

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { cookie: cookieHeader }, // reenviamos la cookie tal cual llegó
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.usuario;
}