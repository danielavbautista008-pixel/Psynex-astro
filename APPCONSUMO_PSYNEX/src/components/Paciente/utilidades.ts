// =====================================================================
// Ayudas del panel del paciente (se usan en el navegador).
// =====================================================================

// Aviso flotante pequeño abajo en el centro ("Guardado", "Copiado"...)
let temporizador: ReturnType<typeof setTimeout> | undefined;
export function avisar(mensaje: string) {
  let toast = document.getElementById("pacToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "pacToast";
    toast.className = "pac-toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add("visible");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => toast?.classList.remove("visible"), 2600);
}

// Abrir / cerrar las ventanitas (.pac-modal)
export function abrirModal(id: string) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = false;
}

export function prepararModales() {
  document.querySelectorAll<HTMLElement>("[data-cerrar-modal]").forEach((b) =>
    b.addEventListener("click", () => {
      const modal = b.closest<HTMLElement>(".pac-modal");
      if (modal) modal.hidden = true;
    })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll<HTMLElement>(".pac-modal").forEach((m) => (m.hidden = true));
  });
}

// ---------------------------------------------------------------------
// Beneficio empresarial (código de la empresa) — DATOS DE PRUEBA.
// Por ahora se guarda en este navegador. Cuando exista la ruta del
// backend (el trabajador usa el código), aquí se cambia por la API.
// ---------------------------------------------------------------------
export interface Beneficio {
  codigo: string;
  empresa: string;
  sesionesTotales: number;
  sesionesUsadas: number;
  vence: string; // AAAA-MM-DD
}

const CLAVE_BENEFICIO = "psynex:beneficio-paciente";

// Códigos de prueba (el primero es el de la empresa de prueba de la base de datos)
const CODIGOS_PRUEBA: Record<string, Omit<Beneficio, "codigo">> = {
  "ESAS-7K3P": { empresa: "Empresa S.A.S", sesionesTotales: 4, sesionesUsadas: 1, vence: "2027-01-18" },
  "SALU-7K3P": { empresa: "Salud Vital S.A.S.", sesionesTotales: 6, sesionesUsadas: 0, vence: "2027-03-30" },
};

export const formatoCodigo = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function leerBeneficio(): Beneficio | null {
  try {
    const b = JSON.parse(localStorage.getItem(CLAVE_BENEFICIO) || "null");
    return b && b.codigo ? b : null;
  } catch {
    return null;
  }
}

export function activarCodigo(codigoEscrito: string): { ok: true; beneficio: Beneficio } | { ok: false; error: string } {
  const codigo = codigoEscrito.trim().toUpperCase();
  if (!formatoCodigo.test(codigo)) {
    return { ok: false, error: "El código tiene 8 caracteres separados por un guion, por ejemplo ESAS-7K3P." };
  }
  const datos = CODIGOS_PRUEBA[codigo];
  if (!datos) return { ok: false, error: "Ese código no existe o ya venció. Revísalo con tu empresa." };
  const beneficio = { codigo, ...datos };
  try { localStorage.setItem(CLAVE_BENEFICIO, JSON.stringify(beneficio)); } catch { /* nada */ }
  return { ok: true, beneficio };
}

export function quitarBeneficio() {
  try { localStorage.removeItem(CLAVE_BENEFICIO); } catch { /* nada */ }
}

export const fechaBonita = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
