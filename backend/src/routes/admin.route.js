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

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Toutes les routes admin nécessitent auth Clerk
router.use(requireAuth());

// Stats
router.get("/stats", getDashboardStats);

// Biens
router.get("/biens", getAllBiens);
router.post("/biens", upload.array("photos", 10), createBien);
router.put("/biens/:id", updateBien);
router.delete("/biens/:id", deleteBien);
router.patch("/biens/:id/verifie", toggleVerifie);

// Demandes
router.get("/demandes", getAllDemandes);
router.patch("/demandes/:id/statut", updateStatutDemande);
router.delete("/demandes/:id", deleteDemande);

// Bailleurs
router.get("/bailleurs", getAllBailleurs);
router.post("/bailleurs", createBailleur);
router.put("/bailleurs/:id", updateBailleur);
router.delete("/bailleurs/:id", deleteBailleur);

// Commissions
router.get("/commissions", getAllCommissions);

// Clients
router.get("/clients", getAllClients);

export default router;
