const FORMS_KEY = 'psych_forms';

export const formService = {
  getFormsByPsychologist: (psychologistId) => {
    const forms = JSON.parse(localStorage.getItem(FORMS_KEY) || '[]');
    return forms.filter(f => f.psychologistId === psychologistId);
  },

  createForm: (psychologistId, title, questions) => {
    const forms = JSON.parse(localStorage.getItem(FORMS_KEY) || '[]');
    const newForm = {
      id: Date.now().toString(),
      psychologistId,
      title,
      questions, // массив объектов { questionText, type: 'text'|'radio'... }
      createdAt: new Date().toISOString()
    };
    forms.push(newForm);
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    return newForm;
  },

  getForm: (formId) => {
    const forms = JSON.parse(localStorage.getItem(FORMS_KEY) || '[]');
    return forms.find(f => f.id === formId);
  }
};