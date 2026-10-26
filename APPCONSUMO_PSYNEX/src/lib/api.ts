// ---------------------------------------------------------------------
// Ayudas para hablar con el backend (Deno) desde Astro.
//
// apiGet se usa en la parte de arriba de los componentes (entre los ---),
// que se ejecuta en el SERVIDOR de Astro antes de mandar la página.
// Por eso hay que reenviar a mano la cookie "token" que trajo el navegador:
// así el backend sabe qué usuario está pidiendo los datos.
// ---------------------------------------------------------------------

// cambio: MODO TÚNEL (npm run dev:tunel). En ese modo API_URL queda vacío
// ("") y el navegador llama al backend por la MISMA dirección de la página
// (/api/...): Astro lo reenvía a Deno (ver astro.config.mjs). Así todo
// funciona con un solo enlace de Cloudflare, desde un celular u otro
// computador. Con "npm run dev" normal no cambia nada.
export const API_URL: string = import.meta.env.MODE === "tunel"
  ? ""
  : (import.meta.env.PUBLIC_API_URL ?? "http://localhost:8001");

// Desde el SERVIDOR de Astro siempre se llama directo a Deno
export const API_SERVIDOR = API_URL || "http://localhost:8001";

// Pide datos al backend. Devuelve el JSON, o null si algo falla
// (backend apagado, sesión vencida, error 500...). Así la página nunca
// se cae: simplemente se muestra sin esos datos.
export async function apiGet<T = any>(
  cookie: string | null | undefined,
  ruta: string,
): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.SSR ? API_SERVIDOR : API_URL}${ruta}`, {
      headers: cookie ? { cookie } : {},
    });
    if (!res.ok) {
      console.error(`apiGet ${ruta} respondió ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`apiGet ${ruta} no pudo conectarse:`, error);
    return null;
  }
}

// ---------------------- Formatos para mostrar ----------------------
// Todo en hora de Colombia, sin importar dónde corra el servidor.
const ZONA = "America/Bogota";

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "Martes 15 de octubre"
export const fechaLarga = (f: string | Date) =>
  mayuscula(
    new Date(f)
      .toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: ZONA })
      .replace(",", ""),
  );

// "30 Sep"
export const fechaCorta = (f: string | Date) => {
  const d = new Date(f);
  const dia = d.toLocaleDateString("es-CO", { day: "numeric", timeZone: ZONA });
  const mes = d.toLocaleDateString("es-CO", { month: "short", timeZone: ZONA }).replace(".", "");
  return `${dia} ${mayuscula(mes)}`;
};

// "14:30"
export const hora = (f: string | Date) =>
  new Date(f).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA });

// "Virtual" -> "Consulta virtual"
export const textoModalidad = (m: string | null | undefined) =>
  `Consulta ${(m ?? "virtual").toLowerCase()}`;

// Edad a partir de la fecha de nacimiento
export const edad = (f: string | Date | null | undefined) => {
  if (!f) return null;
  const n = new Date(f);
  const hoy = new Date();
  let e = hoy.getFullYear() - n.getFullYear();
  const m = hoy.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) e--;
  return e;
};

