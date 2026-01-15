import http from './http';

export const updateAdminPassword = async (id, data) => {
  const response = await http.put(`/admins/update-password/${id}`, data);
  return response.data;
};
