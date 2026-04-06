import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { CoinsIcon, BanknoteIcon, TrendingUpIcon } from "lucide-react";

function formatF(n) { return (n ?? 0).toLocaleString("fr-FR") + " FCFA"; }
function formatDate(d) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}

export default function BailleurCommissions() {
  const { data, isLoading } = useQuery({
    queryKey: ["bailleur-commissions"],
    queryFn: () => axiosInstance.get("/admin/bailleur-portal/commissions").then(r => r.data),
  });

  const commissions = data?.commissions ?? [];
  const total        = data?.total ?? 0;
  const resteAPayer  = data?.resteAPayer ?? 0;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Mes revenus</h2>
        <p className="text-base-content/50 text-sm">Historique des locations et versements</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-primary/10 border border-primary/20">
          <div className="card-body p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
                <BanknoteIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Total reçu (après commission)</p>
                <p className="text-2xl font-extrabold text-primary">{formatF(resteAPayer)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-warning/10 border border-warning/20">
          <div className="card-body p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-warning rounded-xl flex items-center justify-center">
                <CoinsIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Commission VisiteImmo (total)</p>
                <p className="text-2xl font-extrabold text-warning">{formatF(total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : commissions.length === 0 ? (
        <div className="text-center py-20 text-base-content/40">
          <CoinsIcon className="size-12 mx-auto mb-3" />
          <p>Aucune location conclue pour l'instant</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Bien</th>
                <th>Loyer brut</th>
                <th>Commission VisiteImmo</th>
                <th>Vous recevez</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c._id}>
                  <td>
                    <p className="font-medium">{c.bien?.titre ?? "—"}</p>
                    <p className="text-xs text-base-content/40">{c.bien?.quartier}</p>
                  </td>
                  <td className="font-semibold">{formatF(c.loyer)}</td>
                  <td className="text-warning font-semibold">- {formatF(c.montant)} ({c.taux}%)</td>
                  <td className="text-primary font-bold">{formatF(c.loyer - c.montant)}</td>
                  <td className="text-sm text-base-content/50">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
