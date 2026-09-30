'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';

export interface VibeProfile {
  creatorId: string;
  campaignId: string;
  slots: Record<string, string>;
  themeTokens?: Record<string, string>;
}

export interface VibeContextValue {
  isPersonalized: boolean;
  creatorId: string | null;
  campaignId: string | null;
  slots: Record<string, string>;
  themeTokens?: Record<string, string>;
  track: (type: string, data?: any) => void;
}

export const VibeContext = createContext<VibeContextValue>({
  isPersonalized: false,
  creatorId: null,
  campaignId: null,
  slots: {},
  track: () => {},
});

export interface VibeProviderProps {
  siteId: string;
  publicKey: string;
  initialProfile?: VibeProfile | null;
  children: React.ReactNode;
}

export function VibeProvider({
  siteId,
  publicKey,
  initialProfile = null,
  children,
}: VibeProviderProps) {
  const [profile, setProfile] = useState<VibeProfile | null>(initialProfile);

  // Apply theme tokens if provided
  useEffect(() => {
    if (profile?.themeTokens && typeof document !== 'undefined') {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(profile.themeTokens)) {
        root.style.setProperty(`--vibe-${key}`, value);
      }
    }
  }, [profile?.themeTokens]);

  const contextValue = useMemo<VibeContextValue>(() => {
    return {
      isPersonalized: Boolean(profile && profile.creatorId),
      creatorId: profile?.creatorId || null,
      campaignId: profile?.campaignId || null,
      slots: profile?.slots || {},
      themeTokens: profile?.themeTokens,
      track: (type: string, data?: any) => {
        if (typeof window !== 'undefined' && (window as any).vibe?.track) {
          (window as any).vibe.track(type, data);
        }
      },
    };
  }, [profile]);

  return <VibeContext.Provider value={contextValue}>{children}</VibeContext.Provider>;
}
