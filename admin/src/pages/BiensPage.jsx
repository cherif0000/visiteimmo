import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bienApi, courtierApi } from "../lib/api";
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, BuildingIcon } from "lucide-react";

const TYPES = ["appartement", "villa", "bureau", "studio", "duplex"];
const STATUTS = ["disponible", "loue", "reserve"];

function BienForm({ bien, courtiers, onSubmit, onClose }) {
  const [form, setForm] = useState({
    titre: bien?.titre ?? "",
    type: bien?.type ?? "appartement",
    adresse: bien?.adresse ?? "",
    ville: bien?.ville ?? "",
    prix: bien?.prix ?? "",
    surface: bien?.surface ?? "",
    chambres: bien?.chambres ?? "",
    statut: bien?.statut ?? "disponible",
    description: bien?.description ?? "",
    courierId: bien?.courierId ?? "", // "" = notre propre bien
    commissionPct: bien?.commissionPct ?? "",
  });

  const [photos, setPhotos] = useState([]);
  const estCourtier = !!form.courierId;

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== "" && fd.append(k, v));
    photos.forEach((p) => fd.append("photos", p));
    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-base-content/10 flex items-center justify-between">
          <h3 className="text-lg font-bold">{bien ? "Modifier le bien" : "Ajouter un bien"}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Source du bien */}
          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Source du bien</span></label>
            <select
              name="courierId"
              className="select select-bordered w-full"
              value={form.courierId}
              onChange={handle}
            >
              <option value="">🏠 Notre propre bien</option>
              {courtiers.map((c) => (
                <option key={c._id} value={c._id}>
                  🤝 Courtier — {c.nom} ({c.agence ?? "indépendant"})
                </option>
              ))}
            </select>
          </div>

          {/* Commission si courtier */}
          {estCourtier && (
            <div className="alert alert-info text-sm py-2 px-4">
              <span>Ce bien sera lié au courtier sélectionné. La commission sera enregistrée dans son profil.</span>
            </div>
          )}
          {estCourtier && (
            <div className="form-control">
              <label className="label"><span className="label-text">Commission courtier (%)</span></label>
              <input
                name="commissionPct"
                type="number"
                min="0" max="100"
                className="input input-bordered"
                placeholder="Ex: 5"
                value={form.commissionPct}
                onChange={handle}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Titre *</span></label>
              <input name="titre" required className="input input-bordered" value={form.titre} onChange={handle} placeholder="Appartement 3 pièces Plateau" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Type</span></label>
              <select name="type" className="select select-bordered" value={form.type} onChange={handle}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Statut</span></label>
              <select name="statut" className="select select-bordered" value={form.statut} onChange={handle}>
                {STATUTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Prix (FCFA) *</span></label>
              <input name="prix" required type="number" className="input input-bordered" value={form.prix} onChange={handle} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Surface (m²)</span></label>
              <input name="surface" type="number" className="input input-bordered" value={form.surface} onChange={handle} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Chambres</span></label>
              <input name="chambres" type="number" className="input input-bordered" value={form.chambres} onChange={handle} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Ville *</span></label>
              <input name="ville" required className="input input-bordered" value={form.ville} onChange={handle} />
            </div>
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Adresse</span></label>
              <input name="adresse" className="input input-bordered" value={form.adresse} onChange={handle} />
            </div>
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Description</span></label>
              <textarea name="description" rows={3} className="textarea textarea-bordered" value={form.description} onChange={handle} />
            </div>
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Photos</span></label>
              <input type="file" multiple accept="image/*" className="file-input file-input-bordered w-full"
                onChange={(e) => setPhotos(Array.from(e.target.files))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">
              {bien ? "Enregistrer" : "Ajouter le bien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BiensPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | {mode:"create"|"edit", bien?}
  const [search, setSearch] = useState("");

  const { data: biens = [], isLoading } = useQuery({ queryKey: ["biens"], queryFn: () => bienApi.getAll() });
  const { data: courtiers = [] } = useQuery({ queryKey: ["courtiers"], queryFn: courtierApi.getAll });

  const createMut = useMutation({
    mutationFn: bienApi.create,
    onSuccess: () => { qc.invalidateQueries(["biens"]); setModal(null); },
  });
  const updateMut = useMutation({
    mutationFn: bienApi.update,
    onSuccess: () => { qc.invalidateQueries(["biens"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: bienApi.delete,
    onSuccess: () => qc.invalidateQueries(["biens"]),
  });
  const toggleMut = useMutation({
    mutationFn: bienApi.toggleVerifie,
    onSuccess: () => qc.invalidateQueries(["biens"]),
  });

  const filtered = biens.filter((b) =>
    b.titre?.toLowerCase().includes(search.toLowerCase()) ||
    b.ville?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Biens</h2>
          <p className="text-base-content/50 text-sm">Biens propres et biens courtiers vérifiés</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setModal({ mode: "create" })}>
          <PlusIcon className="size-4" /> Ajouter un bien
        </button>
      </div>

      <input
        className="input input-bordered w-full max-w-sm"
        placeholder="Rechercher par titre ou ville…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Bien</th>
                <th>Type / Ville</th>
                <th>Prix</th>
                <th>Source</th>
                <th>Statut</th>
                <th>Vérifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-base-content/40">Aucun bien trouvé</td></tr>
              )}
              {filtered.map((b) => {
                const courtier = courtiers.find((c) => c._id === b.courierId);
                return (
                  <tr key={b._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BuildingIcon className="size-5 text-primary" />
                        </div>
                        <span className="font-medium">{b.titre}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost capitalize">{b.type}</span>
                      <p className="text-xs text-base-content/50 mt-1">{b.ville}</p>
                    </td>
                    <td className="font-semibold">{b.prix?.toLocaleString()} FCFA</td>
                    <td>
                      {courtier ? (
                        <div>
                          <span className="badge badge-info badge-sm">Courtier</span>
                          <p className="text-xs text-base-content/50 mt-1">{courtier.nom}</p>
                        </div>
                      ) : (
                        <span className="badge badge-success badge-sm">Nous</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-sm capitalize ${
                        b.statut === "disponible" ? "badge-success" :
                        b.statut === "loue" ? "badge-error" : "badge-warning"
                      }`}>{b.statut}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => toggleMut.mutate(b._id)}
                        title={b.verifie ? "Retirer la vérification" : "Marquer comme vérifié"}
                      >
                        {b.verifie
                          ? <CheckCircleIcon className="size-5 text-success" />
                          : <XCircleIcon className="size-5 text-base-content/30" />
                        }
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-xs" onClick={() => setModal({ mode: "edit", bien: b })}>
                          <PencilIcon className="size-4" />
                        </button>
                        <button className="btn btn-ghost btn-xs text-error"
                          onClick={() => { if (confirm("Supprimer ce bien ?")) deleteMut.mutate(b._id); }}>
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <BienForm
          bien={modal.bien}
          courtiers={courtiers}
          onClose={() => setModal(null)}
          onSubmit={(fd) => {
            if (modal.mode === "create") createMut.mutate(fd);
            else updateMut.mutate({ id: modal.bien._id, body: fd });
          }}
        />
      )}
    </div>
  );
}
