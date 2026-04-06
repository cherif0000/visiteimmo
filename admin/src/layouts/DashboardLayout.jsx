// ─── DashboardLayout.jsx ─────────────────────────────────
import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" defaultChecked />
      <div className="drawer-content flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 bg-base-200">
          <Outlet />
        </main>
      </div>
      <Sidebar />
    </div>
  );
}
