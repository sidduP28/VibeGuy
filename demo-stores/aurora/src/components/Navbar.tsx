'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';
import { VibeSlot } from '@vibe/react';

export function Navbar({ creatorSlug }: { creatorSlug: string | null }) {
  const { cartCount, currentUser } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/95 backdrop-blur">
      {/* Personalized Offer Slot */}
      <VibeSlot
        name="offer"
        tag="div"
        className="w-full bg-accent text-bg px-4 py-2 text-center text-xs font-semibold tracking-wide"
      >
        Welcome to Aurora — Curated Minimal Objects & Living Essentials
      </VibeSlot>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-fg text-bg flex items-center justify-center font-bold text-base tracking-tighter">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg tracking-tight leading-none text-fg">
              AURORA
            </span>
            <span className="text-[10px] tracking-widest text-muted uppercase">
              {creatorSlug ? `Curated by ${creatorSlug}` : 'Design Atelier'}
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-fg/80">
          <Link href="/" className="hover:text-fg transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-fg transition-colors">
            Shop Catalog
          </Link>
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-4">
          <Link
            href={currentUser ? '/account' : '/login'}
            className="text-xs font-medium px-3 py-1.5 rounded border border-border hover:bg-fg/5 text-fg transition-colors flex items-center gap-1.5"
          >
            {currentUser ? (
              <>
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </Link>

          <Link
            href="/cart"
            id="nav-cart-btn"
            className="relative px-3.5 py-1.5 rounded bg-fg text-bg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-bg text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
