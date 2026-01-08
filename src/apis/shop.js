import http from "./http";

// Get all shops with optional filters
export const getShops = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/shop/get?${queryString}` : '/shop/get';

  const response = await http.get(url);
  return response.data;
};

// Get shop by ID
export const getShopById = async (id) => {
  const response = await http.get(`/shop/get/${id}`);
  return response.data;
};

// Delete shop
export const deleteShop = async (id) => {
  const response = await http.delete(`/shop/delete/${id}`);
  return response.data;
};

// Toggle shop active status
export const toggleShopStatus = async (id) => {
  const response = await http.get(`/shop/status/${id}`);
  return response.data;
};
