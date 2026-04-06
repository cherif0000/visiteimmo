import mongoose from "mongoose";

const demandeSchema = new mongoose.Schema(
  {
    bien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bien",
      required: true,
    },
    // Client info (peut être lié à un user Clerk ou juste un contact)
    client: {
      nom: { type: String, required: true },
      telephone: { type: String, required: true },
      email: { type: String, default: "" },
      clerkId: { type: String, default: null }, // Si connecté
    },
    typeDemande: {
      type: String,
      enum: ["visite", "reservation"],
      default: "visite",
    },
    datePreferee: { type: Date, default: null },
    heureConfirmee: { type: Date, default: null },
    message: { type: String, default: "" },
    statut: {
      type: String,
      enum: ["nouveau", "en_cours", "confirme", "conclu", "annule"],
      default: "nouveau",
    },
    noteInterne: { type: String, default: "" },
    motifAnnulation: { type: String, default: "" },
    // Commission liée à cette demande si conclue
    commission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commission",
      default: null,
    },
    fraisDemande: { type: Number, default: 0 }, // 0 si gratuit, 1000-2000 si payant
    fraisPayes: { type: Boolean, default: false },
  },
  { timestamps: true }
);

demandeSchema.index({ statut: 1, createdAt: -1 });
demandeSchema.index({ "client.telephone": 1 });
demandeSchema.index({ bien: 1, statut: 1 });

export const Demande = mongoose.model("Demande", demandeSchema);
