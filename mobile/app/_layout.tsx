import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { setAuthToken, userApi } from "@/lib/api";

const tokenCache = {
  async getToken(key: string) {
    try { return await SecureStore.getItemAsync(key); }
    catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { await SecureStore.setItemAsync(key, value); }
    catch {}
  },
};

const queryClient = new QueryClient();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function AuthSetup() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const qc = useQueryClient();

  useEffect(() => {
    // ── Déconnexion ───────────────────────────────────────
    // Bug corrigé : sans qc.clear(), React Query gardait en cache les données
    // de l'utilisateur A et les servait immédiatement à l'utilisateur B après
    // reconnexion — c'est pourquoi un nouveau compte voyait les demandes/favoris
    // d'un autre client.
    if (!isSignedIn || !user) {
      setAuthToken(null);
      qc.clear(); // ← vide TOUT le cache : favoris, demandes, biens, etc.
      return;
    }

    // ── Connexion ─────────────────────────────────────────
    (async () => {
      const token = await getToken();
      setAuthToken(token);

      // Bug corrigé : les queries (mesDemandes, favoris) démarraient AVANT que
      // setAuthToken ait fini (getToken est asynchrone). Elles partaient sans
      // token → 401 → React Query les marquait en erreur et ne réessayait plus.
      // En appelant invalidateQueries() APRÈS avoir injecté le token, on force
      // un rechargement propre avec les bons en-têtes d'authentification.
      qc.invalidateQueries();

      // Sync MongoDB : crée ou met à jour le profil du client.
      // Sans ça, l'utilisateur n'apparaissait pas dans le dashboard admin (clients).
      try {
        await userApi.sync({
          firstName: user.firstName,
          lastName:  user.lastName,
          emailAddresses: user.emailAddresses,
          imageUrl: user.imageUrl,
        });
        // Rafraîchir la liste des clients côté admin si elle est en cache
        qc.invalidateQueries({ queryKey: ["clients"] });
      } catch (e) {
        if (__DEV__) console.warn("[sync] Échec de la synchronisation utilisateur :", e);
      }
    })();
  }, [isSignedIn, user?.id]);

  return null;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <AuthSetup />
          {/* Pas de redirection forcée — les guests peuvent naviguer */}
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}