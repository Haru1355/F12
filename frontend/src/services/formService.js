import api from './api';

export const formService = {
  getAllForms: async () => {
    const response = await api.get('/forms');
    return response.data;
  },

  getFormsByPsychologist: async (psychologistId) => {
    const response = await api.get(`/psychologists/${psychologistId}/forms`);
    return response.data;
  },

  createForm: async (psychologistId, title, questions) => {
    const response = await api.post('/forms', { psychologistId, title, questions });
    return response.data;
  },

  getForm: async (formId) => {
    const response = await api.get(`/forms/${formId}`);
    return response.data;
  },

  updateForm: async (formId, updates) => {
    const response = await api.patch(`/forms/${formId}`, updates);
    return response.data;
  },

  deleteForm: async (formId) => {
    await api.delete(`/forms/${formId}`);
  },

  saveResponse: async (formId, clientName, answers) => {
    const response = await api.post(`/forms/${formId}/responses`, { clientName, answers });
    return response.data;
  },

  getAllResponses: async () => {
    const response = await api.get('/responses');
    return response.data;
  },

  getResponseById: async (responseId) => {
    const response = await api.get(`/responses/${responseId}`);
    return response.data;
  },
};