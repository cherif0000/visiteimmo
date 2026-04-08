import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useSocialAuth from "@/hooks/useSocialAuth";

export default function AuthScreen() {
  const { loadingProvider, handleSocialAuth } = useSocialAuth();

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">

      {/* Logo */}
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
          style={{ backgroundColor: "#1A1A2E" }}>
          <Ionicons name="home" size={40} color="#fff" />
        </View>
        <Text className="text-text-primary text-3xl font-extrabold tracking-tight">
          VisiteImmobilier
        </Text>
        <Text className="text-text-secondary text-base mt-2 text-center leading-6">
          La plateforme immobilière{"\n"}de confiance à Dakar
        </Text>
      </View>

      {/* Value props */}
      <View className="w-full mb-10 space-y-3">
        {[
          { icon: "shield-checkmark-outline", text: "Annonces vérifiées sur le terrain" },
          { icon: "search-outline",            text: "Recherche avancée par quartier & prix" },
          { icon: "calendar-outline",          text: "Demande de visite en 1 clic" },
        ].map((item) => (
          <View key={item.text} className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: "#F0F0EC" }}>
              <Ionicons name={item.icon as any} size={16} color="#1A1A2E" />
            </View>
            <Text className="text-text-secondary text-sm flex-1">{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Boutons */}
      <View className="w-full space-y-3">
        {/* Google */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white rounded-2xl py-4 px-6"
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={loadingProvider !== null}
          style={{
            borderWidth: 1.5, borderColor: "#E5E5E0",
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06, elevation: 2,
          }}
          activeOpacity={0.85}
        >
          {loadingProvider === "oauth_google" ? (
            <ActivityIndicator size="small" color="#1A1A2E" />
          ) : (
            <>
              <Image source={require("../../assets/images/google.png")}
                style={{ width: 20, height: 20, marginRight: 12 }} resizeMode="contain" />
              <Text style={{ color: "#1A1A2E", fontWeight: "600", fontSize: 16 }}>
                Continuer avec Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-2xl py-4 px-6"
          onPress={() => handleSocialAuth("oauth_apple")}
          disabled={loadingProvider !== null}
          style={{ backgroundColor: "#1A1A2E" }}
          activeOpacity={0.85}
        >
          {loadingProvider === "oauth_apple" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Image source={require("../../assets/images/apple.png")}
                style={{ width: 20, height: 20, marginRight: 12 }} resizeMode="contain" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                Continuer avec Apple
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-text-muted text-xs text-center mt-8 leading-5 px-4">
        En vous connectant, vous acceptez nos{" "}
        <Text className="text-text-secondary">Conditions d'utilisation</Text>
        {" "}et notre{" "}
        <Text className="text-text-secondary">Politique de confidentialité</Text>.
      </Text>
    </View>
  );
}
