import Swal from "sweetalert2";

/**
 * Toast flotante animado para notificaciones de éxito o error
 */
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  background: "rgba(18, 20, 28, 0.95)",
  color: "#f8fafc",
  customClass: {
    popup: "dark-swal-toast",
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const showSuccessToast = (title) => {
  return Toast.fire({
    icon: "success",
    title: title || "Operación realizada con éxito",
    iconColor: "#10b981",
  });
};

export const showErrorToast = (title) => {
  return Toast.fire({
    icon: "error",
    title: title || "Ocurrió un error inesperado",
    iconColor: "#ef4444",
  });
};

export const showInfoToast = (title) => {
  return Toast.fire({
    icon: "info",
    title: title || "Información",
    iconColor: "#38bdf8",
  });
};

/**
 * Modal de confirmación Dark Industrial de alto impacto
 */
export const showConfirmAlert = async ({
  title = "¿Estás seguro?",
  text = "Esta acción no se puede deshacer.",
  icon = "warning",
  confirmButtonText = "Sí, confirmar",
  cancelButtonText = "Cancelar",
  confirmButtonColor = "#f59e0b",
  danger = false,
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: danger ? "#dc2626" : confirmButtonColor,
    cancelButtonColor: "rgba(255, 255, 255, 0.12)",
    confirmButtonText,
    cancelButtonText,
    background: "#161822",
    color: "#f8fafc",
    backdrop: "rgba(0, 0, 0, 0.82)",
    customClass: {
      popup: "dark-swal-popup",
      title: "dark-swal-title",
      htmlContainer: "dark-swal-text",
      confirmButton: "dark-swal-btn-confirm",
      cancelButton: "dark-swal-btn-cancel",
    },
    buttonsStyling: true,
  });
};

/**
 * Modal de carga / progreso
 */
export const showLoadingAlert = (title = "Subiendo archivo...", text = "Por favor espera un momento") => {
  Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: "#161822",
    color: "#f8fafc",
    customClass: {
      popup: "dark-swal-popup",
    },
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeAlert = () => {
  Swal.close();
};

export default Swal;
