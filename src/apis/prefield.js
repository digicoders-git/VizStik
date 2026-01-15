import http from "./http";

export const getPrefieldsAdmin = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/prefields/admin/all?${queryString}` : '/prefields/admin/all';

  const response = await http.get(url);
  return response.data;
};

export const downloadPrefieldsExcel = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/prefields/admin/download?${queryString}` : '/prefields/admin/download';

    const response = await http.get(url, {
      responseType: "blob", // Important for file downloads
    });

    // Create a temporary link to download the file
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "Prefields_Data.xlsx");
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    throw error;
  }
};
