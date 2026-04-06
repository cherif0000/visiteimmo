import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = "oauth_google" | "oauth_apple";

export default function useSocialAuth() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const { isSignedIn } = useAuth();

  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startApple  } = useOAuth({ strategy: "oauth_apple"  });

  const handleSocialAuth = async (provider: OAuthProvider) => {
    // Déjà connecté → rediriger directement
    if (isSignedIn) {
      router.replace("/(tabs)");
      return;
    }

    setLoadingProvider(provider);
    try {
      const startFlow = provider === "oauth_google" ? startGoogle : startApple;
      const { createdSessionId, setActive } = await startFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      // Si déjà connecté malgré tout → rediriger
      if (err?.message?.includes("already signed in") || err?.errors?.[0]?.code === "identifier_already_signed_in") {
        router.replace("/(tabs)");
        return;
      }
      console.error("Social auth error:", err);
    } finally {
      setLoadingProvider(null);
    }
  };

  return { loadingProvider, handleSocialAuth };
}
