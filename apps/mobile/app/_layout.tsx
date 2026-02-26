import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Stack, useSegments, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import "./globals.css";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 bg-base items-center justify-center">
        <ActivityIndicator size="large" color="#84CC16" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
