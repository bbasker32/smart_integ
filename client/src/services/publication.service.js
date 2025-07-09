import api from "./api";

export const publicationService = {
  getAllPublications: async () => {
    const response = await api.get("/publications");
    return response.data;
  },

  getPublication: async (id) => {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },

  createPublication: async (projectId, publicationData) => {
    const response = await api.post(
      `/publications/${projectId}`,
      publicationData
    );
    return response.data;
  },

  updatePublication: async (id, publicationData) => {
    const response = await api.put(`/publications/${id}`, publicationData);
    return response.data;
  },

  deletePublication: async (id) => {
    const response = await api.delete(`/publications/${id}`);
    return response.data;
  },

  publishToLinkedIn: async (publicationId) => {
    const response = await api.post(`/publications/${publicationId}/linkedin`);
    return response.data;
  },

  generateClassicDescription: async (profileId, language) => {
    const response = await api.post("/publications/classic", {
      profileId,
      outputLangue:
        language === "french"
          ? "français"
          : language === "spanish"
          ? "español"
          : "english",
    });
    return response.data;
  },

  exportDescription: async (profileId, description) => {
    const response = await api.post("/publications/export", {
      profileId,
      description,
    });
    return response.data;
  },

  getJobOffer: async (profileId) => {
    const response = await api.get(`/publications/${profileId}`);
    return response.data;
  },

  generateSEODescription: async (profileId, language) => {
    const response = await api.post("/publications/generate-seo", {
      profileId,
      outputLangue:
        language === "french"
          ? "français"
          : language === "spanish"
          ? "español"
          : "english",
    });
    return response.data;
  },

  generateSocialMediaPost: async (profileId, language) => {
    const response = await api.post("/publications/generate-social-media", {
      profileId,
      outputLangue:
        language === "french"
          ? "français"
          : language === "spanish"
          ? "español"
          : "english",
    });
    return response.data;
  },

  generatePlatformPreview: async (profileId, platform, options = {}) => {
    const response = await api.post("/publications/preview", {
      profileId,
      plateform: platform,
      options,
    });
    return response.data;
  },

  getAllPlatformPreviews: async (profileId, options = {}) => {
    const [linkedinPreview, indeedPreview] = await Promise.all([
      publicationService.generatePlatformPreview(
        profileId,
        "linkedin",
        options
      ),
      publicationService.generatePlatformPreview(profileId, "indeed", options),
    ]);

    return {
      linkedin: linkedinPreview.preview,
      indeed: indeedPreview.preview,
    };
  },

  getPlatformDescriptions: async (profileId) => {
    const response = await api.get(
      `/publications/${profileId}/platform-descriptions`
    );
    return response.data;
  },
};
