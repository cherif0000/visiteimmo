import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import PageLoader from "./components/PageLoader";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BiensPage from "./pages/BiensPage";
import DemandesPage from "./pages/DemandesPage";
import BailleursPage from "./pages/BailleursPage";
import CommissionsPage from "./pages/CommissionsPage";
import ClientsPage from "./pages/ClientsPage";
import { setAdminToken } from "./lib/axios";

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();

  // Injecter le token Clerk dans axios dès que l'auth change
  useEffect(() => {
    if (!isSignedIn) {
      setAdminToken(null);
      return;
    }
    getToken().then((token) => setAdminToken(token));
  }, [isSignedIn]);

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route path="/login" element={isSignedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={isSignedIn ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="biens"        element={<BiensPage />} />
        <Route path="demandes"     element={<DemandesPage />} />
        <Route path="bailleurs"    element={<BailleursPage />} />
        <Route path="commissions"  element={<CommissionsPage />} />
        <Route path="clients"      element={<ClientsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
