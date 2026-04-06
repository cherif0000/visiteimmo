import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { MessageSquareIcon, PhoneIcon, CalendarIcon } from "lucide-react";

function formatDate(d) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}

const STATUT = {
  nouveau:  { label: "Nouveau",    class: "badge-info" },
  en_cours: { label: "En cours",   class: "badge-warning" },
  confirme: { label: "Confirmé",   class: "badge-purple" },
  conclu:   { label: "Conclu ✓",  class: "badge-success" },
  annule:   { label: "Annulé",     class: "badge-error" },
};

export default function BailleurDemandes() {
  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ["bailleur-demandes"],
    queryFn: () => axiosInstance.get("/admin/bailleur-portal/demandes").then(r => r.data),
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Demandes sur mes biens</h2>
        <p className="text-base-content/50 text-sm">
          {demandes.length} demande(s) — traitées par l'équipe VisiteImmobilier
        </p>
      </div>

      <div className="alert bg-base-200 border border-base-content/10 text-sm">
        <MessageSquareIcon className="size-4 shrink-0" />
        <span>Notre équipe gère toutes les visites et négociations avec les clients. Vous serez informé ici de l'avancement.</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : demandes.length === 0 ? (
        <div className="text-center py-20 text-base-content/40">
          <MessageSquareIcon className="size-12 mx-auto mb-3" />
          <p>Aucune demande pour vos biens pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandes.map((d) => {
            const st = STATUT[d.statut] ?? STATUT.nouveau;
            return (
              <div key={d._id} className="card bg-base-100 border border-base-content/10 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold">{d.client?.nom ?? "—"}</p>
                        <span className={`badge badge-sm ${st.class}`}>{st.label}</span>
                        <span className="badge badge-ghost badge-sm capitalize">{d.typeDemande}</span>
                      </div>
                      <p className="text-sm text-base-content/60">🏠 {d.bien?.titre} — {d.bien?.quartier}</p>
                      {d.message && <p className="text-xs text-base-content/40 mt-1 italic">"{d.message}"</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-base-content/40">
                        <span className="flex items-center gap-1"><CalendarIcon className="size-3" />{formatDate(d.createdAt)}</span>
                        {d.heureConfirmee && <span className="text-success font-medium">✓ Visite le {formatDate(d.heureConfirmee)}</span>}
                      </div>
                    </div>
                  </div>
                  {d.statut === "conclu" && (
                    <div className="mt-2 bg-success/10 rounded-lg p-2 text-success text-xs font-semibold text-center">
                      ✅ Location finalisée — votre loyer sera versé par VisiteImmobilier
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
