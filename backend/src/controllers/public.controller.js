import { getAuth } from "@clerk/express";
import { Bien }    from "../models/bien.model.js";
import { Demande } from "../models/demande.model.js";
import { User }    from "../models/user.model.js";

// ── Helper : lire le clerkId depuis req ──────────────────
// req.auth est posé par requireAuthJson (routes authentifiées).
// Pour les routes optionnelles on appelle getAuth(req) directement.
const getClerkId = (req) => req.auth?.userId ?? getAuth(req)?.userId ?? null;

// ── Recherche publique de biens ──────────────────────────
export const searchBiens = async (req, res) => {
  try {
    const {
      type, quartier, prixMin, prixMax, meuble,
      chambres, statut, search, page = 1, limit = 20,
    } = req.query;

    const filtre = { statut: statut || "disponible" };
    if (type)     filtre.type     = type;
    if (quartier) filtre.quartier = new RegExp(quartier, "i");
    if (meuble !== undefined) filtre.meuble = meuble === "true";
    if (chambres) filtre.chambres = { $gte: Number(chambres) };
    if (prixMin || prixMax) {
      filtre.prix = {};
      if (prixMin) filtre.prix.$gte = Number(prixMin);
      if (prixMax) filtre.prix.$lte = Number(prixMax);
    }
    if (search) filtre.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [biens, total] = await Promise.all([
      Bien.find(filtre)
        .select("-bailleur -tauxCommission -noteInterne")
        .sort({ enVedette: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Bien.countDocuments(filtre),
    ]);

    res.json({
      biens, total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("searchBiens:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getBienById = async (req, res) => {
  try {
    const bien = await Bien.findById(req.params.id)
      .select("-bailleur -tauxCommission");
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });
    await Bien.findByIdAndUpdate(req.params.id, { $inc: { vues: 1 } });
    res.json(bien);
  } catch (err) {
    console.error("getBienById:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Créer une demande de visite ──────────────────────────
export const createDemande = async (req, res) => {
  try {
    const { bienId, nom, telephone, email, typeDemande, datePreferee, message } = req.body;

    // Route sans auth obligatoire : getAuth() retourne null si non connecté
    const clerkId = getClerkId(req);

    const bien = await Bien.findById(bienId);
    if (!bien)              return res.status(404).json({ message: "Bien non trouvé" });
    if (bien.statut === "loue") return res.status(400).json({ message: "Ce bien n'est plus disponible" });

    const existing = await Demande.findOne({
      bien: bienId,
      "client.telephone": telephone,
      statut: { $in: ["nouveau", "en_cours", "confirme"] },
    });
    if (existing) return res.status(400).json({ message: "Vous avez déjà une demande en cours pour ce bien" });

    const demande = new Demande({
      bien: bienId,
      client: { nom, telephone, email: email || "", clerkId },
      typeDemande:  typeDemande || "visite",
      datePreferee: datePreferee ? new Date(datePreferee) : null,
      message:      message || "",
    });
    await demande.save();

    res.status(201).json({
      message: "Votre demande a été reçue ✅. Nous vous contacterons sous peu pour confirmer.",
      demande,
    });
  } catch (err) {
    console.error("createDemande:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Favoris : récupérer la liste ─────────────────────────
export const getFavoris = async (req, res) => {
  try {
    const clerkId = getClerkId(req);
    const user = await User.findOne({ clerkId }).populate({
      path: "favoris",
      select: "-bailleur -tauxCommission -noteInterne",
    });
    if (!user) return res.json({ favoris: [] });
    res.json({ favoris: user.favoris ?? [] });
  } catch (err) {
    console.error("getFavoris:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Favoris : toggle ─────────────────────────────────────
export const toggleFavori = async (req, res) => {
  try {
    const clerkId = getClerkId(req);
    const { bienId } = req.body;

    // upsert : crée le user à la volée s'il n'existe pas encore
    // (race condition : nouveau compte → l'user tape le cœur avant la fin du sync)
    let user = await User.findOneAndUpdate(
      { clerkId },
      { $setOnInsert: { clerkId, nom: "Utilisateur", email: "", imageUrl: "" } },
      { upsert: true, new: true }
    );

    const isFavori = user.favoris.map(String).includes(bienId);
    if (isFavori) {
      user.favoris = user.favoris.filter((id) => id.toString() !== bienId);
    } else {
      user.favoris.push(bienId);
    }
    await user.save();

    res.json({ favoris: user.favoris, isFavori: !isFavori });
  } catch (err) {
    console.error("toggleFavori:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Demandes du client connecté ──────────────────────────
export const getMesDemandes = async (req, res) => {
  try {
    const clerkId = getClerkId(req);
    const demandes = await Demande.find({ "client.clerkId": clerkId })
      .populate("bien", "titre quartier prix photos type")
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch (err) {
    console.error("getMesDemandes:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Sync user Clerk → MongoDB ─────────────────────────────
// React 19 StrictMode (actif par défaut en dev avec expo-router v6) execute
// les useEffect DEUX FOIS en développement → deux appels syncUser simultanés
// dès le démarrage → si le user n'existe pas encore, les deux tentent INSERT
// → E11000 duplicate key sur clerkId → 500.
//
// Solution : findOneAndUpdate avec upsert:true est une opération ATOMIQUE côté
// MongoDB. Si deux appels arrivent en même temps :
//   - Premier appel  → trouve rien → crée le doc → succès
//   - Deuxième appel → trouve le doc (créé par le 1er) → met à jour → succès
// Plus de race condition, plus de 500.
export const syncUser = async (req, res) => {
  try {
    const clerkId = getClerkId(req);

    if (!clerkId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { firstName, lastName, emailAddresses, imageUrl } = req.body;

    const nom   = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Utilisateur";
    const email = emailAddresses?.[0]?.emailAddress ?? "";

    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          nom,
          imageUrl: imageUrl || "",
          // email seulement si non vide pour ne pas écraser un email existant par ""
          ...(email ? { email } : {}),
        },
        // $setOnInsert s'applique UNIQUEMENT lors de la création (pas de l'update)
        $setOnInsert: {
          clerkId,
          favoris: [],
          ...(email ? {} : { email: "" }),
        },
      },
      {
        upsert:              true,   // crée si absent
        new:                 true,   // retourne le doc après modification
        setDefaultsOnInsert: true,   // applique les valeurs par défaut du schéma
      }
    );

    res.json(user);
  } catch (err) {
    // E11000 = duplicate key : deux appels simultanés ont tous les deux tenté
    // d'insérer le même clerkId. Le document existe déjà → on le retourne.
    if (err.code === 11000) {
      try {
        const existing = await User.findOne({ clerkId: getClerkId(req) });
        return res.json(existing);
      } catch {
        return res.status(500).json({ message: "Erreur sync (duplicate)" });
      }
    }
    console.error("syncUser:", err);
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
};