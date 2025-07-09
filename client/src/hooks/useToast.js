import { useCallback } from "react";
import toast from "react-hot-toast";

export const useToast = () => {
  // Toast de succès
  const showSuccess = useCallback((message) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#4aed88",
        color: "#fff",
      },
    });
  }, []);

  // Toast d'erreur
  const showError = useCallback((message) => {
    toast.error(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#ff4b4b",
        color: "#fff",
      },
    });
  }, []);

  // Toast d'information
  const showInfo = useCallback((message) => {
    toast(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#2196f3",
        color: "#fff",
      },
    });
  }, []);

  // Toast d'avertissement
  const showWarning = useCallback((message) => {
    toast(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#ff9800",
        color: "#fff",
      },
    });
  }, []);

  // Toast d'avertissement persistant (ne disparaît pas automatiquement)
  const showPersistentWarning = useCallback((message) => {
    return toast(message, {
      duration: Infinity, // Ne disparaît jamais automatiquement
      position: "top-right",
      style: {
        background: "#ff9800",
        color: "#fff",
        border: "2px solid #e65100",
      },
    });
  }, []);

  // Fonction pour fermer un toast spécifique
  const dismissToast = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  // Gestionnaire d'erreurs API
  const handleApiError = useCallback(
    (error) => {
      const message =
        error.response?.data?.message || "Une erreur est survenue";
      showError(message);
    },
    [showError]
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPersistentWarning,
    dismissToast,
    handleApiError,
  };
};
