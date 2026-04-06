import { BuildingIcon } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router";
import { NAVIGATION } from "./Navbar";

function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  return (
    <div className="drawer-side is-drawer-close:overflow-visible">
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay" />

      <div className="flex min-h-full flex-col items-start bg-base-200
                      is-drawer-close:w-14 is-drawer-open:w-64 transition-all">

        {/* Logo */}
        <div className="p-4 w-full border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <BuildingIcon className="w-5 h-5 text-primary-content" />
            </div>
            <div className="is-drawer-close:hidden">
              <p className="text-base font-bold leading-tight">VisiteImmo</p>
              <p className="text-xs text-base-content/50">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ul className="menu w-full grow flex flex-col gap-1 pt-3">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right
                    ${isActive ? "bg-primary text-primary-content font-semibold" : ""}`}
                  data-tip={item.name}
                >
                  {item.icon}
                  <span className="is-drawer-close:hidden">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User */}
        <div className="p-4 w-full border-t border-base-content/10">
          <div className="flex items-center gap-3">
            <img
              src={user?.imageUrl}
              alt={user?.firstName}
              className="w-9 h-9 rounded-full shrink-0 object-cover"
            />
            <div className="is-drawer-close:hidden min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-base-content/50 truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Sidebar;
