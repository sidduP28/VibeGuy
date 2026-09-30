import React from 'react';
import Link from 'next/link';

export function Footer({ creatorSlug }: { creatorSlug: string | null }) {
  return (
    <footer className="mt-auto border-t border-border bg-card text-fg/75 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-fg text-bg flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-heading font-bold text-base text-fg tracking-tight">AURORA</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Deliberate objects crafted for performance, calm, luxury, and engineering clarity.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-fg uppercase tracking-wider mb-3">Collections</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/shop?cat=fitness" className="hover:text-fg">Fitness & Conditioning</Link></li>
            <li><Link href="/shop?cat=minimalist-home" className="hover:text-fg">Minimalist Living</Link></li>
            <li><Link href="/shop?cat=luxury-beauty" className="hover:text-fg">Luxury Rituals</Link></li>
            <li><Link href="/shop?cat=tech-gadgets" className="hover:text-fg">Tech & Gadgets</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-fg uppercase tracking-wider mb-3">Creators</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/?vibe=fitfiona" className="hover:text-fg">Fiona Vance (Fitness)</Link></li>
            <li><Link href="/?vibe=minimal-max" className="hover:text-fg">Max Sterling (Minimal)</Link></li>
            <li><Link href="/?ref=luxe-lena" className="hover:text-fg">Lena Rostova (Luxury)</Link></li>
            <li><Link href="/?vibe=techtom" className="hover:text-fg">Tom Zhao (Tech)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-fg uppercase tracking-wider mb-3">Demo Controls</h4>
          <p className="text-xs text-muted mb-2">
            Active state:{' '}
            <span className="font-mono text-accent font-semibold">
              {creatorSlug ? `creator:${creatorSlug}` : 'default_store'}
            </span>
          </p>
          <div className="flex flex-col gap-1.5 text-xs">
            <Link href="/account" className="hover:text-fg">
              Demo Shopper Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted">
        Aurora Storefront · Powered by <strong style={{ opacity: 0.8 }}>VibeGuy</strong> · Next.js 15 App Router
      </div>
    </footer>
  );
}
