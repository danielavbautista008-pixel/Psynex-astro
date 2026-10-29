// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// cambio: MODO TÚNEL (Cloudflare) para usar Psynex desde un celular u otro
// computador con UN solo enlace. Astro (puerto 4321) reenvía al backend
// Deno (puerto 8001) todo lo que empiece por estas rutas, incluido el
// WebSocket del chat y de la videollamada. En el uso normal (localhost)
// no cambia nada.
const DENO = 'http://localhost:8001';
const RUTAS_DEL_BACKEND = [
  '/api',
  // rutas del backend que no empiezan por /api (admin y empresa)
  '/cuestionarios', '/categorias', '/estadisticas', '/usuarios', '/resumen',
  '/postulaciones', '/perfilempresa', '/ofertaslaborales', '/notificaciones',
];

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    server: {
      // deja entrar los enlaces de Cloudflare (https://algo.trycloudflare.com)
      allowedHosts: ['.trycloudflare.com'],
      proxy: Object.fromEntries(
        RUTAS_DEL_BACKEND.map((ruta) => [ruta, { target: DENO, ws: ruta === '/api' }]),
      ),
    },
  },
});
