import http from "./http";

// Get all outlets with optional filters
export const getOutlets = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/outlets/admin/all?${queryString}` : '/outlets/admin/all';
  const response = await http.get(url);
  return response.data;
};

// Get outlet by ID
export const getOutletById = async (id) => {
  const response = await http.get(`/outlets/single/${id}`);
  return response.data;
};

// Delete outlet
export const deleteOutlet = async (id) => {
  const response = await http.delete(`/outlets/admin/delete/${id}`);
  return response.data;
};

export const downloadOutletsExcel = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/outlets/admin/download?${queryString}` : "/outlets/admin/download";

    const response = await http.get(url, {
      responseType: "blob",
    });

    const downloadUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `Outlets_Data_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    throw error;
  }
};

export const downloadOutletsImagesZip = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/outlets/admin/download-images-zip?${queryString}` : "/outlets/admin/download-images-zip";

    const response = await http.get(url, {
      responseType: "blob",
    });

    // If the response is a blob but its type is application/json, it's an error message
    if (response.data.type === "application/json") {
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || "Failed to download images");
    }

    const downloadUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `Outlets_Images_${new Date().getTime()}.zip`);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    if (error.response && error.response.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || "Server error");
      } catch (e) {
        throw new Error("Failed to download images zip");
      }
    }
    throw error;
  }
};

export const getOutletFilters = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/outlets/admin/filters?${queryString}` : '/outlets/admin/filters';
  const response = await http.get(url);
  return response.data;
};

export const getAdminDashboardStats = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== "") {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString
    ? `/outlets/admin/dashboard-stats?${queryString}`
    : "/outlets/admin/dashboard-stats";
  const response = await http.get(url);
  return response.data;
};
