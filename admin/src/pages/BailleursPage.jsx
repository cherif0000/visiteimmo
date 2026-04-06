import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bailleurApi } from "../lib/api";
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, PhoneIcon, MailIcon, CoinsIcon } from "lucide-react";

const TYPES = [
  { value: "particulier", label: "Particulier" },
  { value: "agence",      label: "Agence immobilière" },
  { value: "hotel",       label: "Hôtel / Résidence" },
];

function BailleurForm({ bailleur, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    nom:             bailleur?.nom ?? "",
    telephone:       bailleur?.telephone ?? "",
    email:           bailleur?.email ?? "",
    type:            bailleur?.type ?? "particulier",
    adresse:         bailleur?.adresse ?? "",
    tauxCommission:  bailleur?.tauxCommission ?? "100",
    contrat:         bailleur?.contrat ?? "",
    noteInterne:     bailleur?.noteInterne ?? "",
  });
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-base-content/10 flex items-center justify-between">
          <h3 className="text-lg font-bold">{bailleur ? "Modifier le bailleur" : "Nouveau bailleur"}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-5 space-y-3">

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Nom complet *</span></label>
              <input name="nom" required className="input input-bordered" value={form.nom} onChange={handle} placeholder="Mamadou Diallo" />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Type</span></label>
              <select name="type" className="select select-bordered" value={form.type} onChange={handle}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Commission par défaut (%) *</span></label>
              <input name="tauxCommission" required type="number" min="0" max="100" className="input input-bordered"
                value={form.tauxCommission} onChange={handle} placeholder="100" />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Téléphone *</span></label>
              <input name="telephone" required className="input input-bordered" value={form.telephone} onChange={handle} placeholder="+221 77 000 00 00" />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input name="email" type="email" className="input input-bordered" value={form.email} onChange={handle} />
            </div>

            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Adresse</span></label>
              <input name="adresse" className="input input-bordered" value={form.adresse} onChange={handle} />
            </div>

            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Note interne</span></label>
              <textarea name="noteInterne" rows={2} className="textarea textarea-bordered"
                value={form.noteInterne} onChange={handle} placeholder="Informations importantes sur ce bailleur..." />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-base-content/10">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary gap-2" disabled={isLoading}>
              {isLoading && <span className="loading loading-spinner loading-xs" />}
              {bailleur ? "Enregistrer" : "Ajouter le bailleur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BailleursPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: bailleurs = [], isLoading } = useQuery({
    queryKey: ["bailleurs"],
    queryFn: bailleurApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: bailleurApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bailleurs"] }); setModal(null); },
    onError: (err) => alert("Erreur : " + (err?.response?.data?.message ?? err.message)),
  });
  const updateMut = useMutation({
    mutationFn: bailleurApi.update,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bailleurs"] }); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: bailleurApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bailleurs"] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Bailleurs</h2>
          <p className="text-base-content/50 text-sm">{bailleurs.length} bailleur(s) partenaire(s)</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setModal({ mode: "create" })}>
          <PlusIcon className="size-4" /> Nouveau bailleur
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : bailleurs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
          <UserIcon className="size-12 mb-3" />
          <p className="font-medium">Aucun bailleur</p>
          <p className="text-sm">Ajoutez des bailleurs pour gérer leurs biens et commissions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bailleurs.map((b) => (
            <div key={b._id} className="card border border-base-content/10 bg-base-100 hover:shadow-md transition-shadow">
              <div className="card-body p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-lg">
                      {b.nom[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{b.nom}</p>
                      <span className="badge badge-ghost badge-xs capitalize">{b.type}</span>
                    </div>
                  </div>
                  <div className={`badge badge-sm ${b.actif ? "badge-success" : "badge-error"}`}>
                    {b.actif ? "Actif" : "Inactif"}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-sm">
                  {b.telephone && (
                    <div className="flex items-center gap-2 text-base-content/70">
                      <PhoneIcon className="size-3.5" /> {b.telephone}
                    </div>
                  )}
                  {b.email && (
                    <div className="flex items-center gap-2 text-base-content/70">
                      <MailIcon className="size-3.5" /> {b.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-warning font-semibold">
                    <CoinsIcon className="size-3.5" /> Commission : {b.tauxCommission}%
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-base-content/10 text-center text-xs">
                  <div>
                    <p className="font-bold text-base">{b.totalBiens}</p>
                    <p className="text-base-content/50">Biens</p>
                  </div>
                  <div>
                    <p className="font-bold text-base">{b.totalLocations}</p>
                    <p className="text-base-content/50">Locations</p>
                  </div>
                  <div>
                    <p className="font-bold text-base text-success">{(b.totalCommissions ?? 0).toLocaleString("fr-FR")}</p>
                    <p className="text-base-content/50">FCFA</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="btn btn-ghost btn-sm flex-1" onClick={() => setModal({ mode: "edit", bailleur: b })}>
                    <PencilIcon className="size-3.5" /> Modifier
                  </button>
                  <button className="btn btn-ghost btn-sm text-error"
                    onClick={() => { if (confirm(`Supprimer ${b.nom} ?`)) deleteMut.mutate(b._id); }}>
                    <TrashIcon className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <BailleurForm
          bailleur={modal.bailleur}
          isLoading={createMut.isPending || updateMut.isPending}
          onClose={() => setModal(null)}
          onSubmit={(body) => {
            if (modal.mode === "create") createMut.mutate(body);
            else updateMut.mutate({ id: modal.bailleur._id, body });
          }}
        />
      )}
    </div>
  );
}
