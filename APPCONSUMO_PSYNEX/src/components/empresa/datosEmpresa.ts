// =====================================================================
// cambio: ARCHIVO NUEVO — postulaciones REALES de la empresa.
// Usa la ruta nueva de solo lectura (Deno):
//   GET /api/empresa/postulaciones
// Corre en el SERVIDOR de Astro (entre los --- de la vista Postulaciones).
// =====================================================================
import { apiGet } from "../../lib/api";

export interface DocumentoPostulacion {
  id: string;
  tipo: string;
  nombre: string;
  archivo: string;
  mime: string;
  bytes: number;
}

export interface Postulacion {
  id: string;
  estado: string;
  fecha: string;
  oferta: { id: string; titulo: string };
  psicologo: {
    usuarioId: string;
    perfilId: string | null;
    nombre: string;
    email: string;
    tieneFoto: boolean;
    fotoVersion: string;
  };
  respuestas: {
    telefono: string;
    ciudad: string;
    especialidad: string;
    experienciaAnos: number | null;
    perfilProfesional: string;
    cartaPresentacion: string;
  };
  documentos: DocumentoPostulacion[];
}

export async function cargarPostulaciones(cookie: string | null): Promise<Postulacion[]> {
  const datos = await apiGet<{ postulaciones: Postulacion[] }>(cookie, "/api/empresa/postulaciones");
  return datos?.postulaciones ?? [];
}

// Fecha corta en español: "20 oct 2026"
export const fechaEmpresa = (f: string | null | undefined) => {
  if (!f) return "—";
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" });
};
