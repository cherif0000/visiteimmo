import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    demande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Demande",
      required: true,
    },
    bien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bien",
      required: true,
    },
    bailleur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bailleur",
      default: null, // null = bien propre (100%)
    },
    loyer: { type: Number, required: true }, // FCFA
    taux: { type: Number, required: true },  // % appliqué
    montant: { type: Number, required: true }, // FCFA perçu
    type: {
      type: String,
      enum: ["location", "reservation_hotel", "frais_visite"],
      default: "location",
    },
    mois: { type: String }, // "2025-04" pour regroupement mensuel
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

commissionSchema.index({ mois: 1 });
commissionSchema.index({ bailleur: 1, createdAt: -1 });

export const Commission = mongoose.model("Commission", commissionSchema);
