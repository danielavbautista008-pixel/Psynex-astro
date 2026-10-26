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

// cambio: se quitó el código de prueba del beneficio (ahora es real, ver CodigoEmpresa.astro)

// "2027-01-19" -> "19 de enero de 2027"
export const fechaBonita = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
