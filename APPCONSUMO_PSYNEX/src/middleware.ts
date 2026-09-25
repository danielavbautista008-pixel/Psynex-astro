import { defineMiddleware } from "astro/middleware";
import { obtenerUsuario } from "./lib/auth";

const RUTAS_PROTEGIDAS: string[] = [];

export const onRequest = defineMiddleware(async (context, next) => {
  const esProtegida = RUTAS_PROTEGIDAS.some((r) =>
    context.url.pathname.startsWith(r)
  );

  if (esProtegida) {
    const usuario = await obtenerUsuario(context.request.headers.get("cookie") ?? undefined);
    if (!usuario) {
      return context.redirect("/login");
    }
    context.locals.usuario = usuario; // disponible en la página
  }

  return next();
});