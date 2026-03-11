'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FiEye, FiX } from 'react-icons/fi';

export function ImpersonationBanner() {
  const { isImpersonating, impersonationTarget, stopImpersonation } = useAuth();

  if (!isImpersonating || !impersonationTarget) return null;

  return (
    <div className="bg-warning/15 border-b border-warning/30 px-4 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 min-w-0">
        <FiEye size={16} className="text-warning shrink-0" />
        <p className="text-warning text-sm font-semibold truncate">
          Support Access: Viewing as{' '}
          <span className="font-bold">{impersonationTarget.email}</span>
          <span className="text-warning/70 font-normal"> ({impersonationTarget.clubName})</span>
        </p>
      </div>
      <button
        onClick={stopImpersonation}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-warning text-primary hover:bg-warning/80 transition-colors shrink-0"
      >
        <FiX size={12} />
        Exit
      </button>
    </div>
  );
}
