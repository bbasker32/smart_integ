import api from "./api";

export const projectService = {
  getAllProjects: async (userId = null, userRole = null) => {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (userRole) params.append("userRole", userRole);
    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  },

  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getProjectProfiles: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/profiles`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post("/projects", projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  getFilteredProjects: async (filters, userId = null, userRole = null) => {
    // filters: { status, creationDate }
    const params = new URLSearchParams();
    if (filters.status) {
      if (filters.status === "Archiver") {
        params.append("is_archived", "true");
      } else {
        params.append("status", filters.status);
      }
    }
    if (filters.creationDate)
      params.append("creationDate", filters.creationDate);
    if (userId) params.append("userId", userId);
    if (userRole) params.append("userRole", userRole);
    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  },
};
