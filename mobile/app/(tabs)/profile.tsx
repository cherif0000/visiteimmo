import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const GOLD = "#D4A843";
const NAVY = "#0F2236";

const MENU_ITEMS = [
  { id: 1, icon: "heart",               title: "Biens favoris",     color: "#EF4444", action: "/(tabs)/favoris"  },
  { id: 2, icon: "document-text",       title: "Mes demandes",      color: "#10B981", action: "/(tabs)/demandes" },
  { id: 3, icon: "notifications",       title: "Notifications",     color: "#8B5CF6", action: null               },
  { id: 4, icon: "help-circle",         title: "Aide & FAQ",        color: "#F59E0B", action: null               },
] as const;

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <SafeScreen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-text-primary text-2xl font-bold mb-4">Mon profil</Text>

          <View className="bg-surface rounded-3xl p-5">
            <View className="flex-row items-center gap-4">
              <View className="relative">
                <Image
                  source={user?.imageUrl}
                  style={{ width: 72, height: 72, borderRadius: 36 }}
                  transition={200}
                />
                <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center border-2 border-surface"
                  style={{ backgroundColor: GOLD }}>
                  <Ionicons name="checkmark" size={13} color={NAVY} />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-xl font-bold">{user?.firstName} {user?.lastName}</Text>
                <Text className="text-text-secondary text-sm mt-0.5">{user?.emailAddresses?.[0]?.emailAddress}</Text>
                <View className="flex-row items-center gap-1 mt-1.5">
                  <View className="w-2 h-2 rounded-full bg-green-400" />
                  <Text className="text-green-400 text-xs font-medium">Compte actif</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Menu items */}
        <View className="px-5">
          <View className="flex-row flex-wrap gap-3 mb-4">
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-surface rounded-2xl p-5 items-center justify-center"
                style={{ width: "47.5%" }}
                activeOpacity={0.7}
                onPress={() => item.action && router.push(item.action as any)}
              >
                <View
                  className="rounded-full w-14 h-14 items-center justify-center mb-3"
                  style={{ backgroundColor: item.color + "20" }}
                >
                  <Ionicons name={item.icon as any} size={26} color={item.color} />
                </View>
                <Text className="text-text-primary font-bold text-sm text-center">{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* A propos */}
          <View className="bg-surface rounded-2xl p-4 mb-3">
            <View className="flex-row items-center gap-3 py-2">
              <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: GOLD + "20" }}>
                <Ionicons name="information-circle" size={20} color={GOLD} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold">À propos de VisiteImmobilier</Text>
                <Text className="text-text-secondary text-xs mt-0.5">La plateforme de confiance à Dakar</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#4A6580" />
            </View>
          </View>

          {/* Déconnexion */}
          <TouchableOpacity
            className="bg-surface rounded-2xl py-4 flex-row items-center justify-center border-2 mb-3"
            style={{ borderColor: "#EF444430" }}
            activeOpacity={0.8}
            onPress={() => signOut()}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold text-base ml-2">Se déconnecter</Text>
          </TouchableOpacity>

          {/* App version */}
          <Text className="text-center text-text-secondary text-xs opacity-40 mt-2">
            VisiteImmobilier v1.0 • Dakar, Sénégal
          </Text>
        </View>

      </ScrollView>
    </SafeScreen>
  );
}
