import axiosInstance from "./axios";

// ─── Stats ───────────────────────────────────────────────
export const statsApi = {
  getDashboard: async () => {
    const { data } = await axiosInstance.get("/admin/stats");
    return data;
  },
};

// ─── Biens ───────────────────────────────────────────────
export const bienApi = {
  getAll: async (params = {}) => {
    const { data } = await axiosInstance.get("/admin/biens", { params });
    return data;
  },
  create: async (formData) => {
    const { data } = await axiosInstance.post("/admin/biens", formData);
    return data;
  },
  update: async ({ id, body }) => {
    const { data } = await axiosInstance.put(`/admin/biens/${id}`, body);
    return data;
  },
  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/admin/biens/${id}`);
    return data;
  },
  toggleVerifie: async (id) => {
    const { data } = await axiosInstance.patch(`/admin/biens/${id}/verifie`);
    return data;
  },
};

// ─── Demandes ────────────────────────────────────────────
export const demandeApi = {
  getAll: async (params = {}) => {
    const { data } = await axiosInstance.get("/admin/demandes", { params });
    return data;
  },
  updateStatut: async ({ id, body }) => {
    const { data } = await axiosInstance.patch(`/admin/demandes/${id}/statut`, body);
    return data;
  },
  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/admin/demandes/${id}`);
    return data;
  },
};

// ─── Bailleurs (anciennement "courtiers" - nom corrigé) ──
export const bailleurApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/bailleurs");
    return data;
  },
  create: async (body) => {
    const { data } = await axiosInstance.post("/admin/bailleurs", body);
    return data;
  },
  update: async ({ id, body }) => {
    const { data } = await axiosInstance.put(`/admin/bailleurs/${id}`, body);
    return data;
  },
  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/admin/bailleurs/${id}`);
    return data;
  },
};

// ─── Commissions ─────────────────────────────────────────
export const commissionApi = {
  getAll: async (params = {}) => {
    const { data } = await axiosInstance.get("/admin/commissions", { params });
    return data;
  },
};

// ─── Clients ─────────────────────────────────────────────
export const clientApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/clients");
    return data;
  },
};
