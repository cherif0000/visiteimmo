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

// ── Upload ────────────────────────────────────────────────
// Upload une photo et retourne l'objet complet (secure_url + public_id).
// Retourne null si Cloudinary n'est pas configuré.
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

// ── Suppression ───────────────────────────────────────────
// Supprime une liste de photos Cloudinary à partir de leurs URLs publiques.
// Utilisé lors de la suppression d'un bien pour éviter la fuite de stockage.
//
// Comment ça marche :
// L'URL Cloudinary suit le format :
//   https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{public_id}.{ext}
// On extrait le public_id en coupant tout ce qui se trouve après "/upload/" et
// en retirant l'extension finale. Le public_id inclut le dossier (ex: "visiteimmo/biens/abc123").
export async function deletePhotos(photoUrls = []) {
  if (!configured || !photoUrls.length) return;

  const publicIds = photoUrls
    .map((url) => {
      try {
        // Extrait la partie après "/upload/" puis retire les transformations (ex: "c_fill,w_1200/")
        const afterUpload = url.split("/upload/")[1];
        if (!afterUpload) return null;
        // Retire les éventuels segments de transformation (contiennent "_" ou "," ou des chiffres)
        const parts = afterUpload.split("/");
        // Le public_id commence après les segments de transformation
        // Les segments de transfo contiennent toujours "," ou ":" — le public_id commence au premier sans
        const idWithExt = parts.find((p) => !p.includes(",") && !p.includes(":")) ?? parts[parts.length - 1];
        // Retire l'extension (.jpg, .png, .webp...)
        return idWithExt.replace(/\.[^/.]+$/, "");
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (!publicIds.length) return;

  try {
    // delete_resources accepte jusqu'à 100 public_ids en une seule requête
    await cloudinary.api.delete_resources(publicIds);
    console.log(`🗑️  Cloudinary : ${publicIds.length} photo(s) supprimée(s)`);
  } catch (err) {
    // Ne pas bloquer la suppression du bien si Cloudinary échoue
    console.error("⚠️  Cloudinary deletePhotos error:", err?.message ?? err);
  }
}

export default cloudinary;