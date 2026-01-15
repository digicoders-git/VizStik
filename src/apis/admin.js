import http from './http';

export const updateAdminPassword = async (id, data) => {
  const response = await http.put(`/admins/update-password/${id}`, data);
  return response.data;
};

// Reusing updateAdminPassword logic but exposing it as updateLoginUser for clarity
export const updateLoginUser = async (id, data) => {
  return await updateAdminPassword(id, data);
};
