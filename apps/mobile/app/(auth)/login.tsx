import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@badminton/firebase';
import { BadmintonPalette } from '@/constants/palette';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
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
    <SafeAreaView className="flex-1 bg-base">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-white text-3xl font-bold mb-2">Sign In</Text>
          <Text className="text-secondary text-base mb-8">
            Welcome back to Smash Potato
          </Text>

          {error ? (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <Text className="text-red-500 text-sm">{error}</Text>
            </View>
          ) : null}

          <View className="mb-3">
            <Text className="text-secondary text-sm mb-1">Email</Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl bg-elevated border border-border text-white"
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
            <Text className="text-secondary text-sm mb-1">Password</Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl bg-elevated border border-border text-white"
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
            className="w-full py-3.5 rounded-xl bg-court-lime items-center"
            style={{ opacity: submitting || !email || !password ? 0.5 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color={BadmintonPalette.text.onAccent} />
            ) : (
              <Text className="text-on-accent font-bold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-secondary text-sm">
              Don&apos;t have an account?{' '}
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
