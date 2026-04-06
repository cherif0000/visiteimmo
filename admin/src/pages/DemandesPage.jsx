import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demandeApi } from "../lib/api";
import { TrashIcon, ClipboardListIcon } from "lucide-react";

const STATUTS = ["en_attente", "acceptee", "refusee", "annulee"];
const BADGE = {
  en_attente: "badge-warning",
  acceptee:   "badge-success",
  refusee:    "badge-error",
  annulee:    "badge-ghost",
};

export default function DemandesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ["demandes"],
    queryFn: () => demandeApi.getAll(),
  });

  const updateMut = useMutation({
    mutationFn: demandeApi.updateStatut,
    onSuccess: () => qc.invalidateQueries(["demandes"]),
  });
  const deleteMut = useMutation({
    mutationFn: demandeApi.delete,
    onSuccess: () => qc.invalidateQueries(["demandes"]),
  });

  const filtered = filter ? demandes.filter((d) => d.statut === filter) : demandes;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Demandes de visite</h2>
          <p className="text-base-content/50 text-sm">{demandes.length} demande(s) au total</p>
        </div>
        <select
          className="select select-bordered w-full max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Client</th>
                <th>Bien demandé</th>
                <th>Date</th>
                <th>Courtier lié</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-base-content/40">Aucune demande</td></tr>
              )}
              {filtered.map((d) => (
                <tr key={d._id}>
                  <td>
                    <p className="font-medium">{d.client?.nom ?? d.clientNom ?? "—"}</p>
                    <p className="text-xs text-base-content/50">{d.client?.email ?? d.clientEmail}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ClipboardListIcon className="size-4 text-primary" />
                      <span>{d.bien?.titre ?? "Bien supprimé"}</span>
                    </div>
                    <p className="text-xs text-base-content/50">{d.bien?.ville}</p>
                  </td>
                  <td className="text-sm">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td>
                    {d.bien?.courtier ? (
                      <div>
                        <span className="badge badge-info badge-sm">Courtier</span>
                        <p className="text-xs text-base-content/50 mt-1">{d.bien.courtier.nom}</p>
                      </div>
                    ) : (
                      <span className="badge badge-success badge-sm">Nous</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="select select-xs select-bordered"
                      value={d.statut}
                      onChange={(e) => updateMut.mutate({ id: d._id, body: { statut: e.target.value } })}
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => { if (confirm("Supprimer cette demande ?")) deleteMut.mutate(d._id); }}
                    >
                      <TrashIcon className="size-4" />
                    </button>
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
