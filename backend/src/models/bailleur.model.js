import mongoose from "mongoose";

const bailleurSchema = new mongoose.Schema(
  {
    nom:       { type: String, required: true, trim: true },
    telephone: { type: String, required: true },
    email:     { type: String, default: "" },
    type: {
      type: String,
      enum: ["particulier", "agence", "hotel"],
      default: "particulier",
    },
    // Clerk ID pour accès portail bailleur
    clerkId: { type: String, default: null, sparse: true },
    tauxCommission: { type: Number, required: true, min: 0, max: 100 },
    contrat:        { type: String, default: "" },
    noteInterne:    { type: String, default: "" },
    actif:          { type: Boolean, default: true },
    adresse:        { type: String, default: "" },
    totalBiens:     { type: Number, default: 0 },
    totalLocations: { type: Number, default: 0 },
    totalCommissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Bailleur = mongoose.model("Bailleur", bailleurSchema);
