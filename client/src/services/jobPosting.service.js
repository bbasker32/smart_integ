import api from "./api";

export const jobPostingService = {
  // Create or update a job posting (platform description)
  savePlatformDescription: async (jobOfferId, platform, description) => {
    const response = await api.post("/postings", {
      jobOfferId,
      plateform: platform,
      description,
    });
    return response.data;
  },

  // Get all postings (not used here, but useful for admin views)
  getAllPostings: async () => {
    const response = await api.get("/postings");
    return response.data;
  },

  // Update a posting (status, url, etc.)
  updatePosting: async (id, data) => {
    const response = await api.put(`/postings/${id}`, data);
    return response.data;
  },
};
