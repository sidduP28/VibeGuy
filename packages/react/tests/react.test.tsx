// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import React, { createElement, act } from 'react';
import { createRoot } from 'react-dom/client';
import { VibeProvider } from '../src/VibeProvider';
import { VibeSlot } from '../src/VibeSlot';
import { useVibe } from '../src/useVibe';

describe('@vibe/react Integration (Zero Hydration Mismatch)', () => {
  it('renders default slot content when no creator profile is active', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        createElement(
          VibeProvider,
          { siteId: 'site_123', publicKey: 'pk_test', initialProfile: null },
          createElement(VibeSlot, { name: 'headline', as: 'h1' }, 'Generic Store Headline')
        )
      );
    });

    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe('Generic Store Headline');
    expect(h1?.getAttribute('data-vibe-slot')).toBe('headline');
  });

  it('renders personalized slot content seamlessly from initialProfile (SSR pass-through)', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    const profile = {
      creatorId: 'alexfit',
      campaignId: 'cmp_123',
      slots: {
        headline: 'Alex Rivera: Maximum Power Pre-Workout',
        cta: 'Claim 20% Off Bundle',
      },
    };

    act(() => {
      root.render(
        createElement(
          VibeProvider,
          { siteId: 'site_123', publicKey: 'pk_test', initialProfile: profile },
          createElement(VibeSlot, { name: 'headline', as: 'h1' }, 'Generic Store Headline'),
          createElement(VibeSlot, { name: 'cta', as: 'button' }, 'Shop Now')
        )
      );
    });

    const h1 = container.querySelector('h1');
    const button = container.querySelector('button');

    expect(h1?.textContent).toBe('Alex Rivera: Maximum Power Pre-Workout');
    expect(button?.textContent).toBe('Claim 20% Off Bundle');
  });

  it('exposes useVibe hook with active creator and track function', () => {
    let hookResult: any = null;

    function TestComponent() {
      hookResult = useVibe();
      return createElement('div', null, hookResult.isPersonalized ? 'Personalized' : 'Generic');
    }

    const container = document.createElement('div');
    const root = createRoot(container);

    const profile = {
      creatorId: 'elena_lux',
      campaignId: 'cmp_lux',
      slots: { headline: 'Curated Elegance' },
    };

    act(() => {
      root.render(
        createElement(
          VibeProvider,
          { siteId: 'site_123', publicKey: 'pk_test', initialProfile: profile },
          createElement(TestComponent)
        )
      );
    });

    expect(hookResult).not.toBeNull();
    expect(hookResult.isPersonalized).toBe(true);
    expect(hookResult.creatorId).toBe('elena_lux');
    expect(typeof hookResult.track).toBe('function');
  });
});
