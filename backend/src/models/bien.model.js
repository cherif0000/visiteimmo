import mongoose from "mongoose";

const bienSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
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
    prix: { type: Number, required: true }, // FCFA / mois
    caution: { type: Number, default: 0 },
    chargesIncluses: { type: Boolean, default: false },
    meuble: { type: Boolean, default: false },
    chambres: { type: Number, default: 1 },
    surface: { type: Number }, // m²
    quartier: { type: String, required: true },
    adresse: { type: String, required: true },
    ville: { type: String, default: "Dakar" },
    coordonnees: {
      lat: { type: Number },
      lng: { type: Number },
    },
    photos: [{ type: String }], // Cloudinary URLs
    verifie: { type: Boolean, default: false },
    enVedette: { type: Boolean, default: false },
    // Si appartient à un bailleur partenaire
    bailleur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bailleur",
      default: null,
    },
    // Commission: null = 100% (bien propre), sinon % bailleur
    tauxCommission: { type: Number, default: null },
    vues: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index pour la recherche
bienSchema.index({ quartier: 1, type: 1, prix: 1, statut: 1 });
bienSchema.index({ titre: "text", description: "text", quartier: "text" });

export const Bien = mongoose.model("Bien", bienSchema);
