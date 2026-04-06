import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demandeApi } from "../lib/api";
import {
  TrashIcon, CheckCircleIcon, XCircleIcon,
  ClockIcon, MessageSquareIcon, CalendarIcon, PhoneIcon,
  MailIcon, HomeIcon, MapPinIcon, RefreshCcwIcon,
} from "lucide-react";

// ✅ Statuts alignés avec le backend
const STATUTS = [
  { value: "nouveau",   label: "Nouveau",    badge: "badge-info",    icon: ClockIcon },
  { value: "en_cours",  label: "En cours",   badge: "badge-warning", icon: RefreshCcwIcon },
  { value: "confirme",  label: "Confirmé",   badge: "badge-purple",  icon: CheckCircleIcon },
  { value: "conclu",    label: "Conclu ✓",   badge: "badge-success", icon: CheckCircleIcon },
  { value: "annule",    label: "Annulé",     badge: "badge-error",   icon: XCircleIcon },
];

const BADGE_COLOR = {
  nouveau:  "badge-info",
  en_cours: "badge-warning",
  confirme: "bg-purple-100 text-purple-700 border-purple-200",
  conclu:   "badge-success",
  annule:   "badge-error",
};

function formatDate(d) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

function DemandeDetail({ demande, onClose, onUpdateStatut, isUpdating }) {
  const [statut, setStatut] = useState(demande.statut);
  const [heureConfirmee, setHeureConfirmee] = useState("");
  const [noteInterne, setNoteInterne] = useState(demande.noteInterne ?? "");

  const handleSave = () => {
    onUpdateStatut({
      id: demande._id,
      body: {
        statut,
        heureConfirmee: heureConfirmee || undefined,
        noteInterne,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-base-content/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Détail de la demande</h3>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Bien concerné */}
          <div className="bg-base-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <HomeIcon className="size-4 text-primary" />
              <span className="font-bold">{demande.bien?.titre ?? "Bien supprimé"}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-base-content/60">
              <MapPinIcon className="size-3" />
              <span>{demande.bien?.quartier} — {demande.bien?.prix?.toLocaleString("fr-FR")} FCFA/mois</span>
            </div>
          </div>

          {/* Info client */}
          <div className="space-y-2">
            <p className="font-semibold text-sm text-base-content/70 uppercase tracking-wide">Client</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-200 rounded-lg p-3">
                <p className="text-xs text-base-content/50">Nom</p>
                <p className="font-semibold">{demande.client?.nom ?? "—"}</p>
              </div>
              <div className="bg-base-200 rounded-lg p-3">
                <p className="text-xs text-base-content/50">Type de demande</p>
                <p className="font-semibold capitalize">{demande.typeDemande ?? "visite"}</p>
              </div>
              <div className="bg-base-200 rounded-lg p-3 flex items-center gap-2">
                <PhoneIcon className="size-4 text-success" />
                <div>
                  <p className="text-xs text-base-content/50">WhatsApp</p>
                  <p className="font-semibold">{demande.client?.telephone ?? "—"}</p>
                </div>
              </div>
              <div className="bg-base-200 rounded-lg p-3 flex items-center gap-2">
                <MailIcon className="size-4 text-info" />
                <div>
                  <p className="text-xs text-base-content/50">Email</p>
                  <p className="font-semibold text-sm truncate">{demande.client?.email || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {demande.message && (
            <div className="bg-base-200 rounded-xl p-3">
              <p className="text-xs text-base-content/50 mb-1">Message du client</p>
              <p className="text-sm">{demande.message}</p>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <CalendarIcon className="size-4" />
            <span>Reçue le {formatDate(demande.createdAt)}</span>
          </div>

          {/* Changer statut */}
          <div className="border-t border-base-content/10 pt-4 space-y-3">
            <p className="font-semibold text-sm">Mettre à jour le statut</p>

            <div className="flex flex-wrap gap-2">
              {STATUTS.map((s) => (
                <button
                  key={s.value}
                  className={`btn btn-sm ${statut === s.value ? "btn-primary" : "btn-ghost border border-base-content/20"}`}
                  onClick={() => setStatut(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Si confirmé : saisir une date/heure */}
            {(statut === "confirme") && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">📅 Date & heure de visite confirmée</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered input-sm"
                  value={heureConfirmee}
                  onChange={(e) => setHeureConfirmee(e.target.value)}
                />
                <p className="text-xs text-base-content/50 mt-1">
                  💬 Le client sera notifié automatiquement dans l'app.
                </p>
              </div>
            )}

            {/* Note interne */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Note interne (non visible par le client)</span>
              </label>
              <textarea
                className="textarea textarea-bordered textarea-sm"
                rows={2}
                placeholder="Ex: Client intéressé, rappeler lundi matin..."
                value={noteInterne}
                onChange={(e) => setNoteInterne(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-full gap-2"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating && <span className="loading loading-spinner loading-xs" />}
              Enregistrer & notifier le client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemandesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ["demandes"],
    queryFn: () => demandeApi.getAll(),
    refetchInterval: 30000, // Rafraîchir toutes les 30s
  });

  const updateMut = useMutation({
    mutationFn: demandeApi.updateStatut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demandes"] });
      setSelected(null);
    },
    onError: (err) => alert("Erreur : " + (err?.response?.data?.message ?? err.message)),
  });

  const deleteMut = useMutation({
    mutationFn: demandeApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["demandes"] }),
  });

  const filtered = filter ? demandes.filter((d) => d.statut === filter) : demandes;
  const nouveaux = demandes.filter((d) => d.statut === "nouveau").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Messages & Demandes
            {nouveaux > 0 && (
              <span className="badge badge-error badge-sm">{nouveaux} nouveau{nouveaux > 1 ? "x" : ""}</span>
            )}
          </h2>
          <p className="text-base-content/50 text-sm">{demandes.length} demande(s) au total</p>
        </div>
        <select
          className="select select-bordered w-full max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
          <MessageSquareIcon className="size-12 mb-3" />
          <p className="font-medium">Aucune demande</p>
          <p className="text-sm">Les demandes de visite des clients apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const isNouveaux = d.statut === "nouveau";
            return (
              <div
                key={d._id}
                className={`card border cursor-pointer hover:shadow-md transition-shadow ${
                  isNouveaux ? "border-info/40 bg-info/5" : "border-base-content/10 bg-base-100"
                }`}
                onClick={() => setSelected(d)}
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Avatar initiale */}
                      <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 font-bold text-primary">
                        {(d.client?.nom ?? "?")[0].toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold">{d.client?.nom ?? "—"}</p>
                          <span className={`badge badge-xs ${BADGE_COLOR[d.statut] ?? "badge-ghost"}`}>
                            {STATUTS.find(s => s.value === d.statut)?.label ?? d.statut}
                          </span>
                          <span className="badge badge-ghost badge-xs capitalize">{d.typeDemande ?? "visite"}</span>
                        </div>
                        <p className="text-sm text-base-content/60 mt-0.5 truncate">
                          🏠 {d.bien?.titre ?? "Bien supprimé"} — {d.bien?.quartier}
                        </p>
                        {d.message && (
                          <p className="text-sm text-base-content/50 mt-1 truncate italic">
                            "{d.message}"
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-base-content/40">
                          <span>📞 {d.client?.telephone ?? "—"}</span>
                          <span>{formatDate(d.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => { if (confirm("Supprimer cette demande ?")) deleteMut.mutate(d._id); }}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <DemandeDetail
          demande={selected}
          onClose={() => setSelected(null)}
          onUpdateStatut={updateMut.mutate}
          isUpdating={updateMut.isPending}
        />
      )}
    </div>
  );
}
