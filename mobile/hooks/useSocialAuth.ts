import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = "oauth_google" | "oauth_apple";

export default function useSocialAuth() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startApple  } = useOAuth({ strategy: "oauth_apple"  });

  const handleSocialAuth = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    try {
      const startFlow = provider === "oauth_google" ? startGoogle : startApple;
      const { createdSessionId, setActive } = await startFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("Social auth error:", err);
    } finally {
      setLoadingProvider(null);
    }
  };

  return { loadingProvider, handleSocialAuth };
}