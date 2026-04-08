import mongoose from "mongoose";

const bienSchema = new mongoose.Schema(
  {
    // ── Identité ──────────────────────────────────────────
    titre:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["appartement", "maison", "hotel", "location_temporaire"],
      required: true,
    },
    statut: {
      type: String,
      enum: ["disponible", "loue", "sur_demande"],
      default: "disponible",
    },

    // ── Localisation ──────────────────────────────────────
    quartier: { type: String, required: true },
    adresse:  { type: String, required: true },
    ville:    { type: String, default: "Dakar" },
    // Immeuble : étage et numéro/niveau du logement
    etage:       { type: Number, default: null },   // ex: 2 → "2ème étage"
    numeroBien:  { type: String, default: "" },     // ex: "Appt 4B" ou "Porte 12"

    // ── Caractéristiques ──────────────────────────────────
    prix:            { type: Number, required: true },
    caution:         { type: Number, default: 0 },
    chargesIncluses: { type: Boolean, default: false },
    meuble:          { type: Boolean, default: false },
    chambres:        { type: Number, default: 1 },
    surface:         { type: Number, default: null },

    // ── Médias ────────────────────────────────────────────
    photos:    [{ type: String }],
    verifie:   { type: Boolean, default: false },
    enVedette: { type: Boolean, default: false },
    vues:      { type: Number, default: 0 },

    // ── Bailleur (propriétaire) ───────────────────────────
    bailleur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bailleur",
      default: null,
    },
    tauxCommission: { type: Number, default: null },
  },
  { timestamps: true }
);

bienSchema.index({ quartier: 1, type: 1, prix: 1, statut: 1 });
bienSchema.index({ titre: "text", description: "text", quartier: "text", adresse: "text" });

export const Bien = mongoose.model("Bien", bienSchema);
