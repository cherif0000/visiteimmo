import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({ baseURL: BASE_URL });

// Injecter le token Clerk dans chaque requête (appelé depuis _layout.tsx)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const bienApi = {
  search: (params: Record<string, any>) =>
    api.get("/biens", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get(`/biens/${id}`).then((r) => r.data),
};

export const demandeApi = {
  create: (body: Record<string, any>) =>
    api.post("/demandes", body).then((r) => r.data),
  mesDemandes: () =>
    api.get("/users/demandes").then((r) => r.data),
};

export const userApi = {
  sync: (body: Record<string, any>) =>
    api.post("/users/sync", body).then((r) => r.data),
  getFavoris: () =>
    api.get("/users/favoris").then((r) => r.data),
  toggleFavori: (bienId: string) =>
    api.post("/users/favoris", { bienId }).then((r) => r.data),
};
