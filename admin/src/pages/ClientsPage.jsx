import { useQuery } from "@tanstack/react-query";
import { clientApi } from "../lib/api";
import { UsersIcon } from "lucide-react";

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Clients</h2>
        <p className="text-base-content/50 text-sm">{clients.length} client(s) enregistrés</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Demandes</th>
                <th>Inscription</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-base-content/40">Aucun client</td></tr>
              )}
              {clients.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center">
                        <UsersIcon className="size-4 text-primary" />
                      </div>
                      <span className="font-medium">{c.nom ?? (`${c.prenom ?? ""} ${c.lastName ?? ""}`.trim() || "—")}</span>
                    </div>
                  </td>
                  <td>{c.email ?? "—"}</td>
                  <td>{c.telephone ?? "—"}</td>
                  <td>
                    <span className="badge badge-neutral badge-sm">{c.totalDemandes ?? 0}</span>
                  </td>
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
