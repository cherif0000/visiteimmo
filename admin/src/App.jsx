import { Navigate, Route, Routes } from "react-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import PageLoader from "./components/PageLoader";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BiensPage from "./pages/BiensPage";
import DemandesPage from "./pages/DemandesPage";
import CommissionsPage from "./pages/CommissionsPage";
import ClientsPage from "./pages/ClientsPage";
import BailleurPortalLayout from "./pages/bailleur/BailleurPortalLayout";
import BailleurDashboard from "./pages/bailleur/BailleurDashboard";
import BailleurBiens from "./pages/bailleur/BailleurBiens";
import BailleurDemandes from "./pages/bailleur/BailleurDemandes";
import BailleurCommissions from "./pages/bailleur/BailleurCommissions";
import { setAdminToken } from "./lib/axios";
import axiosInstance from "./lib/axios";

function useRole() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }

    getToken().then(async (token) => {
      setAdminToken(token);

      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim();
      const userEmail  = user.emailAddresses?.[0]?.emailAddress?.trim();

      // Si VITE_ADMIN_EMAIL n'est pas configuré → admin par défaut
      if (!adminEmail) {
        console.warn("⚠️ VITE_ADMIN_EMAIL non défini dans .env → accès admin par défaut");
        setRole("admin");
        setLoading(false);
        return;
      }

      // Email correspond → admin
      if (userEmail === adminEmail) {
        setRole("admin");
        setLoading(false);
        return;
      }

      // Sinon : vérifier si c'est un bailleur enregistré
      try {
        const res = await axiosInstance.get("/admin/bailleur-portal/stats");
        if (res.data?.bailleur) {
          setRole("bailleur");
        } else {
          // Pas de profil bailleur lié → refuser l'accès
          setRole("unauthorized");
        }
      } catch {
        // Erreur API → refuser l'accès
        setRole("unauthorized");
      }
      setLoading(false);
    });
  }, [isSignedIn, user?.id]);

  return { role, loading };
}

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const { role, loading } = useRole();

  if (!isLoaded || loading) return <PageLoader />;

  if (!isSignedIn) {
    return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  }

  // Accès non autorisé (ni admin ni bailleur reconnu)
  if (role === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p className="text-base-content/60 text-sm mb-4">
            Votre compte n'est pas autorisé à accéder à cette interface.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Portail Bailleur
  if (role === "bailleur") {
    return (
      <Routes>
        <Route path="/bailleur" element={<BailleurPortalLayout />}>
          <Route index element={<BailleurDashboard />} />
          <Route path="biens"       element={<BailleurBiens />} />
          <Route path="demandes"    element={<BailleurDemandes />} />
          <Route path="commissions" element={<BailleurCommissions />} />
        </Route>
        <Route path="*" element={<Navigate to="/bailleur" />} />
      </Routes>
    );
  }

  // Dashboard Admin
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"   element={<DashboardPage />} />
        <Route path="biens"       element={<BiensPage />} />
        <Route path="demandes"    element={<DemandesPage />} />
        <Route path="commissions" element={<CommissionsPage />} />
        <Route path="clients"     element={<ClientsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
