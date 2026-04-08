import mongoose from "mongoose";

const bailleurSchema = new mongoose.Schema(
  {
    nom:       { type: String, required: true, trim: true },
    telephone: { type: String, default: "" },
    email:     { type: String, default: "" },
    type: {
      type: String,
      enum: ["particulier", "agence", "hotel"],
      default: "particulier",
    },
    clerkId:          { type: String, default: null, sparse: true },
    tauxCommission:   { type: Number, default: 10, min: 0, max: 100 },
    noteInterne:      { type: String, default: "" },
    actif:            { type: Boolean, default: true },
    adresse:          { type: String, default: "" },
    // Stats dénormalisées
    totalBiens:       { type: Number, default: 0 },
    totalLocations:   { type: Number, default: 0 },
    totalCommissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Bailleur = mongoose.model("Bailleur", bailleurSchema);
