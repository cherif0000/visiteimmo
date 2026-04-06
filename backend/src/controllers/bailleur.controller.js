import { Bien } from "../models/bien.model.js";
import { Demande } from "../models/demande.model.js";
import { Commission } from "../models/commission.model.js";
import { Bailleur } from "../models/bailleur.model.js";

// Le bailleur s'identifie via son clerkId stocké dans Bailleur.clerkId
// On retrouve son profil bailleur via getAuth(req).userId

const getBailleurFromClerk = async (clerkId) => {
  return await Bailleur.findOne({ clerkId });
};

export const getBailleurPortal = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const bailleur = await getBailleurFromClerk(clerkId);
    if (!bailleur) return res.status(404).json({ message: "Profil bailleur non trouvé" });

    const [biens, demandes, commissions] = await Promise.all([
      Bien.find({ bailleur: bailleur._id }),
      Demande.find({}).populate({ path: "bien", match: { bailleur: bailleur._id } }),
      Commission.find({ bailleur: bailleur._id }),
    ]);

    const biensValides = biens;
    const demandesValides = demandes.filter((d) => d.bien !== null);

    const revenuBrut = biensValides.reduce((s, b) => s + (b.prix || 0), 0);
    const commissionsTotales = commissions.reduce((s, c) => s + (c.montant || 0), 0);
    const resteAPayer = commissions.reduce((s, c) => s + (c.loyer - c.montant), 0);

    res.json({
      bailleur,
      stats: {
        totalBiens: biensValides.length,
        biensDisponibles: biensValides.filter((b) => b.statut === "disponible").length,
        biensLoues: biensValides.filter((b) => b.statut === "loue").length,
        biensSurDemande: biensValides.filter((b) => b.statut === "sur_demande").length,
        totalDemandes: demandesValides.length,
        demandesNouvelles: demandesValides.filter((d) => d.statut === "nouveau").length,
        commissionsTotales,
        resteAPayer,
        revenuBrut,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getBailleurBiens = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const bailleur = await getBailleurFromClerk(clerkId);
    if (!bailleur) return res.status(404).json({ message: "Profil bailleur non trouvé" });

    const biens = await Bien.find({ bailleur: bailleur._id }).sort({ createdAt: -1 });
    res.json(biens);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getBailleurCommissions = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const bailleur = await getBailleurFromClerk(clerkId);
    if (!bailleur) return res.status(404).json({ message: "Profil bailleur non trouvé" });

    const commissions = await Commission.find({ bailleur: bailleur._id })
      .populate("bien", "titre quartier prix")
      .populate("demande")
      .sort({ createdAt: -1 });

    const total = commissions.reduce((s, c) => s + c.montant, 0);
    const resteAPayer = commissions.reduce((s, c) => s + (c.loyer - c.montant), 0);

    res.json({ commissions, total, resteAPayer });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getBailleurDemandes = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const bailleur = await getBailleurFromClerk(clerkId);
    if (!bailleur) return res.status(404).json({ message: "Profil bailleur non trouvé" });

    const biens = await Bien.find({ bailleur: bailleur._id }).select("_id");
    const bienIds = biens.map((b) => b._id);

    const demandes = await Demande.find({ bien: { $in: bienIds } })
      .populate("bien", "titre quartier prix photos")
      .sort({ createdAt: -1 });

    res.json(demandes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
