import api from "./api";

export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("forceChangePassword");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Valider le token (optionnel - pour vérifier si le token n'est pas expiré)
  validateToken: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      // Requête vers le backend pour valider le token
      const response = await api.get("/auth/validate");
      return response.status === 200;
    } catch (error) {
      console.error("Token validation error:", error);
      // Si la validation échoue, on supprime le token invalide
      if (error.response?.status === 401) {
        authService.logout();
      }
      return false;
    }
  },
};
