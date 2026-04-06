import { useQuery } from "@tanstack/react-query";
import { clientApi, demandeApi } from "../lib/api";
import { UsersIcon, PhoneIcon, MailIcon, CalendarIcon } from "lucide-react";

export default function ClientsPage() {
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
  });

  // Récupérer toutes les demandes pour compter par client
  const { data: demandes = [] } = useQuery({
    queryKey: ["demandes"],
    queryFn: () => demandeApi.getAll(),
  });

  // Compter les demandes par clerkId
  const demandesParClient = demandes.reduce((acc, d) => {
    const id = d.client?.clerkId;
    if (id) acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Clients</h2>
        <p className="text-base-content/50 text-sm">{clients.length} client(s) enregistrés via l'application</p>
      </div>

      {loadingClients ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
          <UsersIcon className="size-12 mb-3" />
          <p className="font-medium">Aucun client</p>
          <p className="text-sm text-center">Les clients apparaissent ici dès qu'ils se connectent à l'application mobile.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Favoris</th>
                <th>Demandes</th>
                <th>Inscription</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const nbDemandes = demandesParClient[c.clerkId] ?? 0;
                return (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} className="size-10 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                            {(c.nom ?? "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{c.nom ?? "—"}</p>
                          <p className="text-xs text-base-content/40">{c.clerkId?.slice(0, 12)}…</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-sm">
                          <MailIcon className="size-3 text-info" />
                          <span>{c.email ?? "—"}</span>
                        </div>
                        {c.telephone && (
                          <div className="flex items-center gap-1 text-sm">
                            <PhoneIcon className="size-3 text-success" />
                            <span>{c.telephone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm">
                        ❤️ {c.favoris?.length ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${nbDemandes > 0 ? "badge-primary" : "badge-ghost"}`}>
                        {nbDemandes} demande{nbDemandes > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-base-content/50">
                        <CalendarIcon className="size-3" />
                        <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
