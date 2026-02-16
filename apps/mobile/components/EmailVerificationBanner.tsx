import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@badminton/firebase';
import { BadmintonPalette, UNVERIFIED_LIMITS } from '@badminton/ui-shared';
import AntDesign from '@expo/vector-icons/AntDesign';

export function EmailVerificationBanner() {
  const { emailVerified, sendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (emailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    setError('');
    try {
      await sendVerificationEmail();
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{
        backgroundColor: `${BadmintonPalette.accent.primary}15`,
        borderWidth: 1,
        borderColor: `${BadmintonPalette.accent.primary}40`,
      }}
    >
      <View className="flex-row items-center mb-2">
        <AntDesign name="mail" size={16} color={BadmintonPalette.accent.primary} />
        <Text
          className="text-sm font-bold ml-2"
          style={{ color: BadmintonPalette.accent.primary }}
        >
          Verify your email
        </Text>
      </View>
      <Text
        className="text-xs mb-3"
        style={{ color: BadmintonPalette.text.secondary }}
      >
        {`Unverified accounts are limited to ${UNVERIFIED_LIMITS.MAX_PLAYERS} players and ${UNVERIFIED_LIMITS.MAX_COURTS} courts.`}
        {sent ? ' Verification email sent! Check your inbox.' : ''}
      </Text>
      {error ? (
        <Text
          className="text-xs mb-2"
          style={{ color: BadmintonPalette.accent.danger }}
        >
          {error}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={handleResend}
        disabled={sending || sent}
        className="py-2.5 rounded-xl items-center"
        style={{
          backgroundColor: BadmintonPalette.accent.primary,
          opacity: sending || sent ? 0.5 : 1,
        }}
      >
        <Text
          className="text-xs font-bold"
          style={{ color: BadmintonPalette.bg.base }}
        >
          {sending ? 'Sending...' : sent ? 'Sent!' : 'Resend email'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
