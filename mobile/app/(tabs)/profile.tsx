import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

// ── Vue non connecté ──────────────────────────────────────
function GuestProfile() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Avatar placeholder */}
      <View className="w-20 h-20 rounded-full items-center justify-center mb-5"
        style={{ backgroundColor: "#F0F0EC", borderWidth: 2, borderColor: "#E5E5E0" }}>
        <Ionicons name="person-outline" size={36} color="#9AA0AA" />
      </View>

      <Text className="text-text-primary text-xl font-extrabold text-center mb-1">
        Bienvenue
      </Text>
      <Text className="text-text-secondary text-sm text-center leading-5 mb-8">
        Connectez-vous pour accéder à vos favoris, suivre vos demandes de visite et gérer votre profil.
      </Text>

      <TouchableOpacity
        className="w-full py-4 rounded-2xl items-center mb-3"
        style={{ backgroundColor: "#1A1A2E" }}
        onPress={() => router.push("/(auth)")}
      >
        <Text className="text-white font-bold text-base">Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full py-4 rounded-2xl items-center"
        style={{ borderWidth: 1.5, borderColor: "#E5E5E0" }}
        onPress={() => router.push("/(auth)")}
      >
        <Text className="text-text-primary font-semibold text-base">Créer un compte</Text>
      </TouchableOpacity>

      <Text className="text-text-muted text-xs text-center mt-8 leading-5 px-4">
        En vous connectant, vous acceptez nos{" "}
        <Text className="text-text-secondary font-medium">Conditions d'utilisation</Text>
        {" "}et notre{" "}
        <Text className="text-text-secondary font-medium">Politique de confidentialité</Text>.
      </Text>
    </View>
  );
}

// ── Vue connecté ──────────────────────────────────────────
const MENU = [
  { id: 1, icon: "heart-outline",         title: "Mes favoris",    sub: "Biens sauvegardés",        action: "/(tabs)/favoris"  },
  { id: 2, icon: "document-text-outline", title: "Mes demandes",   sub: "Visites & réservations",   action: "/(tabs)/demandes" },
  { id: 3, icon: "notifications-outline", title: "Notifications",  sub: "Alertes et mises à jour",  action: null               },
  { id: 4, icon: "help-circle-outline",   title: "Aide & Support", sub: "FAQ et contact",           action: null               },
] as const;

function ConnectedProfile() {
  const { signOut } = useAuth();
  const { user }    = useUser();

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header profil */}
      <View className="px-5 pt-6 pb-5">
        <Text className="text-text-primary text-2xl font-extrabold mb-4">Mon profil</Text>

        <View className="bg-surface rounded-2xl p-5"
          style={{ borderWidth: 1, borderColor: "#E5E5E0" }}>
          <View className="flex-row items-center gap-4">
            <View className="relative">
              {user?.imageUrl ? (
                <Image
                  source={user.imageUrl}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                  transition={200}
                />
              ) : (
                <View className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#F0F0EC" }}>
                  <Ionicons name="person" size={28} color="#5C6472" />
                </View>
              )}
              {/* Badge actif */}
              <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: "#16A34A", borderWidth: 2, borderColor: "#fff" }}>
                <View className="w-2 h-2 rounded-full bg-white" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-lg font-extrabold">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-text-secondary text-sm mt-0.5">
                {user?.emailAddresses?.[0]?.emailAddress}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1.5">
                <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#16A34A" }} />
                <Text className="text-xs font-medium" style={{ color: "#16A34A" }}>Compte actif</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View className="px-5">
        <View className="bg-surface rounded-2xl overflow-hidden mb-4"
          style={{ borderWidth: 1, borderColor: "#E5E5E0" }}>
          {MENU.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center gap-4 px-4 py-4"
              style={{
                borderBottomWidth: index < MENU.length - 1 ? 1 : 0,
                borderBottomColor: "#F0F0EC",
              }}
              activeOpacity={0.7}
              onPress={() => item.action && router.push(item.action as any)}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: "#F0F0EC" }}>
                <Ionicons name={item.icon as any} size={20} color="#1A1A2E" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-sm">{item.title}</Text>
                <Text className="text-text-muted text-xs mt-0.5">{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9AA0AA" />
            </TouchableOpacity>
          ))}
        </View>

        {/* À propos */}
        <View className="bg-surface rounded-2xl p-4 mb-4"
          style={{ borderWidth: 1, borderColor: "#E5E5E0" }}>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "#F0F0EC" }}>
              <Ionicons name="information-circle-outline" size={20} color="#1A1A2E" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-sm">VisiteImmobilier</Text>
              <Text className="text-text-muted text-xs mt-0.5">La plateforme de confiance à Dakar</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9AA0AA" />
          </View>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl mb-2"
          style={{ borderWidth: 1.5, borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }}
          activeOpacity={0.8}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text className="font-bold text-sm ml-2" style={{ color: "#DC2626" }}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text className="text-center text-text-muted text-xs mt-3">
          VisiteImmobilier v1.0 • Dakar, Sénégal
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Export principal ──────────────────────────────────────
export default function ProfileScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <SafeScreen>
      {isSignedIn ? <ConnectedProfile /> : <GuestProfile />}
    </SafeScreen>
  );
}
