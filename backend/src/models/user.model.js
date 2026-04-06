import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    // Biens sauvegardés en favoris
    favoris: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bien" }],
    // Préférences de recherche sauvegardées
    rechercheSauvegardee: [
      {
        label: { type: String },
        filtres: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    notificationsActives: { type: Boolean, default: true },
    pushToken: { type: String, default: "" }, // Expo push token
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
