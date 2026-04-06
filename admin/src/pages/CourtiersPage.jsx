import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtierApi } from "../lib/api";
import {
  PlusIcon, PencilIcon, TrashIcon, HandshakeIcon,
  BuildingIcon, PhoneIcon, MailIcon, CoinsIcon, EyeIcon,
} from "lucide-react";

function CourtierForm({ courtier, onSubmit, onClose }) {
  const [form, setForm] = useState({
    nom: courtier?.nom ?? "",
    agence: courtier?.agence ?? "",
    telephone: courtier?.telephone ?? "",
    email: courtier?.email ?? "",
    adresse: courtier?.adresse ?? "",
    commissionDefautPct: courtier?.commissionDefautPct ?? "",
    notes: courtier?.notes ?? "",
  });
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-base-content/10 flex items-center justify-between">
          <h3 className="text-lg font-bold">{courtier ? "Modifier le courtier" : "Nouveau courtier"}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
          className="p-6 space-y-3"
        >
          <div className="form-control">
            <label className="label"><span className="label-text">Nom complet *</span></label>
            <input name="nom" required className="input input-bordered" value={form.nom} onChange={handle} placeholder="Mamadou Diallo" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Agence / Entreprise</span></label>
            <input name="agence" className="input input-bordered" value={form.agence} onChange={handle} placeholder="Immo Dakar SARL" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Téléphone</span></label>
              <input name="telephone" className="input input-bordered" value={form.telephone} onChange={handle} placeholder="+221 77 000 00 00" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input name="email" type="email" className="input input-bordered" value={form.email} onChange={handle} />
            </div>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Adresse</span></label>
            <input name="adresse" className="input input-bordered" value={form.adresse} onChange={handle} />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Commission par défaut (%)</span>
              <span className="label-text-alt text-warning">Appliquée à ses biens</span>
            </label>
            <input
              name="commissionDefautPct"
              type="number" min="0" max="100"
              className="input input-bordered"
              value={form.commissionDefautPct}
              onChange={handle}
              placeholder="Ex: 5"
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Notes internes</span></label>
            <textarea name="notes" rows={2} className="textarea textarea-bordered" value={form.notes} onChange={handle} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">
              {courtier ? "Enregistrer" : "Ajouter le courtier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BiensDuCourtier({ courierId, nom, onClose }) {
  const { data: biens = [], isLoading } = useQuery({
    queryKey: ["courtier-biens", courierId],
    queryFn: () => courtierApi.getBiens(courierId),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-6 border-b border-base-content/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Biens de {nom}</h3>
            <p className="text-sm text-base-content/50">{biens.length} bien(s) vérifiés</p>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>
          ) : biens.length === 0 ? (
            <div className="text-center py-10 text-base-content/40">Aucun bien enregistré pour ce courtier</div>
          ) : (
            <div className="space-y-3">
              {biens.map((b) => (
                <div key={b._id} className="flex items-center gap-4 p-3 rounded-xl bg-base-200">
                  <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BuildingIcon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{b.titre}</p>
                    <p className="text-xs text-base-content/50">{b.ville} — {b.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{b.prix?.toLocaleString()} FCFA</p>
                    <span className={`badge badge-xs ${b.verifie ? "badge-success" : "badge-warning"}`}>
                      {b.verifie ? "Vérifié" : "En attente"}
                    </span>
                  </div>
                  {b.commissionPct && (
                    <div className="badge badge-outline badge-sm gap-1">
                      <CoinsIcon className="size-3" />{b.commissionPct}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourtiersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [biensModal, setBiensModal] = useState(null);
  const [search, setSearch] = useState("");

  const { data: courtiers = [], isLoading } = useQuery({
    queryKey: ["courtiers"],
    queryFn: courtierApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: courtierApi.create,
    onSuccess: () => { qc.invalidateQueries(["courtiers"]); setModal(null); },
  });
  const updateMut = useMutation({
    mutationFn: courtierApi.update,
    onSuccess: () => { qc.invalidateQueries(["courtiers"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: courtierApi.delete,
    onSuccess: () => qc.invalidateQueries(["courtiers"]),
  });

  const filtered = courtiers.filter((c) =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.agence?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Courtiers partenaires</h2>
          <p className="text-base-content/50 text-sm">
            Gérez vos partenaires, leurs commissions et leurs biens vérifiés
          </p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setModal({ mode: "create" })}>
          <PlusIcon className="size-4" /> Nouveau courtier
        </button>
      </div>

      <input
        className="input input-bordered w-full max-w-sm"
        placeholder="Rechercher par nom ou agence…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-base-content/40">
              Aucun courtier enregistré
            </div>
          )}
          {filtered.map((c) => (
            <div key={c._id} className="card bg-base-100 border border-base-content/10 shadow-sm">
              <div className="card-body p-5 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <HandshakeIcon className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{c.nom}</p>
                      <p className="text-xs text-base-content/50">{c.agence ?? "Indépendant"}</p>
                    </div>
                  </div>
                  {c.commissionDefautPct && (
                    <div className="badge badge-warning gap-1 shrink-0">
                      <CoinsIcon className="size-3" />
                      {c.commissionDefautPct}%
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-1 text-sm text-base-content/70">
                  {c.telephone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="size-4 shrink-0" />
                      <span>{c.telephone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <MailIcon className="size-4 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                </div>

                {/* Biens counter */}
                <div
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-base-200 hover:bg-base-300 transition"
                  onClick={() => setBiensModal(c)}
                >
                  <BuildingIcon className="size-4 text-primary" />
                  <span className="text-sm font-medium">
                    {c.totalBiens ?? 0} bien(s) vérifiés
                  </span>
                  <EyeIcon className="size-4 ml-auto text-base-content/40" />
                </div>

                {c.notes && (
                  <p className="text-xs text-base-content/50 italic border-t border-base-content/10 pt-2">
                    {c.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    className="btn btn-sm btn-outline flex-1 gap-1"
                    onClick={() => setModal({ mode: "edit", courtier: c })}
                  >
                    <PencilIcon className="size-4" /> Modifier
                  </button>
                  <button
                    className="btn btn-sm btn-ghost text-error"
                    onClick={() => {
                      if (confirm(`Supprimer ${c.nom} ?`)) deleteMut.mutate(c._id);
                    }}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CourtierForm
          courtier={modal.courtier}
          onClose={() => setModal(null)}
          onSubmit={(body) => {
            if (modal.mode === "create") createMut.mutate(body);
            else updateMut.mutate({ id: modal.courtier._id, body });
          }}
        />
      )}

      {biensModal && (
        <BiensDuCourtier
          courierId={biensModal._id}
          nom={biensModal.nom}
          onClose={() => setBiensModal(null)}
        />
      )}
    </div>
  );
}
