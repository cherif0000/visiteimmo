import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { commissionApi } from "../lib/api";
import { CoinsIcon, BanknoteIcon, TrendingUpIcon, HandshakeIcon } from "lucide-react";

function formatF(n) { return (n ?? 0).toLocaleString("fr-FR") + " FCFA"; }
function formatDate(d) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}

export default function CommissionsPage() {
  const [filterMois, setFilterMois] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["commissions", filterMois],
    queryFn: () => commissionApi.getAll(filterMois ? { mois: filterMois } : {}),
  });

  const commissions = data?.commissions ?? [];
  const total         = data?.total ?? 0;
  const totalLoyers   = data?.totalLoyers ?? 0;
  const resteAVerser  = data?.resteAVerser ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Commissions</h2>
          <p className="text-base-content/50 text-sm">Suivi financier des locations conclues</p>
        </div>
        <input
          type="month"
          className="input input-bordered"
          value={filterMois}
          onChange={(e) => setFilterMois(e.target.value)}
        />
      </div>

      {/* KPIs financiers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-success/10 border border-success/20">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-success rounded-xl flex items-center justify-center">
                <CoinsIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Nos commissions perçues</p>
                <p className="text-xl font-extrabold text-success">{formatF(total)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-primary/10 border border-primary/20">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
                <BanknoteIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Total loyers encaissés</p>
                <p className="text-xl font-extrabold text-primary">{formatF(totalLoyers)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-warning/10 border border-warning/20">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-warning rounded-xl flex items-center justify-center">
                <HandshakeIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Reste à verser aux bailleurs</p>
                <p className="text-xl font-extrabold text-warning">{formatF(resteAVerser)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explication du modèle */}
      <div className="alert bg-base-200 border border-base-content/10 text-sm">
        <TrendingUpIcon className="size-5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold">Comment ça fonctionne</p>
          <p className="text-base-content/60">
            Lorsqu'un bien est loué via l'application, nous encaissons le loyer complet.
            Notre commission (ex: 10%) est déduite, et le reste est versé au bailleur.
            <strong> 100% de commission = bien propre, pas de bailleur.</strong>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : commissions.length === 0 ? (
        <div className="text-center py-20 text-base-content/40">
          <CoinsIcon className="size-12 mx-auto mb-3" />
          <p>Aucune commission {filterMois ? "pour ce mois" : "enregistrée"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Bien</th>
                <th>Bailleur</th>
                <th>Loyer total</th>
                <th>Notre commission</th>
                <th>Versé au bailleur</th>
                <th>Taux</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <CoinsIcon className="size-4 text-warning shrink-0" />
                      <div>
                        <p className="font-medium">{c.bien?.titre ?? "—"}</p>
                        <p className="text-xs text-base-content/40">{c.bien?.quartier}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.bailleur ? (
                      <div>
                        <p className="font-medium">{c.bailleur.nom}</p>
                        <p className="text-xs text-base-content/40">{c.bailleur.telephone}</p>
                      </div>
                    ) : (
                      <span className="badge badge-success badge-sm">Bien propre</span>
                    )}
                  </td>
                  <td className="font-semibold">{formatF(c.loyer)}</td>
                  <td className="font-bold text-success">{formatF(c.montant)}</td>
                  <td className="font-bold text-warning">{formatF(c.loyer - c.montant)}</td>
                  <td>
                    <span className="badge badge-outline badge-sm">{c.taux}%</span>
                  </td>
                  <td className="text-sm text-base-content/60">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
