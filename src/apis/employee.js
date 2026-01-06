import http from "./http";

export const getEmployees = async () => {
  const response = await http.get("/employee/get");
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const formData = new FormData();
  Object.keys(employeeData).forEach(key => {
    formData.append(key, employeeData[key]);
  });
  
  const response = await http.post("/employee/create", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const formData = new FormData();
  Object.keys(employeeData).forEach(key => {
    formData.append(key, employeeData[key]);
  });
  
  const response = await http.put(`/employee/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateEmployeeStatus = async (id, isActive) => {
  console.log("API call - updating status for employee ID:", id, "=>", isActive);

  try {
    const response = await http.get(`employee/employee/${id}/status`);
    return response.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  const response = await http.delete(`/employee/delete/${id}`);
  return response.data;
};