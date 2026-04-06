import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bienApi, bailleurApi } from "../lib/api";
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, BuildingIcon, StarIcon } from "lucide-react";

// ✅ Types alignés avec le backend
const TYPES = [
  { value: "appartement", label: "Appartement" },
  { value: "maison",      label: "Maison" },
  { value: "hotel",       label: "Hôtel" },
  { value: "location_temporaire", label: "Court séjour" },
];

// ✅ Statuts alignés avec le backend
const STATUTS = [
  { value: "disponible",  label: "Disponible" },
  { value: "loue",        label: "Loué" },
  { value: "sur_demande", label: "Sur demande" },
];

const QUARTIERS = ["Almadies", "Mermoz", "Plateau", "Point E", "Fann", "Sacré-Cœur", "Ngor", "Ouakam", "Liberté", "Autre"];

function BienForm({ bien, bailleurs, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    titre:           bien?.titre ?? "",
    type:            bien?.type ?? "appartement",
    quartier:        bien?.quartier ?? "",
    adresse:         bien?.adresse ?? "",
    ville:           bien?.ville ?? "Dakar",
    prix:            bien?.prix ?? "",
    caution:         bien?.caution ?? "",
    surface:         bien?.surface ?? "",
    chambres:        bien?.chambres ?? "1",
    statut:          bien?.statut ?? "disponible",
    description:     bien?.description ?? "",
    meuble:          bien?.meuble ? "true" : "false",
    chargesIncluses: bien?.chargesIncluses ? "true" : "false",
    enVedette:       bien?.enVedette ? "true" : "false",
    bailleur:        bien?.bailleur?._id ?? bien?.bailleur ?? "",
    tauxCommission:  bien?.tauxCommission ?? "",
  });

  const [photos, setPhotos] = useState([]);
  const aUnBailleur = !!form.bailleur;

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
    });
    photos.forEach((p) => fd.append("photos", p));
    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-base-content/10 flex items-center justify-between sticky top-0 bg-base-100 z-10">
          <h3 className="text-lg font-bold">{bien ? "Modifier le bien" : "Ajouter un bien"}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Bailleur lié */}
          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Propriétaire / Bailleur</span></label>
            <select name="bailleur" className="select select-bordered w-full" value={form.bailleur} onChange={handle}>
              <option value="">🏠 Bien propre (pas de bailleur)</option>
              {bailleurs.map((b) => (
                <option key={b._id} value={b._id}>
                  👤 {b.nom} {b.agence ? `— ${b.agence}` : ""}
                </option>
              ))}
            </select>
          </div>

          {aUnBailleur && (
            <div className="form-control">
              <label className="label"><span className="label-text">Taux de commission (%)</span></label>
              <input name="tauxCommission" type="number" min="0" max="100" className="input input-bordered"
                placeholder="Ex: 100" value={form.tauxCommission} onChange={handle} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">

            {/* Titre */}
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Titre *</span></label>
              <input name="titre" required className="input input-bordered" value={form.titre} onChange={handle}
                placeholder="Ex: Appartement 3P lumineux Plateau" />
            </div>

            {/* Type */}
            <div className="form-control">
              <label className="label"><span className="label-text">Type *</span></label>
              <select name="type" required className="select select-bordered" value={form.type} onChange={handle}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Statut */}
            <div className="form-control">
              <label className="label"><span className="label-text">Statut</span></label>
              <select name="statut" className="select select-bordered" value={form.statut} onChange={handle}>
                {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Quartier */}
            <div className="form-control">
              <label className="label"><span className="label-text">Quartier *</span></label>
              <select name="quartier" required className="select select-bordered" value={form.quartier} onChange={handle}>
                <option value="">— Choisir —</option>
                {QUARTIERS.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            {/* Ville */}
            <div className="form-control">
              <label className="label"><span className="label-text">Ville *</span></label>
              <input name="ville" required className="input input-bordered" value={form.ville} onChange={handle} placeholder="Dakar" />
            </div>

            {/* Adresse */}
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Adresse *</span></label>
              <input name="adresse" required className="input input-bordered" value={form.adresse} onChange={handle}
                placeholder="Ex: 12 Rue du Plateau" />
            </div>

            {/* Prix */}
            <div className="form-control">
              <label className="label"><span className="label-text">Prix / mois (FCFA) *</span></label>
              <input name="prix" required type="number" min="0" className="input input-bordered" value={form.prix} onChange={handle} />
            </div>

            {/* Caution */}
            <div className="form-control">
              <label className="label"><span className="label-text">Caution (FCFA)</span></label>
              <input name="caution" type="number" min="0" className="input input-bordered" value={form.caution} onChange={handle} placeholder="0" />
            </div>

            {/* Surface */}
            <div className="form-control">
              <label className="label"><span className="label-text">Surface (m²)</span></label>
              <input name="surface" type="number" min="0" className="input input-bordered" value={form.surface} onChange={handle} />
            </div>

            {/* Chambres */}
            <div className="form-control">
              <label className="label"><span className="label-text">Chambres</span></label>
              <input name="chambres" type="number" min="1" className="input input-bordered" value={form.chambres} onChange={handle} />
            </div>

            {/* Meublé */}
            <div className="form-control">
              <label className="label"><span className="label-text">Meublé</span></label>
              <select name="meuble" className="select select-bordered" value={form.meuble} onChange={handle}>
                <option value="false">Non meublé</option>
                <option value="true">Meublé</option>
              </select>
            </div>

            {/* Charges */}
            <div className="form-control">
              <label className="label"><span className="label-text">Charges incluses</span></label>
              <select name="chargesIncluses" className="select select-bordered" value={form.chargesIncluses} onChange={handle}>
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </div>

            {/* En vedette */}
            <div className="form-control col-span-2">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox checkbox-warning"
                  checked={form.enVedette === "true"}
                  onChange={(e) => setForm((f) => ({ ...f, enVedette: e.target.checked ? "true" : "false" }))} />
                <span className="label-text font-medium">⭐ Mettre en vedette (affiché en premier)</span>
              </label>
            </div>

            {/* Description */}
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Description *</span></label>
              <textarea name="description" required rows={3} className="textarea textarea-bordered"
                value={form.description} onChange={handle}
                placeholder="Décrivez le bien : luminosité, équipements, proximité transports..." />
            </div>

            {/* Photos */}
            <div className="form-control col-span-2">
              <label className="label"><span className="label-text">Photos (max 10)</span></label>
              <input type="file" multiple accept="image/*" className="file-input file-input-bordered w-full"
                onChange={(e) => setPhotos(Array.from(e.target.files))} />
              {photos.length > 0 && (
                <p className="text-xs text-success mt-1">{photos.length} photo(s) sélectionnée(s)</p>
              )}
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-base-content/10">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary gap-2" disabled={isLoading}>
              {isLoading && <span className="loading loading-spinner loading-xs" />}
              {bien ? "Enregistrer les modifications" : "Ajouter le bien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BiensPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const { data: biens = [], isLoading } = useQuery({
    queryKey: ["biens"],
    queryFn: () => bienApi.getAll(),
  });

  const { data: bailleurs = [] } = useQuery({
    queryKey: ["bailleurs"],
    queryFn: bailleurApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: bienApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["biens"] }); setModal(null); },
    onError: (err) => alert("Erreur création : " + (err?.response?.data?.message ?? err.message)),
  });

  const updateMut = useMutation({
    mutationFn: bienApi.update,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["biens"] }); setModal(null); },
    onError: (err) => alert("Erreur modification : " + (err?.response?.data?.message ?? err.message)),
  });

  const deleteMut = useMutation({
    mutationFn: bienApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["biens"] }),
  });

  const toggleMut = useMutation({
    mutationFn: bienApi.toggleVerifie,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["biens"] }),
  });

  const filtered = biens
    .filter((b) => !filterStatut || b.statut === filterStatut)
    .filter((b) =>
      b.titre?.toLowerCase().includes(search.toLowerCase()) ||
      b.quartier?.toLowerCase().includes(search.toLowerCase()) ||
      b.ville?.toLowerCase().includes(search.toLowerCase())
    );

  const STATUT_BADGE = {
    disponible:  "badge-success",
    loue:        "badge-error",
    sur_demande: "badge-warning",
  };
  const STATUT_LABEL = {
    disponible:  "Disponible",
    loue:        "Loué",
    sur_demande: "Sur demande",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Biens</h2>
          <p className="text-base-content/50 text-sm">{biens.length} bien(s) au total</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setModal({ mode: "create" })}>
          <PlusIcon className="size-4" /> Ajouter un bien
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input input-bordered flex-1"
          placeholder="Rechercher par titre, quartier ou ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/10">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Bien</th>
                <th>Localisation</th>
                <th>Prix / mois</th>
                <th>Bailleur</th>
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
                const bailleur = bailleurs.find((ba) => ba._id === (b.bailleur?._id ?? b.bailleur));
                return (
                  <tr key={b._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {b.photos?.[0] ? (
                          <img src={b.photos[0]} className="size-10 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BuildingIcon className="size-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{b.titre}</p>
                          {b.enVedette && <span className="text-xs text-warning">⭐ Vedette</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost capitalize text-xs">{b.type}</span>
                      <p className="text-xs text-base-content/50 mt-0.5">{b.quartier}, {b.ville}</p>
                    </td>
                    <td className="font-semibold text-sm">{b.prix?.toLocaleString("fr-FR")} FCFA</td>
                    <td>
                      {bailleur ? (
                        <div>
                          <span className="badge badge-info badge-sm">Bailleur</span>
                          <p className="text-xs text-base-content/50 mt-0.5">{bailleur.nom}</p>
                        </div>
                      ) : (
                        <span className="badge badge-success badge-sm">Nous</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${STATUT_BADGE[b.statut] ?? "badge-ghost"}`}>
                        {STATUT_LABEL[b.statut] ?? b.statut}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-xs" onClick={() => toggleMut.mutate(b._id)}
                        title={b.verifie ? "Retirer la vérification" : "Marquer vérifié"}>
                        {b.verifie
                          ? <CheckCircleIcon className="size-5 text-success" />
                          : <XCircleIcon className="size-5 text-base-content/30" />}
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
          bailleurs={bailleurs}
          isLoading={createMut.isPending || updateMut.isPending}
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
