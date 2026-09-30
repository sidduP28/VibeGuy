'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CREATORS } from '../data/creators';

export function PreviewSwitcher({
  activeSlug,
  creators = CREATORS,
}: {
  activeSlug: string | null;
  creators?: Record<string, any>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const creatorList = Object.values(creators);
  const currentCreator = activeSlug && creators[activeSlug] ? creators[activeSlug] : null;

  const handleSelect = (slug: string) => {
    if (slug === 'default') {
      // Clear vibe by navigating to root with empty query and clearing cookie
      document.cookie = 'aurora_vibe=; path=/; max-age=0';
      window.location.href = '/?force_vibe=0';
    } else if (slug === 'holdout') {
      document.cookie = 'aurora_group=holdout; path=/; max-age=86400';
      window.location.href = '/?force_vibe=0';
    } else {
      document.cookie = 'aurora_group=treatment; path=/; max-age=86400';
      document.cookie = `aurora_vibe=${slug}; path=/; max-age=86400`;
      window.location.href = `/?vibe=${slug}&force_vibe=1`;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="preview-switcher-btn"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-fg text-bg shadow-xl border border-border text-xs font-semibold hover:opacity-95 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Preview as: {currentCreator ? currentCreator.name || activeSlug : 'Default Store'}</span>
          <span className="text-[10px] opacity-75">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div
            id="preview-switcher-dropdown"
            className="absolute bottom-12 right-0 w-64 p-2 bg-card border border-border rounded-xl shadow-2xl space-y-1 text-xs text-fg max-h-96 overflow-y-auto"
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
              Switch Creator Skin
            </div>

            <button
              onClick={() => handleSelect('default')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                !activeSlug ? 'bg-accent text-bg font-semibold' : 'hover:bg-fg/5'
              }`}
            >
              <span>Default Store (No Creator)</span>
              <span className="text-[10px] opacity-75">Clean</span>
            </button>

            {creatorList.map((creator: any) => {
              const isSelected = activeSlug === creator.slug;
              const themeName = creator.theme?.name || creator.themeName || 'custom';
              return (
                <button
                  key={creator.slug}
                  onClick={() => handleSelect(creator.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-accent text-bg font-semibold' : 'hover:bg-fg/5'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{creator.name}</span>
                    <span className="text-[10px] opacity-80">{creator.handle || `@${creator.slug}`} · {themeName}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold">
                    {creator.discountCode || ''}
                  </span>
                </button>
              );
            })}

            <div className="pt-1 border-t border-border mt-1">
              <button
                onClick={() => handleSelect('holdout')}
                className="w-full text-left px-3 py-1.5 rounded-lg text-muted hover:text-fg hover:bg-fg/5 text-[11px]"
              >
                Simulate 10% Holdout Visitor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
