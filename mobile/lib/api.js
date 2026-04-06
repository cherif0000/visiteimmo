import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({ baseURL: BASE_URL });

// Injecter le token Clerk dans chaque requête
export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

export const bienApi = {
  search: (params) => api.get("/biens", { params }).then((r) => r.data),
  getById: (id) => api.get(`/biens/${id}`).then((r) => r.data),
};

export const demandeApi = {
  create: (body) => api.post("/demandes", body).then((r) => r.data),
  mesDemandes: () => api.get("/users/demandes").then((r) => r.data),
};

export const userApi = {
  sync: (body) => api.post("/users/sync", body).then((r) => r.data),
  toggleFavori: (bienId) => api.post("/users/favoris", { bienId }).then((r) => r.data),
};
