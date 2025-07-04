import api from "./api";

export const profileService = {
  getAllProfiles: async () => {
    const response = await api.get("/profiles");
    return response.data;
  },

  getProfile: async (id) => {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  },

  createProfile: async (projectId, profileData) => {
    const response = await api.post(`/profiles/${projectId}`, projectId);
    return response.data;
  },

  updateProfile: async (id, profileData) => {
    const response = await api.put(`/profiles/${id}`, profileData);
    return response.data;
  },

  deleteProfile: async (id) => {
    try {
      const response = await api.delete(`/profiles/${id}`);
      return response.data;
    } catch (error) {
      // Retourner l'erreur complète pour permettre au composant de gérer le message
      throw error;
    }
  },

  setProfileStatus: async (id, status) => {
    const response = await api.patch(`/profiles/${id}/status`, { status });
    return response.data;
  },
};
