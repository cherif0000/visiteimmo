import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ACTIVE   = "#1A1A2E";
const TAB_INACTIVE = "#9AA0AA";

export default function TabsLayout() {
  const { isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) return null;

  // Pas de redirection — les guests peuvent accéder aux tabs
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth:  1,
          borderTopColor:  "#E5E5E0",
          height:          56 + insets.bottom,
          shadowColor:     "#000",
          shadowOffset:    { width: 0, height: -1 },
          shadowOpacity:   0.04,
          elevation:       6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index"
        options={{ title: "Rechercher",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }} />
      <Tabs.Screen name="favoris"
        options={{ title: "Sauvegardés",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} /> }} />
      <Tabs.Screen name="demandes"
        options={{ title: "Demandes",
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} /> }} />
      <Tabs.Screen name="profile"
        options={{ title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />
    </Tabs>
  );
}
