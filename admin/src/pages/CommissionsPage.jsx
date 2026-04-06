import { useQuery } from "@tanstack/react-query";
import { commissionApi } from "../lib/api";
import { CoinsIcon } from "lucide-react";

export default function CommissionsPage() {
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["commissions"],
    queryFn: () => commissionApi.getAll(),
  });

  const totalGeneral = commissions.reduce((sum, c) => sum + (c.montant ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Commissions</h2>
          <p className="text-base-content/50 text-sm">Suivi des commissions par bien et par courtier</p>
        </div>
        <div className="stat bg-base-100 border border-base-content/10 rounded-xl px-5 py-3">
          <div className="stat-title text-xs">Total perçu</div>
          <div className="stat-value text-lg text-success">{totalGeneral.toLocaleString()} FCFA</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Bien</th>
                <th>Client</th>
                <th>Courtier</th>
                <th>Taux</th>
                <th>Montant commission</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-base-content/40">Aucune commission enregistrée</td></tr>
              )}
              {commissions.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <CoinsIcon className="size-4 text-warning" />
                      <span className="font-medium">{c.bien?.titre ?? "—"}</span>
                    </div>
                  </td>
                  <td>{c.client?.nom ?? c.clientNom ?? "—"}</td>
                  <td>
                    {c.courtier ? (
                      <div>
                        <p className="font-medium">{c.courtier.nom}</p>
                        <p className="text-xs text-base-content/50">{c.courtier.agence}</p>
                      </div>
                    ) : (
                      <span className="badge badge-success badge-sm">Bien propre</span>
                    )}
                  </td>
                  <td>{c.taux ? `${c.taux}%` : "—"}</td>
                  <td className="font-bold text-success">{c.montant?.toLocaleString()} FCFA</td>
                  <td className="text-sm">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
