'use client';

import { useEffect } from 'react';
import { themeToCssVars } from '@vibe/core';

export function LivePreviewListener() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'VIBE_PREVIEW_UPDATE') {
        const { theme, slots } = event.data;

        // 1. Live update theme tokens & CSS variables
        if (theme && typeof theme === 'object') {
          const vars = themeToCssVars(theme) as Record<string, string>;
          for (const [key, val] of Object.entries(vars)) {
            if (val) document.documentElement.style.setProperty(key, val);
          }
          if (theme.accent) {
            document.documentElement.style.setProperty('--vibe-accent', theme.accent);
            document.documentElement.style.setProperty('--color-accent', theme.accent);
          }
          if (theme.bg) {
            document.documentElement.style.setProperty('--vibe-bg', theme.bg);
            document.documentElement.style.setProperty('--color-bg', theme.bg);
          }
          if (theme.fg) {
            document.documentElement.style.setProperty('--vibe-fg', theme.fg);
            document.documentElement.style.setProperty('--color-fg', theme.fg);
          }
        }

        // 2. Live update slot text content
        if (slots && typeof slots === 'object') {
          if (slots.headline !== undefined) {
            document.querySelectorAll('[data-vibe-slot="headline"]').forEach((el) => {
              el.textContent = slots.headline;
            });
          }
          if (slots.subheadline !== undefined) {
            document.querySelectorAll('[data-vibe-slot="subheadline"]').forEach((el) => {
              el.textContent = slots.subheadline;
            });
          }
          if (slots.cta !== undefined) {
            document.querySelectorAll('[data-vibe-slot="cta"]').forEach((el) => {
              el.textContent = slots.cta;
            });
          }
          if (slots.offer !== undefined) {
            document.querySelectorAll('[data-vibe-slot="offer"]').forEach((el) => {
              el.textContent = slots.offer;
            });
          }
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null;
}
