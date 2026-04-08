import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import SafeScreen from "@/components/SafeScreen";
import LoginWall from "@/components/LoginWall";
import { userApi } from "@/lib/api";

function formatPrix(p: number) {
  return new Intl.NumberFormat("fr-FR").format(p) + " FCFA";
}

export default function FavorisScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["favoris"],
    queryFn:  userApi.getFavoris,
    enabled:  !!isSignedIn,
  });

  const toggleMut = useMutation({
    mutationFn: (bienId: string) => userApi.toggleFavori(bienId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["favoris"] }),
    onError:    () => Alert.alert("Erreur", "Impossible de modifier les favoris."),
  });

  const handleRemove = (bienId: string, titre: string) => {
    Alert.alert(
      "Retirer des favoris",
      `Retirer "${titre}" de tes favoris ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Retirer", style: "destructive", onPress: () => toggleMut.mutate(bienId) },
      ]
    );
  };

  // ── Mur de connexion ─────────────────────────────────
  if (!isLoaded) return null;
  if (!isSignedIn) {
    return (
      <SafeScreen>
        <View className="px-5 pt-6 pb-2">
          <Text className="text-text-primary text-2xl font-extrabold">Sauvegardés</Text>
        </View>
        <LoginWall
          icon="heart-outline"
          title="Sauvegardez vos biens préférés"
          message="Connectez-vous pour retrouver facilement les biens qui vous intéressent."
        />
      </SafeScreen>
    );
  }

  const biens: any[] = data?.favoris ?? [];

  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-text-primary text-2xl font-extrabold">Sauvegardés</Text>
          <Text className="text-text-secondary text-sm mt-0.5">
            {biens.length} bien{biens.length !== 1 ? "s" : ""} sauvegardé{biens.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "#FEF2F2" }}>
          <Ionicons name="heart" size={20} color="#DC2626" />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1A1A2E" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="wifi-outline" size={48} color="#9AA0AA" />
          <Text className="text-text-primary font-bold mt-3">Erreur de connexion</Text>
          <TouchableOpacity className="mt-4 px-6 py-2.5 rounded-xl"
            style={{ backgroundColor: "#1A1A2E" }} onPress={() => refetch()}>
            <Text className="text-white font-semibold text-sm">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : biens.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: "#F0F0EC" }}>
            <Ionicons name="heart-outline" size={30} color="#9AA0AA" />
          </View>
          <Text className="text-text-primary font-bold text-lg">Aucun favori</Text>
          <Text className="text-text-secondary text-sm mt-2 text-center leading-5">
            Appuie sur le cœur d'un bien pour le retrouver ici.
          </Text>
          <TouchableOpacity
            className="mt-6 px-8 py-3.5 rounded-2xl"
            style={{ backgroundColor: "#1A1A2E" }}
            onPress={() => router.push("/(tabs)")}
          >
            <Text className="text-white font-bold">Explorer les biens</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {biens.map((b: any) => (
            <View key={b._id} className="bg-surface rounded-2xl overflow-hidden mb-4"
              style={{ borderWidth: 1, borderColor: "#E5E5E0",
                shadowColor: "#1A1A2E", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, elevation: 2 }}>
              <TouchableOpacity activeOpacity={0.88} onPress={() => router.push(`/bien/${b._id}`)}>
                {/* Photo */}
                <View className="relative">
                  {b.photos?.[0] ? (
                    <Image source={{ uri: b.photos[0] }} style={{ width: "100%", height: 160 }} contentFit="cover" />
                  ) : (
                    <View style={{ width: "100%", height: 160 }} className="items-center justify-center"
                      style={{ backgroundColor: "#F0F0EC" }}>
                      <Ionicons name="image-outline" size={40} color="#9AA0AA" />
                    </View>
                  )}
                  {b.verifie && (
                    <View className="absolute top-3 left-3 flex-row items-center gap-1 px-2 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.92)" }}>
                      <Ionicons name="shield-checkmark" size={11} color="#16A34A" />
                      <Text className="text-xs font-bold" style={{ color: "#16A34A" }}>Vérifié</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                    onPress={() => handleRemove(b._id, b.titre)}
                    disabled={toggleMut.isPending}
                  >
                    <Ionicons name="heart" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>

                {/* Infos */}
                <View className="p-4">
                  <Text className="text-text-primary font-bold text-base mb-1" numberOfLines={1}>
                    {b.titre}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={13} color="#9AA0AA" />
                    <Text className="text-text-secondary text-sm ml-1">{b.quartier}, {b.ville}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-text-primary text-lg font-extrabold">
                      {formatPrix(b.prix)}
                      <Text className="text-text-secondary text-xs font-normal"> /mois</Text>
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="bed-outline" size={14} color="#9AA0AA" />
                      <Text className="text-text-secondary text-sm">{b.chambres} ch.</Text>
                      {b.meuble && (
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0F0EC" }}>
                          <Text className="text-text-secondary text-xs">Meublé</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* CTA */}
              <View className="px-4 pb-4">
                <TouchableOpacity
                  className="w-full py-3 rounded-xl items-center"
                  style={{ backgroundColor: "#1A1A2E" }}
                  onPress={() => router.push(`/bien/${b._id}`)}
                >
                  <Text className="font-bold text-sm text-white">Voir le bien</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeScreen>
  );
}
