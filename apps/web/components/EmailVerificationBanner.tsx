'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@badminton/firebase';
import { UNVERIFIED_LIMITS } from '@badminton/ui-shared';

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
    <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="text-accent font-semibold text-sm">Verify your email</p>
        <p className="text-light-300 text-xs mt-0.5">
          Unverified accounts are limited to {UNVERIFIED_LIMITS.MAX_PLAYERS} players and {UNVERIFIED_LIMITS.MAX_COURTS} courts.
          {sent && ' Verification email sent! Check your inbox.'}
        </p>
        {error && <p className="text-danger text-xs mt-1">{error}</p>}
      </div>
      <button
        onClick={handleResend}
        disabled={sending || sent}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-primary hover:bg-accent/80 disabled:opacity-50 shrink-0"
      >
        {sending ? 'Sending...' : sent ? 'Sent!' : 'Resend email'}
      </button>
    </div>
  );
}
