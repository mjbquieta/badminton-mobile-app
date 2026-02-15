'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@badminton/firebase';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clubName, setClubName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      router.replace('/');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary border border-dark-100 rounded-2xl p-8 w-full max-w-md">
      <h1 className="text-2xl font-bold mb-2">Create Account</h1>
      <p className="text-light-300 text-sm mb-6">
        Register to start managing your badminton sessions
      </p>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 mb-4">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-light-200 mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 text-light-100 placeholder:text-light-300 focus:outline-none focus:border-accent/50"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-sm text-light-200 mb-1 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 text-light-100 placeholder:text-light-300 focus:outline-none focus:border-accent/50"
            placeholder="Min. 8 characters"
          />
        </div>
        <div>
          <label className="text-sm text-light-200 mb-1 block">Club Name</label>
          <input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 text-light-100 placeholder:text-light-300 focus:outline-none focus:border-accent/50"
            placeholder="Your club name"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="text-light-300 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
