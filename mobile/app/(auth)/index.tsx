import {
  View, Text, TouchableOpacity, ActivityIndicator, Image,
} from "react-native";
import useSocialAuth from "@/hooks/useSocialAuth";
import { Ionicons } from "@expo/vector-icons";

const GOLD = "#D4A843";
const NAVY = "#0F2236";

export default function AuthScreen() {
  const { loadingProvider, handleSocialAuth } = useSocialAuth();

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">

      {/* Logo / Branding */}
      <View className="items-center mb-12">
        <View
          className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
          style={{ backgroundColor: GOLD }}
        >
          <Ionicons name="home" size={48} color={NAVY} />
        </View>
        <Text className="text-text-primary text-3xl font-bold tracking-tight">
          VisiteImmobilier
        </Text>
        <Text className="text-text-secondary text-base mt-2 text-center">
          La plateforme de confiance pour la{"\n"}location immobilière à Dakar
        </Text>
      </View>

      {/* Value props */}
      <View className="w-full mb-10 space-y-3">
        {[
          { icon: "shield-checkmark", text: "Annonces vérifiées sur le terrain" },
          { icon: "search",           text: "Recherche avancée par quartier & prix" },
          { icon: "calendar",         text: "Demande de visite en 1 clic" },
        ].map((item) => (
          <View key={item.text} className="flex-row items-center gap-3">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: GOLD + "25" }}
            >
              <Ionicons name={item.icon as any} size={16} color={GOLD} />
            </View>
            <Text className="text-text-secondary text-sm">{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Auth buttons */}
      <View className="w-full gap-3">
        {/* Google */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white rounded-2xl py-4 px-6"
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={loadingProvider !== null}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            elevation: 3,
          }}
          activeOpacity={0.85}
        >
          {loadingProvider === "oauth_google" ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <>
              <Image
                source={require("../../assets/images/google.png")}
                style={{ width: 22, height: 22, marginRight: 12 }}
                resizeMode="contain"
              />
              <Text className="text-gray-800 font-semibold text-base">
                Continuer avec Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-black rounded-2xl py-4 px-6 border border-white/10"
          onPress={() => handleSocialAuth("oauth_apple")}
          disabled={loadingProvider !== null}
          activeOpacity={0.85}
        >
          {loadingProvider === "oauth_apple" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Image
                source={require("../../assets/images/apple.png")}
                style={{ width: 22, height: 22, marginRight: 12 }}
                resizeMode="contain"
              />
              <Text className="text-white font-semibold text-base">
                Continuer avec Apple
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text className="text-text-tertiary text-xs text-center mt-8 leading-5 px-4">
        En vous connectant, vous acceptez nos{" "}
        <Text style={{ color: GOLD }}>Conditions d'utilisation</Text>
        {" "}et notre{" "}
        <Text style={{ color: GOLD }}>Politique de confidentialité</Text>.
      </Text>
    </View>
  );
}
