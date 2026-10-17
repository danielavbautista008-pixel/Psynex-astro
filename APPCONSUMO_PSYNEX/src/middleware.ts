import { defineMiddleware } from "astro/middleware";
import { obtenerUsuario } from "./lib/auth";

// ---------------------------------------------------------------------
// Protección de páginas por rol.
// Cada carpeta de /pages se asocia con los roles que pueden entrar.
// Las rutas se comparan en minúscula para que /Administrador y
// /administrador se traten igual.
// Lo que NO esté en esta lista es público (Inicio, Explorar, artículos...).
// ---------------------------------------------------------------------
const RUTAS_POR_ROL: Record<string, string[]> = {
  "/administrador": ["Admin"],
  "/psicologos": ["Psicologo"],
  "/empresa": ["Empresa"],
};

// Página de inicio de cada rol. Se usa cuando alguien entra a una
// sección que no le corresponde: en vez de un error, lo mandamos a la suya.
const INICIO_POR_ROL: Record<string, string> = {
  Admin: "/Administrador/inicio",
  Psicologo: "/Psicologos/Inicio",
  Empresa: "/Empresa/Inicio",
  Paciente: "/",
};

const RUTA_LOGIN = "/Inicio/login";

export const onRequest = defineMiddleware(async (context, next) => {
  const ruta = context.url.pathname.toLowerCase();

  // 1. ¿La página pertenece a una sección protegida?
  const prefijo = Object.keys(RUTAS_POR_ROL).find(
    (p) => ruta === p || ruta.startsWith(p + "/"),
  );

  // Si no está en la lista, es pública: se muestra sin revisar nada.
  if (!prefijo) return next();

  // 2. Le preguntamos al backend quién es el usuario, reenviando la
  //    cookie "token" que el navegador mandó con esta petición.
  const usuario = await obtenerUsuario(
    context.request.headers.get("cookie") ?? undefined,
  );

  // 3. Sin sesión (no hay cookie, token vencido o cuenta inactiva) -> login
  if (!usuario) return context.redirect(RUTA_LOGIN);

  // 4. Con sesión pero en una sección que no es de su rol -> a su inicio
  if (!RUTAS_POR_ROL[prefijo].includes(usuario.Rol)) {
    return context.redirect(INICIO_POR_ROL[usuario.Rol] ?? "/");
  }

  // 5. Todo bien: dejamos el usuario disponible en la página como
  //    Astro.locals.usuario (nombre, email, rol...) y la mostramos.
  context.locals.usuario = usuario;
  return next();
});
