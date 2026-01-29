import http from "./http";

export const getEmployees = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/employee/admin/all?${queryString}` : '/employee/admin/all';

  const response = await http.get(url);
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await http.get(`/employee/get/${id}`);
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
  // console.log("API call - updating status for employee ID:", id, "=>", isActive);

  try {
    const response = await http.get(`/employee/employee/${id}/status`);
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

export const downloadEmployeesExcel = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `/employee/admin/download?${queryString}`
      : "/employee/admin/download";

    const response = await http.get(url, {
      responseType: "blob",
    });

    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "Employees_Data.xlsx");
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    throw error;
  }
};