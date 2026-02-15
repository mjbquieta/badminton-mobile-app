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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clubName, setClubName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!clubName.trim()) {
      setError('Club name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, clubName.trim());
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = email && password && clubName.trim();

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
          <Text className="text-white text-3xl font-bold mb-2">
            Create Account
          </Text>
          <Text className="text-secondary text-base mb-8">
            Register to start managing your sessions
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

          <View className="mb-3">
            <Text className="text-secondary text-sm mb-1">Password</Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl bg-elevated border border-border text-white"
              placeholder="Min. 8 characters"
              placeholderTextColor={BadmintonPalette.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mb-6">
            <Text className="text-secondary text-sm mb-1">Club Name</Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl bg-elevated border border-border text-white"
              placeholder="Your club name"
              placeholderTextColor={BadmintonPalette.text.muted}
              value={clubName}
              onChangeText={setClubName}
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={submitting || !isValid}
            className="w-full py-3.5 rounded-xl bg-court-lime items-center"
            style={{ opacity: submitting || !isValid ? 0.5 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color={BadmintonPalette.text.onAccent} />
            ) : (
              <Text className="text-on-accent font-bold text-base">
                Register
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-secondary text-sm">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-court-lime text-sm font-semibold">
                Sign in
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
