import api from "./api";

export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await api.post("/users/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  changePassword: async (userId, newPassword) => {
    const response = await api.post(`/users/${userId}/change-password`, {
      newPassword,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
};
