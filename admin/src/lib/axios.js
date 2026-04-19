import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// ── DEBUG : affiche l'URL réelle dans la console ─────────
console.log("[axios] baseURL configuré :", BASE);

const axiosInstance = axios.create({ baseURL: BASE });

// ── Intercepteur requête ──────────────────────────────────
// Injecte un token Clerk FRAIS avant chaque requête.
// Raison : setAdminToken() (appelé au montage de App.jsx) stocke un token
// valable ~1h. Passé ce délai, le token expire silencieusement et Clerk
// rejette les requêtes POST/PUT — ce qui produisait le redirect 302 → "/"
// et l'erreur "Cannot GET /" visible dans la console.
// window.Clerk.session.getToken() retourne le token mis en cache ET le
// rafraîchit automatiquement si besoin — coût réseau nul dans 99 % des cas.
axiosInstance.interceptors.request.use(async (config) => {
  // Token frais Clerk (depuis le cache ou rafraîchi silencieusement)
  try {
    const session = window?.Clerk?.session;
    if (session) {
      const freshToken = await session.getToken();
      if (freshToken) {
        config.headers["Authorization"] = `Bearer ${freshToken}`;
      }
    }
  } catch (tokenErr) {
    // Ne pas bloquer la requête si Clerk n'est pas encore prêt
    console.warn("[axios] Impossible de récupérer le token Clerk :", tokenErr?.message);
  }

  // Log chaque requête pour déboguer
  const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;
  console.log(
    `[axios ▶] ${config.method?.toUpperCase()} ${fullUrl}`,
    config.data instanceof FormData ? "(FormData)" : (config.data ?? "")
  );

  // Supprime Content-Type pour FormData → le navigateur injecte le boundary.
  // ⚠️  Axios 1.x : config.headers est un objet AxiosHeaders, pas un POJO.
  //     `delete config.headers["Content-Type"]` est sans effet sur cette version.
  //     Il faut utiliser la méthode .delete() de l'instance AxiosHeaders.
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

// ── Intercepteur réponse ──────────────────────────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const url    = err?.config?.url ?? "?";
    const base   = err?.config?.baseURL ?? "";
    const status = err?.response?.status ?? "network error";
    console.error(`[axios ✖] ${status} → ${base}${url}`, err?.response?.data ?? err.message);
    return Promise.reject(err);
  }
);

// ── setAdminToken ─────────────────────────────────────────
// Conservé pour compatibilité (utilisé dans App.jsx au premier chargement).
// Le token injecté ici sert de fallback si window.Clerk.session n'est pas
// encore disponible lors des toutes premières requêtes.
export const setAdminToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export default axiosInstance;