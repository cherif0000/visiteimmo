import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.DB_URL);
    console.log(`✅ MongoDB connecté : ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB :", error.message);
    process.exit(1);
  }
};
