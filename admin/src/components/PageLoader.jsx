import { BuildingIcon } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-base-200 gap-4">
      <div className="size-16 bg-primary rounded-2xl flex items-center justify-center animate-pulse">
        <BuildingIcon className="size-8 text-primary-content" />
      </div>
      <span className="loading loading-dots loading-lg text-primary" />
      <p className="text-base-content/50 text-sm">VisiteImmobilier Admin</p>
    </div>
  );
}