// Foto por defecto: un círculo con las iniciales (no depende de archivos).
export const fotoIniciales = (nombre: string) => {
  const ini = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='#e6ece8'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='30' fill='#4a5d52'>${ini}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// ---------------------- Para las vistas públicas (Explorar) ----------------------

// 80000 -> "$80.000"
export const pesos = (valor: number | null | undefined) =>
  valor === null || valor === undefined
    ? ""
    : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
        .format(valor)
        .replace(/\s/g, "");

// Fecha -> "Hoy", "Hace 3 días", "Hace 2 semanas"...
export const haceCuanto = (f: string | Date | null | undefined) => {
  if (!f) return "";
  const dias = Math.floor((Date.now() - new Date(f).getTime()) / 86_400_000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semana${dias < 14 ? "" : "s"}`;
  if (dias < 365) return `Hace ${Math.floor(dias / 30)} mes${dias < 60 ? "" : "es"}`;
  return `Hace ${Math.floor(dias / 365)} año${dias < 730 ? "" : "s"}`;
};

// Las fotos y logos se guardan en la base de datos; el backend las entrega
// como imagen en estas rutas (así la página no carga textos gigantes).
// cambio: "version" va en la URL; cuando el psicólogo cambia la foto, la URL
// cambia y el navegador baja la nueva en vez de mostrar la vieja de su caché.
export const urlFotoPsicologo = (id: string, version?: string | number | null) =>
  `${API_URL}/api/explorar/psicologos/${id}/foto${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
export const urlLogoEmpresa = (id: string) => `${API_URL}/api/explorar/empresas/${id}/logo`;

// Minutos de lectura aproximados a partir de la cantidad de caracteres
export const minutosLectura = (caracteres: number | null | undefined) =>
  `${Math.max(1, Math.round(Number(caracteres ?? 0) / 1200))} min de lectura`;

// Envía datos al backend DESDE EL NAVEGADOR (en los <script> de las vistas).
// credentials: "include" hace que viaje la cookie "token" de la sesión.
// Nunca lanza error: devuelve { ok, status, data }.
export async function apiEnviar<T = any>(
  metodo: "POST" | "PUT" | "PATCH" | "DELETE",
  ruta: string,
  cuerpo?: unknown,
): Promise<{ ok: boolean; status: number; data: T | any }> {
  try {
    const esFormulario = cuerpo instanceof FormData;
    const res = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      credentials: "include",
      headers: esFormulario || cuerpo === undefined ? {} : { "Content-Type": "application/json" },
      body: esFormulario ? (cuerpo as FormData) : cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "No se pudo conectar con el servidor" } };
  }
}

// El backend responde los errores como texto o como lista de textos
export const textoError = (data: any, porDefecto = "Ocurrió un error, intenta de nuevo") =>
  Array.isArray(data?.error) ? data.error.join(". ") : (data?.error ?? data?.mensaje ?? porDefecto);

// Imagen de portada de un cuestionario (la sube el admin)
export const urlImagenCuestionario = (id: string) => `${API_URL}/api/explorar/cuestionarios/${id}/imagen`;

// Imagen por defecto de un cuestionario según su categoría (las que ya
// usaba la página de Tests), cuando el admin todavía no le sube foto.
const IMAGENES_CUESTIONARIO: Record<string, string> = {
  ansiedad: "/Imagenes/imagen3.jpeg",
  depresion: "/Imagenes/imagen3.jpeg",
  estres: "/Imagenes/imagen3.jpeg",
  sueno: "/Imagenes/fondo.jpeg",
  "consumo de sustancias": "/Imagenes/fondo.jpeg",
  "burnout laboral": "/Imagenes/fondo.jpeg",
  "trauma y estres postraumatico": "/Imagenes/hero.jpeg",
};

export const imagenCuestionario = (c: { id: string; categoria: string; tieneImagen: boolean }) =>
  c.tieneImagen
    ? urlImagenCuestionario(c.id)
    : IMAGENES_CUESTIONARIO[
        c.categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
      ] ?? "/Imagenes/imagen.explora.jpg";


// Portada de un artículo del blog. ImagenPortada guarda la ruta del archivo
// subido (./uploads/blog/...) y se sirve en /api/blog/:id/imagen; si es un
// enlace (http... o /Imagenes/...) se usa tal cual. null = sin portada.
export const urlImagenBlog = (id: string, imagenPortada: string | null | undefined): string | null => {
  if (!imagenPortada) return null;
  if (imagenPortada.startsWith("./uploads/")) {
    // ?v= cambia con cada imagen nueva, así el navegador no muestra la vieja
    const v = imagenPortada.split("/").pop() ?? "";
    return `${API_URL}/api/blog/${id}/imagen?v=${encodeURIComponent(v)}`;
  }
  return imagenPortada;
};
