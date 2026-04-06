import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { BuildingIcon, MapPinIcon, BedDoubleIcon, CheckCircleIcon } from "lucide-react";

const STATUT = {
  disponible:  { label: "Disponible",  class: "badge-success" },
  loue:        { label: "Loué",        class: "badge-error" },
  sur_demande: { label: "Sur demande", class: "badge-warning" },
};

function formatF(n) { return (n ?? 0).toLocaleString("fr-FR") + " FCFA"; }

export default function BailleurBiens() {
  const { data: biens = [], isLoading } = useQuery({
    queryKey: ["bailleur-biens"],
    queryFn: () => axiosInstance.get("/admin/bailleur-portal/biens").then(r => r.data),
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold">Mes biens</h2>
        <p className="text-base-content/50 text-sm">Vos propriétés publiées sur VisiteImmobilier</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : biens.length === 0 ? (
        <div className="text-center py-20 text-base-content/40">
          <BuildingIcon className="size-12 mx-auto mb-3" />
          <p>Aucun bien associé à votre compte</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {biens.map((b) => {
            const st = STATUT[b.statut] ?? { label: b.statut, class: "badge-ghost" };
            return (
              <div key={b._id} className="card bg-base-100 border border-base-content/10 shadow-sm hover:shadow-md transition-shadow">
                {/* Photo */}
                <figure className="relative">
                  {b.photos?.[0] ? (
                    <img src={b.photos[0]} className="w-full h-44 object-cover" alt={b.titre} />
                  ) : (
                    <div className="w-full h-44 bg-base-200 flex items-center justify-center">
                      <BuildingIcon className="size-10 text-base-content/20" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 badge ${st.class}`}>{st.label}</span>
                  {b.verifie && (
                    <span className="absolute top-3 right-3 badge badge-warning gap-1">
                      <CheckCircleIcon className="size-3" /> Vérifié
                    </span>
                  )}
                </figure>
                <div className="card-body p-4">
                  <h3 className="font-bold">{b.titre}</h3>
                  <div className="flex items-center gap-1 text-sm text-base-content/50">
                    <MapPinIcon className="size-3.5" />
                    <span>{b.quartier}, {b.ville}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                      <BedDoubleIcon className="size-4" />
                      <span>{b.chambres} ch. • {b.surface ? `${b.surface}m²` : "—"}</span>
                    </div>
                    <p className="font-bold text-primary">{formatF(b.prix)}<span className="text-xs font-normal text-base-content/40">/mois</span></p>
                  </div>
                  {/* Infos commission */}
                  <div className="mt-2 pt-2 border-t border-base-content/10 text-xs text-base-content/50 flex justify-between">
                    <span>Commission VisiteImmo : <strong>{b.tauxCommission ?? 100}%</strong></span>
                    <span>Vous recevez : <strong className="text-success">{formatF(Math.round(b.prix * (1 - (b.tauxCommission ?? 100) / 100)))}/mois</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
