import { Navigate, Route, Routes } from "react-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import PageLoader from "./components/PageLoader";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BiensPage from "./pages/BiensPage";
import DemandesPage from "./pages/DemandesPage";
import BailleursPage from "./pages/BailleursPage";
import CommissionsPage from "./pages/CommissionsPage";
import ClientsPage from "./pages/ClientsPage";
import BailleurPortalLayout from "./pages/bailleur/BailleurPortalLayout";
import BailleurDashboard from "./pages/bailleur/BailleurDashboard";
import BailleurBiens from "./pages/bailleur/BailleurBiens";
import BailleurDemandes from "./pages/bailleur/BailleurDemandes";
import BailleurCommissions from "./pages/bailleur/BailleurCommissions";
import { setAdminToken } from "./lib/axios";
import axiosInstance from "./lib/axios";

// Rôles : "admin" | "bailleur" | null
function useRole() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) { setLoading(false); return; }

    getToken().then(async (token) => {
      setAdminToken(token);

      // Vérifie si admin (email dans liste ou metadata)
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const userEmail = user.emailAddresses?.[0]?.emailAddress;

      if (adminEmail && userEmail === adminEmail) {
        setRole("admin");
        setLoading(false);
        return;
      }

      // Sinon vérifie si bailleur
      try {
        await axiosInstance.get("/admin/bailleur-portal/stats");
        setRole("bailleur");
      } catch {
        setRole("admin"); // fallback → accès admin si pas trouvé comme bailleur
      }
      setLoading(false);
    });
  }, [isSignedIn, user?.id]);

  return { role, loading };
}

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const { role, loading } = useRole();

  if (!isLoaded || loading) return <PageLoader />;

  if (!isSignedIn) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
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

  // Admin
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="biens"        element={<BiensPage />} />
        <Route path="demandes"     element={<DemandesPage />} />
        <Route path="bailleurs"    element={<BailleursPage />} />
        <Route path="commissions"  element={<CommissionsPage />} />
        <Route path="clients"      element={<ClientsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
