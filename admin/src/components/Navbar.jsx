import { UserButton } from "@clerk/clerk-react";
import { matchPath, useLocation } from "react-router";
import {
  HomeIcon, BuildingIcon, ClipboardListIcon, UsersIcon,
  UserIcon, CoinsIcon, PanelLeftIcon, MessageSquareIcon,
} from "lucide-react";

export const NAVIGATION = [
  { name: "Dashboard",   path: "/dashboard",   icon: <HomeIcon className="size-5" /> },
  { name: "Biens",       path: "/biens",        icon: <BuildingIcon className="size-5" /> },
  { name: "Messages",    path: "/demandes",     icon: <MessageSquareIcon className="size-5" /> },
  { name: "Bailleurs",   path: "/bailleurs",    icon: <UserIcon className="size-5" /> },
  { name: "Commissions", path: "/commissions",  icon: <CoinsIcon className="size-5" /> },
  { name: "Clients",     path: "/clients",      icon: <UsersIcon className="size-5" /> },
];

export function Navbar() {
  const location = useLocation();
  const current = NAVIGATION.find((item) =>
    matchPath({ path: item.path, end: false }, location.pathname)
  );

  return (
    <div className="navbar w-full bg-base-300 border-b border-base-content/10">
      <label htmlFor="my-drawer" className="btn btn-square btn-ghost" aria-label="toggle sidebar">
        <PanelLeftIcon className="size-5" />
      </label>
      <div className="flex-1 px-2">
        <h1 className="text-lg font-bold">{current?.name ?? "Dashboard"}</h1>
      </div>
      <div className="mr-4">
        <UserButton />
      </div>
    </div>
  );
}
