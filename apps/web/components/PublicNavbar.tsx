"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

/**
 * Pass `isLandingPage` when used on the landing page (`/`).
 * On the landing page, section links are same-page anchors (#sports).
 * On other pages, they navigate cross-page (/#sports).
 */
export function PublicNavbar({
  isLandingPage = false,
}: {
  isLandingPage?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const prefix = isLandingPage ? "" : "/";

  return (
    <header className="relative z-10 px-6 sm:px-10 py-5">
      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/potato-logo.png" alt="RallyUp" className="h-8" />
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-light-200 hover:text-light-100 transition-colors"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden mt-3 flex flex-col gap-1 bg-secondary/90 backdrop-blur border border-dark-100 rounded-2xl p-3">
          {!isLandingPage && (
            <Link
              href="/"
              className="text-sm font-medium text-light-200 px-3 py-2.5 rounded-xl hover:bg-dark-200 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          )}
          <Link
            href="/whats-new"
            className="relative text-sm font-semibold text-accent px-3 py-2.5 rounded-xl hover:bg-dark-200 transition-colors flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            What&apos;s New
            <span className="bg-danger text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          </Link>
          <a
            href="https://michaelquieta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-white hover:text-accent transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-200"
            onClick={() => setMenuOpen(false)}
          >
            About the Developer
          </a>
          <Link
            href="/feedback"
            className="text-sm text-light-200 hover:text-light-100 transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-200"
            onClick={() => setMenuOpen(false)}
          >
            Feedback
          </Link>
          <Link
            href="/login"
            className="text-sm text-light-200 hover:text-light-100 transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-200"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-accent text-primary px-4 py-2.5 rounded-xl hover:bg-accent/80 transition-colors text-center mt-1"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/potato-logo.png" alt="RallyUp" className="h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="animate-rainbow-spin rounded-xl p-[1.5px]"
              style={{
                background:
                  "conic-gradient(from var(--rainbow-angle, 0deg), #ff0000, #ff8800, #ffdd00, #00ff00, #0088ff, #8800ff, #ff0000)",
              }}
            >
              <Link
                href="/whats-new"
                className="flex items-center gap-1.5 bg-secondary rounded-[10px] px-4 py-1.5 text-sm font-semibold text-light-100 hover:text-accent transition-colors"
              >
                What&apos;s New
              </Link>
            </div>
            <span className="absolute -top-2 -right-2 bg-danger text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full -rotate-12 shadow-md pointer-events-none">
              NEW
            </span>
          </div>
          <a
            href="https://michaelquieta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-white hover:text-accent transition-colors px-3 py-2"
          >
            About the Developer
          </a>
          <Link
            href="/feedback"
            className="text-sm text-light-200 hover:text-light-100 transition-colors px-3 py-2"
          >
            Feedback
          </Link>
          <Link
            href="/login"
            className="text-sm text-light-200 hover:text-light-100 transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-accent text-primary px-5 py-2 rounded-xl hover:bg-accent/80 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
