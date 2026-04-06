import { getAuth } from "@clerk/express";

// Middleware : vérifie que l'utilisateur est connecté via Clerk
export const requireAdmin = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ message: "Non autorisé — connexion requise" });
  }
  req.auth = auth;
  next();
};
