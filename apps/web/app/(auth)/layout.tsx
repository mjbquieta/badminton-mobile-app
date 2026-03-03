'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

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
        <div className="min-h-screen flex flex-col relative">
          {/* Ambient glow */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-court-deep/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
          </div>
          <PublicNavbar />
          <main className="flex-1 flex items-center justify-center px-4 py-12">
            {children}
          </main>
          <PublicFooter />
        </div>
      </AuthRedirectGuard>
    </AuthProvider>
  );
}
