import http from './http';

export const updateAdminPassword = async (id, data) => {
  const response = await http.put(`/admins/update-password/${id}`, data);
  return response.data;
};

// Update Login User (General update for name, password, etc.)
export const updateLoginUser = async (id, data) => {
  const response = await http.put(`/admins/update/${id}`, data);
  return response.data;
};
