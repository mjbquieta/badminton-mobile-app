'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'lg' | 'xl';
}

const sizeClasses = {
  default: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
} as const;

export function Modal({ open, onClose, title, children, size = 'default' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const maxWidthClass = sizeClasses[size];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={`backdrop:bg-black/60 bg-secondary border border-dark-100 rounded-2xl p-0 w-full ${maxWidthClass} text-light-100 shadow-elevated`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-light-300 hover:text-light-100 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
