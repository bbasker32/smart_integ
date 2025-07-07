import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
  console.error('VITE_API_BASE_URL is not defined in environment variables');
}

export const candidateService = {
  // Get all candidates
  getAllCandidates: async () => {
    try {
      const response = await axios.get(`${API_URL}/candidates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Server returned HTML instead of JSON. API URL might be incorrect.');
        return [];
      }
      if (response.data && response.data.data && response.data.data.candidates) {
        return response.data.data.candidates;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return [];
    }
  },

  // Get candidate by ID
  getCandidateById: async (candidateId) => {
    try {
      const response = await axios.get(`${API_URL}/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Server returned HTML instead of JSON. API URL might be incorrect.');
        return null;
      }
      if (response.data && response.data.data && response.data.data.candidate) {
        return response.data.data.candidate;
      } else if (response.data) {
        return response.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return null;
    }
  },

  // Create a new candidate (with or without file)
  createCandidate: async (candidateData, file) => {
    try {
      const formData = new FormData();
      Object.entries(candidateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if (file) {
        formData.append('cv', file);
      }
      const response = await axios.post(`${API_URL}/candidates`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data?.candidate || response.data;
    } catch (error) {
      console.error('Error creating candidate:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  // Update a candidate
  updateCandidate: async (candidateId, candidateData) => {
    try {
      const response = await axios.put(`${API_URL}/candidates/${candidateId}`, candidateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data?.candidate || response.data;
    } catch (error) {
      console.error('Error updating candidate:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  // Delete a candidate
  deleteCandidate: async (candidateId) => {
    try {
      await axios.delete(`${API_URL}/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  // Get all candidates with status 'traited' and a CV
  getTratedCandidatesWithCV: async () => {
    try {
      const response = await axios.get(`${API_URL}/candidates/status/traited/cv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Server returned HTML instead of JSON. API URL might be incorrect.');
        return [];
      }
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching traited candidates with CV:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return [];
    }
  },

  // Get traited candidates for a specific profile
  getTratedCandidatesByProfile: async (profileId) => {
    try {
      const response = await axios.get(`${API_URL}/candidates/profile/${profileId}/traited`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Server returned HTML instead of JSON. API URL might be incorrect.');
        return [];
      }
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching traited candidates by profile:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return [];
    }
  },

  // Get all candidates with status 'received' and a CV
  getReceivedCandidatesWithCV: async () => {
    try {
      const response = await axios.get(`${API_URL}/candidates/received/cv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Server returned HTML instead of JSON. API URL might be incorrect.');
        return [];
      }
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching received candidates with CV:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return [];
    }
  },

  // Download the CV of a candidate by id (returns a Blob)
  downloadCandidateCV: async (candidateId) => {
    try {
      const response = await axios.get(`${API_URL}/candidates/${candidateId}/cv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      return response.data; // Blob du fichier CV
    } catch (error) {
      console.error('Error downloading candidate CV:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  uploadCandidateCv: async (fk_profile, file, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('fk_profile', fk_profile);
      formData.append('cv', file);

      const response = await axios.post(`${API_URL}/candidates`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onUploadProgress) {
            onUploadProgress(percentCompleted);
          }
        },
      });
      return response.data.data?.candidate || response.data;
    } catch (error) {
      console.error('Error uploading candidate CV:', error);
      throw error;
    }
  },

  // Update a candidate's manual rank
  updateCandidateManualRank: async (candidateId, manualRank) => {
    try {
      const response = await axios.patch(
        `${API_URL}/candidates/${candidateId}/rank`,
        { manual_rank: manualRank },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data?.candidate || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update manual_rank for multiple candidates in order
  updateCandidatesManualRanks: async (candidatesWithRanks) => {
    // candidatesWithRanks: [{id, manual_rank}, ...]
    return Promise.all(
      candidatesWithRanks.map(({id, manual_rank}) =>
        candidateService.updateCandidateManualRank(id, manual_rank)
      )
    );
  },

  // You can add other candidate-related API calls here later if needed
}; 