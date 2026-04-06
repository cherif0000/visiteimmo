import { Outlet, Link, useLocation } from "react-router";
import { useAuth, UserButton, useUser } from "@clerk/clerk-react";
import {
  HomeIcon, BuildingIcon, CoinsIcon, MessageSquareIcon, LogOutIcon,
} from "lucide-react";

const NAV = [
  { path: "/bailleur",             label: "Vue d'ensemble", icon: HomeIcon },
  { path: "/bailleur/biens",       label: "Mes biens",      icon: BuildingIcon },
  { path: "/bailleur/demandes",    label: "Demandes",       icon: MessageSquareIcon },
  { path: "/bailleur/commissions", label: "Mes revenus",    icon: CoinsIcon },
];

export default function BailleurPortalLayout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar bailleur */}
      <aside className="w-64 bg-base-100 border-r border-base-content/10 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
              <BuildingIcon className="size-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">VisiteImmo</p>
              <p className="text-xs text-base-content/50">Espace Bailleur</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || (path !== "/bailleur" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/70"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-base-content/10">
          <div className="flex items-center gap-3 mb-3">
            <UserButton />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-base-content/50 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm w-full gap-2 text-error" onClick={() => signOut()}>
            <LogOutIcon className="size-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
