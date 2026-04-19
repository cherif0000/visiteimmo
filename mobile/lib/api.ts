import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s max — sans ça la requête pend indéfiniment sur téléphone
  headers: { "Content-Type": "application/json" },
});

// Intercepteur : log les erreurs réseau en dev pour faciliter le debug
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (__DEV__) {
      if (err.code === "ECONNABORTED") {
        console.error(`[API] Timeout — vérifie que le backend tourne et que EXPO_PUBLIC_API_URL est correct (${BASE_URL})`);
      } else if (!err.response) {
        console.error(`[API] Réseau inaccessible — URL: ${BASE_URL} — Erreur: ${err.message}`);
      }
    }
    return Promise.reject(err);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const bienApi = {
  search:  (params: Record<string, any>) => api.get("/biens", { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/biens/${id}`).then((r) => r.data),
};

export const demandeApi = {
  create:      (body: Record<string, any>) => api.post("/demandes", body).then((r) => r.data),
  mesDemandes: () => api.get("/users/demandes").then((r) => r.data),
};

export const userApi = {
  sync:         (body: Record<string, any>) => api.post("/users/sync", body).then((r) => r.data),
  getFavoris:   () => api.get("/users/favoris").then((r) => r.data),
  toggleFavori: (bienId: string) => api.post("/users/favoris", { bienId }).then((r) => r.data),
};
