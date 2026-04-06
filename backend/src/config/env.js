import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT:            process.env.PORT            ?? 5000,
  NODE_ENV:        process.env.NODE_ENV        ?? "development",
  DB_URL:          process.env.MONGODB_URI     ?? "",
  CLIENT_URL:      process.env.CLIENT_URL      ?? "http://localhost:5173",
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME ?? "",
  CLOUDINARY_KEY:  process.env.CLOUDINARY_KEY  ?? "",
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET ?? "",
};

// Validation au démarrage
const required = ["DB_URL"];
required.forEach((key) => {
  if (!ENV[key]) {
    console.error(`❌ Missing env variable: ${key}`);
    process.exit(1);
  }
});
