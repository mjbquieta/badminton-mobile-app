"use client";

import { Modal } from "./Modal";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { FiCheck, FiClipboard } from "react-icons/fi";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  pin: string;
}

export function QRCodeModal({ open, onClose, url, pin }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyUrl() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Share QR Code">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white rounded-2xl p-4">
          <QRCodeSVG value={url} size={200} level="M" />
        </div>
        <p className="text-xs text-light-300 text-center max-w-[260px]">
          Players can scan this QR code to open the RSVP page directly.
        </p>
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-dark-200 rounded-lg px-3 py-2 text-xs font-mono text-light-200 truncate">
              {url}
            </div>
            <button
              onClick={handleCopyUrl}
              className="p-2 rounded-lg border border-dark-100 text-light-300 hover:text-accent hover:border-accent/30 transition-colors"
              title="Copy link"
            >
              {copied ? (
                <FiCheck size={14} className="text-success" />
              ) : (
                <FiClipboard size={14} />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-light-300">PIN:</span>
            <span className="font-mono font-bold tracking-wider">{pin}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
