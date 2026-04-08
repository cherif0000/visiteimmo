import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Props {
  icon?: string;
  title: string;
  message: string;
}

export default function LoginWall({ icon = "lock-closed-outline", title, message }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-5"
        style={{ backgroundColor: "#F0F0EC" }}
      >
        <Ionicons name={icon as any} size={30} color="#1A1A2E" />
      </View>
      <Text className="text-text-primary text-xl font-bold text-center mb-2">{title}</Text>
      <Text className="text-text-secondary text-sm text-center leading-5 mb-8">{message}</Text>
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
    </View>
  );
}
