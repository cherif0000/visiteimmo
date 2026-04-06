import express from "express";
import { requireAuth } from "@clerk/express";
import multer from "multer";
import {
  getDashboardStats,
  getAllBiens, createBien, updateBien, deleteBien, toggleVerifie,
  getAllDemandes, updateStatutDemande, deleteDemande,
  getAllBailleurs, createBailleur, updateBailleur, deleteBailleur,
  getAllCommissions,
  getAllClients,
} from "../controllers/admin.controller.js";
import {
  getBailleurPortal,
  getBailleurBiens,
  getBailleurCommissions,
  getBailleurDemandes,
} from "../controllers/bailleur.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(requireAuth());

// ── Stats admin ──────────────────────────────────────────
router.get("/stats", getDashboardStats);

// ── Biens ────────────────────────────────────────────────
router.get("/biens", getAllBiens);
router.post("/biens", upload.array("photos", 10), createBien);
router.put("/biens/:id", updateBien);
router.delete("/biens/:id", deleteBien);
router.patch("/biens/:id/verifie", toggleVerifie);

// ── Demandes ─────────────────────────────────────────────
router.get("/demandes", getAllDemandes);
router.patch("/demandes/:id/statut", updateStatutDemande);
router.delete("/demandes/:id", deleteDemande);

// ── Bailleurs ────────────────────────────────────────────
router.get("/bailleurs", getAllBailleurs);
router.post("/bailleurs", createBailleur);
router.put("/bailleurs/:id", updateBailleur);
router.delete("/bailleurs/:id", deleteBailleur);

// ── Portail Bailleur (accès bailleur connecté) ───────────
router.get("/bailleur-portal/stats",       getBailleurPortal);
router.get("/bailleur-portal/biens",       getBailleurBiens);
router.get("/bailleur-portal/commissions", getBailleurCommissions);
router.get("/bailleur-portal/demandes",    getBailleurDemandes);

// ── Commissions ──────────────────────────────────────────
router.get("/commissions", getAllCommissions);

// ── Clients ──────────────────────────────────────────────
router.get("/clients", getAllClients);

export default router;
