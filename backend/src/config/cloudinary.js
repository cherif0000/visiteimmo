import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

const configured = ENV.CLOUDINARY_NAME && ENV.CLOUDINARY_KEY && ENV.CLOUDINARY_SECRET;

if (configured) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_NAME,
    api_key:    ENV.CLOUDINARY_KEY,
    api_secret: ENV.CLOUDINARY_SECRET,
  });
}

// Upload une photo — retourne null si Cloudinary non configuré
export async function uploadPhoto(filePath) {
  if (!configured) {
    console.warn("⚠️  Cloudinary non configuré — photo ignorée.");
    return null;
  }
  return cloudinary.uploader.upload(filePath, {
    folder: "visiteimmo/biens",
    transformation: [{ width: 1200, height: 800, crop: "fill", quality: "auto" }],
  });
}

export default cloudinary;
