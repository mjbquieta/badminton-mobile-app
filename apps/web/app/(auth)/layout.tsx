'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function AuthRedirectGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/home');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return <>{children}</>;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthRedirectGuard>
        <div className="flex items-center justify-center min-h-screen px-4">
          {children}
        </div>
      </AuthRedirectGuard>
    </AuthProvider>
  );
}
