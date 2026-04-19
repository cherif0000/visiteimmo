import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bienApi } from "../lib/api";
import {
  PlusIcon, PencilIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon, BuildingIcon,
  LayersIcon, HashIcon,
} from "lucide-react";

const TYPES = [
  { value: "appartement",        label: "Appartement" },
  { value: "maison",             label: "Maison / Villa" },
  { value: "hotel",              label: "Hôtel / Résidence" },
  { value: "location_temporaire", label: "Court séjour" },
];
const STATUTS = [
  { value: "disponible",  label: "Disponible" },
  { value: "loue",        label: "Loué" },
  { value: "sur_demande", label: "Sur demande" },
];
const QUARTIERS = [
  "Almadies","Mermoz","Plateau","Point E","Fann",
  "Sacré-Cœur","Ngor","Ouakam","Liberté","Grand Dakar","Autre",
];

// ── Formulaire ────────────────────────────────────────────
function BienForm({ bien, onSubmit, onClose, isLoading }) {
  const estImmeuble = ["appartement", "hotel", "location_temporaire"];

  const [form, setForm] = useState({
    // Bailleur inline
    nomBailleur:       bien?.bailleur?.nom ?? "",
    telephoneBailleur: bien?.bailleur?.telephone ?? "",
    emailBailleur:     bien?.bailleur?.email ?? "",
    tauxCommission:    bien?.tauxCommission ?? "10",
    // Bien
    titre:           bien?.titre ?? "",
    type:            bien?.type ?? "appartement",
    statut:          bien?.statut ?? "disponible",
    quartier:        bien?.quartier ?? "",
    adresse:         bien?.adresse ?? "",
    ville:           bien?.ville ?? "Dakar",
    etage:           bien?.etage ?? "",
    numeroBien:      bien?.numeroBien ?? "",
    prix:            bien?.prix ?? "",
    caution:         bien?.caution ?? "",
    surface:         bien?.surface ?? "",
    chambres:        bien?.chambres ?? "1",
    meuble:          bien?.meuble ? "true" : "false",
    chargesIncluses: bien?.chargesIncluses ? "true" : "false",
    enVedette:       bien?.enVedette ? "true" : "false",
    description:     bien?.description ?? "",
  });
  const [photos, setPhotos] = useState([]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const showImmeuble = estImmeuble.includes(form.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) fd.append(k, String(v));
    });
    photos.forEach((p) => fd.append("photos", p));
    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="p-5 border-b border-base-content/10 flex items-center justify-between sticky top-0 bg-base-100 z-10">
          <h3 className="text-lg font-bold">{bien ? "Modifier le bien" : "Ajouter un bien"}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* ── Section Bailleur ─────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
              <h4 className="font-semibold">Propriétaire (bailleur)</h4>
            </div>
            <div className="bg-base-200 rounded-xl p-4 space-y-3">
              <p className="text-xs text-base-content/50">
                Entrez le nom du propriétaire. S'il n'existe pas encore, il sera créé automatiquement.
                Laissez vide si le bien vous appartient directement.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control col-span-2">
                  <label className="label py-1"><span className="label-text text-sm">Nom du bailleur</span></label>
                  <input name="nomBailleur" className="input input-bordered input-sm"
                    value={form.nomBailleur} onChange={handle}
                    placeholder="Ex: Mamadou Diallo (laisser vide si bien propre)" />
                </div>
                {form.nomBailleur && (
                  <>
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-sm">Téléphone</span></label>
                      <input name="telephoneBailleur" className="input input-bordered input-sm"
                        value={form.telephoneBailleur} onChange={handle} placeholder="+221 77 000 00 00" />
                    </div>
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-sm">Commission (%)</span></label>
                      <input name="tauxCommission" type="number" min="0" max="100"
                        className="input input-bordered input-sm"
                        value={form.tauxCommission} onChange={handle} placeholder="10" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Section Informations du bien ─────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
              <h4 className="font-semibold">Informations du bien</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">

              <div className="form-control col-span-2">
                <label className="label py-1"><span className="label-text text-sm">Titre *</span></label>
                <input name="titre" required className="input input-bordered"
                  value={form.titre} onChange={handle}
                  placeholder="Ex: Appartement 3 pièces lumineux Plateau" />
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Type *</span></label>
                <select name="type" required className="select select-bordered" value={form.type} onChange={handle}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Statut</span></label>
                <select name="statut" className="select select-bordered" value={form.statut} onChange={handle}>
                  {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Quartier *</span></label>
                <select name="quartier" required className="select select-bordered" value={form.quartier} onChange={handle}>
                  <option value="">— Choisir —</option>
                  {QUARTIERS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Ville *</span></label>
                <input name="ville" required className="input input-bordered"
                  value={form.ville} onChange={handle} placeholder="Dakar" />
              </div>

              <div className="form-control col-span-2">
                <label className="label py-1"><span className="label-text text-sm">Adresse *</span></label>
                <input name="adresse" required className="input input-bordered"
                  value={form.adresse} onChange={handle} placeholder="Ex: 12 Rue Mermoz" />
              </div>

              {/* Immeuble : étage + numéro */}
              {showImmeuble && (
                <>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm flex items-center gap-1">
                        <LayersIcon className="size-3.5" /> Étage
                      </span>
                      <span className="label-text-alt text-base-content/40">Laisser vide si RDC</span>
                    </label>
                    <input name="etage" type="number" min="0" max="100"
                      className="input input-bordered"
                      value={form.etage} onChange={handle} placeholder="Ex: 2" />
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm flex items-center gap-1">
                        <HashIcon className="size-3.5" /> N° / Référence logement
                      </span>
                    </label>
                    <input name="numeroBien" className="input input-bordered"
                      value={form.numeroBien} onChange={handle} placeholder="Ex: Appt 4B, Porte 12" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Section Prix & Caractéristiques ─────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
              <h4 className="font-semibold">Prix & Caractéristiques</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Prix / mois (FCFA) *</span></label>
                <input name="prix" required type="number" min="0" className="input input-bordered"
                  value={form.prix} onChange={handle} />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Caution (FCFA)</span></label>
                <input name="caution" type="number" min="0" className="input input-bordered"
                  value={form.caution} onChange={handle} placeholder="0" />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Surface (m²)</span></label>
                <input name="surface" type="number" min="0" className="input input-bordered"
                  value={form.surface} onChange={handle} />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Chambres</span></label>
                <input name="chambres" type="number" min="1" className="input input-bordered"
                  value={form.chambres} onChange={handle} />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Meublé</span></label>
                <select name="meuble" className="select select-bordered" value={form.meuble} onChange={handle}>
                  <option value="false">Non meublé</option>
                  <option value="true">Meublé</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Charges incluses</span></label>
                <select name="chargesIncluses" className="select select-bordered" value={form.chargesIncluses} onChange={handle}>
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>
              <div className="form-control col-span-2">
                <label className="label cursor-pointer justify-start gap-3">
                  <input type="checkbox" className="checkbox checkbox-warning"
                    checked={form.enVedette === "true"}
                    onChange={(e) => setForm((f) => ({ ...f, enVedette: e.target.checked ? "true" : "false" }))} />
                  <span className="label-text">⭐ Mettre en vedette (affiché en premier)</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Section Description & Photos ─────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">4</div>
              <h4 className="font-semibold">Description & Photos</h4>
            </div>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Description *</span></label>
                <textarea name="description" required rows={3} className="textarea textarea-bordered"
                  value={form.description} onChange={handle}
                  placeholder="Décrivez le bien : luminosité, équipements, proximité transports..." />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Photos (max 10)</span></label>
                <input type="file" multiple accept="image/*" className="file-input file-input-bordered w-full"
                  onChange={(e) => setPhotos(Array.from(e.target.files))} />
                {photos.length > 0 && <p className="text-xs text-success mt-1">{photos.length} photo(s) sélectionnée(s)</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
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

// ── Page principale ───────────────────────────────────────
export default function BiensPage() {
  const qc = useQueryClient();
  const [modal, setModal]   = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const { data: biens = [], isLoading } = useQuery({
    queryKey: ["biens"],
    queryFn:  bienApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: bienApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["biens"] }); setModal(null); },
    onError: (err) => {
      const status = err?.response?.status ?? "?";
      const msg = err?.response?.data?.message ?? err.message;
      alert(`Erreur ${status} : ${msg}`);
      console.error("createBien error:", err?.response?.data ?? err);
    },
  });
  const updateMut = useMutation({
    mutationFn: bienApi.update,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["biens"] }); setModal(null); },
    onError: (err) => {
      const status = err?.response?.status ?? "?";
      const msg = err?.response?.data?.message ?? err.message;
      alert(`Erreur ${status} : ${msg}`);
      console.error("updateBien error:", err?.response?.data ?? err);
    },
  });
  const deleteMut = useMutation({
    mutationFn: bienApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["biens"] }),
  });
  const toggleMut = useMutation({
    mutationFn: bienApi.toggleVerifie,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["biens"] }),
  });

  const STATUT_BADGE = { disponible: "badge-success", loue: "badge-error", sur_demande: "badge-warning" };
  const STATUT_LABEL = { disponible: "Disponible", loue: "Loué", sur_demande: "Sur demande" };

  const filtered = biens
    .filter((b) => !filterStatut || b.statut === filterStatut)
    .filter((b) =>
      !search ||
      b.titre?.toLowerCase().includes(search.toLowerCase()) ||
      b.quartier?.toLowerCase().includes(search.toLowerCase()) ||
      b.bailleur?.nom?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Biens</h2>
          <p className="text-base-content/50 text-sm">{biens.length} bien(s) — {biens.filter(b => b.statut === "disponible").length} disponibles</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setModal({ mode: "create" })}>
          <PlusIcon className="size-4" /> Ajouter un bien
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input className="input input-bordered flex-1" placeholder="Rechercher par titre, quartier ou bailleur…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select select-bordered" value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
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
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {b.photos?.[0]
                        ? <img src={b.photos[0]} className="size-10 rounded-lg object-cover" alt="" />
                        : <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center"><BuildingIcon className="size-5 text-primary" /></div>
                      }
                      <div>
                        <p className="font-medium">{b.titre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="badge badge-ghost badge-xs capitalize">{b.type}</span>
                          {b.etage !== null && b.etage !== undefined &&
                            <span className="badge badge-outline badge-xs">
                              <LayersIcon className="size-2.5 mr-0.5" />Ét. {b.etage}
                            </span>}
                          {b.numeroBien &&
                            <span className="badge badge-outline badge-xs">
                              <HashIcon className="size-2.5 mr-0.5" />{b.numeroBien}
                            </span>}
                          {b.enVedette && <span className="text-xs">⭐</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm">{b.quartier}, {b.ville}</p>
                    <p className="text-xs text-base-content/40">{b.adresse}</p>
                  </td>
                  <td className="font-semibold text-sm">{b.prix?.toLocaleString("fr-FR")} FCFA</td>
                  <td>
                    {b.bailleur
                      ? <div>
                          <p className="text-sm font-medium">{b.bailleur.nom}</p>
                          <p className="text-xs text-base-content/40">{b.tauxCommission}% commission</p>
                        </div>
                      : <span className="badge badge-success badge-sm">Bien propre</span>
                    }
                  </td>
                  <td>
                    <span className={`badge badge-sm ${STATUT_BADGE[b.statut] ?? "badge-ghost"}`}>
                      {STATUT_LABEL[b.statut] ?? b.statut}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-xs" onClick={() => toggleMut.mutate(b._id)}>
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <BienForm
          bien={modal.bien}
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
