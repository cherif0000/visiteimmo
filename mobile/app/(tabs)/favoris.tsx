import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { userApi } from "@/lib/api";

const GOLD = "#D4A843";
const NAVY = "#0F2236";

function formatPrix(p: number) {
  return new Intl.NumberFormat("fr-FR").format(p) + " FCFA";
}

export default function FavorisScreen() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["favoris"],
    queryFn: userApi.getFavoris,
  });

  const toggleMut = useMutation({
    mutationFn: (bienId: string) => userApi.toggleFavori(bienId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favoris"] });
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de modifier les favoris.");
    },
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

  const biens: any[] = data?.favoris ?? [];

  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-text-primary text-2xl font-bold">Sauvegardés</Text>
          <Text className="text-text-secondary text-sm mt-0.5">
            {biens.length} bien{biens.length !== 1 ? "s" : ""} sauvegardé{biens.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: "#C0593D20" }}>
          <Ionicons name="heart" size={20} color="#C0593D" />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={GOLD} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="wifi-outline" size={56} color="#4A6580" />
          <Text className="text-text-primary font-bold text-lg mt-4">Erreur de connexion</Text>
          <Text className="text-text-secondary text-sm mt-2 text-center">
            Vérifie ta connexion et réessaie.
          </Text>
        </View>
      ) : biens.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="heart-outline" size={64} color="#4A6580" />
          <Text className="text-text-primary font-bold text-lg mt-4">Aucun favori</Text>
          <Text className="text-text-secondary text-sm mt-2 text-center">
            Appuie sur le cœur d'un bien pour le sauvegarder ici.
          </Text>
          <TouchableOpacity
            className="mt-6 px-8 py-3 rounded-2xl"
            style={{ backgroundColor: GOLD }}
            onPress={() => router.push("/(tabs)")}
          >
            <Text className="font-bold" style={{ color: NAVY }}>Explorer les biens</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {biens.map((b: any) => (
            <View
              key={b._id}
              className="bg-surface rounded-2xl overflow-hidden mb-4"
              style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, elevation: 2 }}
            >
              <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/bien/${b._id}`)}>
                <View className="relative">
                  {b.photos?.[0] ? (
                    <Image
                      source={{ uri: b.photos[0] }}
                      style={{ width: "100%", height: 160 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={{ width: "100%", height: 160 }} className="bg-background items-center justify-center">
                      <Ionicons name="image-outline" size={40} color="#4A6580" />
                    </View>
                  )}
                  {b.verifie && (
                    <View
                      className="absolute top-3 left-3 flex-row items-center gap-1 px-2 py-1 rounded-full"
                      style={{ backgroundColor: GOLD + "EE" }}
                    >
                      <Ionicons name="shield-checkmark" size={11} color={NAVY} />
                      <Text className="text-xs font-bold" style={{ color: NAVY }}>Vérifié</Text>
                    </View>
                  )}
                  {/* Bouton retirer favori */}
                  <TouchableOpacity
                    className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                    onPress={() => handleRemove(b._id, b.titre)}
                    disabled={toggleMut.isPending}
                  >
                    <Ionicons name="heart" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View className="p-4">
                  <Text className="text-text-primary font-bold text-base mb-1" numberOfLines={1}>
                    {b.titre}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={13} color="#8DA3B5" />
                    <Text className="text-text-secondary text-sm ml-1">{b.quartier}, {b.ville}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text style={{ color: GOLD }} className="text-lg font-bold">
                      {formatPrix(b.prix)}
                      <Text className="text-text-secondary text-xs font-normal"> /mois</Text>
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="bed-outline" size={14} color="#8DA3B5" />
                      <Text className="text-text-secondary text-sm">{b.chambres} ch.</Text>
                      {b.meuble && (
                        <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: GOLD + "25" }}>
                          <Text style={{ color: GOLD }} className="text-xs font-semibold">Meublé</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View className="px-4 pb-4">
                <TouchableOpacity
                  className="w-full py-3 rounded-xl items-center"
                  style={{ backgroundColor: GOLD }}
                  onPress={() => router.push(`/bien/${b._id}`)}
                >
                  <Text className="font-bold text-sm" style={{ color: NAVY }}>Voir le bien</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeScreen>
  );
}
