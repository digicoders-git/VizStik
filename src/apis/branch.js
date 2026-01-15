import http from "./http";

export const getBranchStats = async () => {
  const response = await http.get("/branch/stats");
  return response.data;
};

export const getBranchUsers = async (branch, role) => {
  const response = await http.get(`/branch/users?branch=${branch}&role=${role}`);
  return response.data;
};
