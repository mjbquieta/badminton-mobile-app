import { BadmintonPalette } from "@/constants/palette";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@badminton/firebase";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-light-100 text-3xl font-bold mb-2">
            Sign In
          </Text>
          <Text className="text-light-200 text-base mb-8">
            Welcome back to RallyUp
          </Text>

          {error ? (
            <View className="bg-danger/10 border border-danger/30 rounded-xl p-3 mb-4">
              <Text className="text-danger text-sm">{error}</Text>
            </View>
          ) : null}

          <View className="mb-3">
            <Text className="text-light-200 text-sm mb-1">Email</Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl bg-dark-200 border border-dark-100 text-light-100"
              placeholder="you@example.com"
              placeholderTextColor={BadmintonPalette.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-6">
            <Text className="text-light-200 text-sm mb-1">Password</Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl bg-dark-200 border border-dark-100 text-light-100"
              placeholder="Enter your password"
              placeholderTextColor={BadmintonPalette.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={submitting || !email || !password}
            className="w-full py-3.5 rounded-xl bg-accent items-center"
            style={{ opacity: submitting || !email || !password ? 0.5 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color={BadmintonPalette.text.onAccent} />
            ) : (
              <Text className="text-primary font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-light-300 text-sm">
              Don&apos;t have an account?{" "}
            </Text>
            <Link href="/(auth)/register">
              <Text className="text-court-lime text-sm font-semibold">
                Register
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
