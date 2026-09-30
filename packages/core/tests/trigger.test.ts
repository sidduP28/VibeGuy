import { describe, it, expect } from 'vitest';
import { parseTrigger, matchCreatorByTrigger } from '../src/trigger';
import type { CreatorProfile } from '../src/types';

describe('Trigger Parsing and Creator Matching', () => {
  const sampleCreators: CreatorProfile[] = [
    {
      id: 'creator_fit',
      name: 'Alex Rivera',
      handle: '@alexfit',
      niche: 'Fitness',
      audience: 'Strength athletes',
      interests: ['lifting', 'supplements'],
      tone: 'High-energy, authoritative',
      aesthetic: 'Bold, dark, dynamic',
      themeId: 'fitness-energy',
      vibeCode: 'fit2026',
      utmRules: { source: 'instagram', campaign: 'spring_fit' },
      referrerRules: ['instagram.com', 'linkin.bio/alexfit'],
      preferredCta: 'Fuel Your Workout',
    },
    {
      id: 'creator_lux',
      name: 'Elena Rostova',
      handle: '@elenalux',
      niche: 'Luxury Lifestyle',
      audience: 'High-net-worth connoisseurs',
      interests: ['couture', 'travel', 'design'],
      tone: 'Understated, sophisticated',
      aesthetic: 'Serif, muted gold, generous whitespace',
      themeId: 'luxury',
      vibeCode: 'lux2026',
      utmRules: { source: 'youtube', campaign: 'luxury_edit' },
      referrerRules: ['youtube.com'],
      preferredCta: 'Discover The Collection',
    },
  ];

  it('matches trigger by vibe short code with highest priority', () => {
    const url = 'https://store.example.com/?vibe=fit2026&utm_source=youtube&utm_campaign=luxury_edit';
    const referrer = 'https://youtube.com/watch?v=123';
    
    const trigger = parseTrigger(url, referrer);
    expect(trigger.type).toBe('vibe_code');
    expect(trigger.value).toBe('fit2026');

    const matched = matchCreatorByTrigger(trigger, sampleCreators);
    expect(matched).toBeDefined();
    expect(matched?.id).toBe('creator_fit');
  });

  it('falls back to UTM rules if no vibe param is provided', () => {
    const url = 'https://store.example.com/?utm_source=youtube&utm_campaign=luxury_edit';
    const referrer = 'https://google.com';

    const trigger = parseTrigger(url, referrer);
    expect(trigger.type).toBe('utm');
    expect(trigger.value).toBe('youtube:luxury_edit');

    const matched = matchCreatorByTrigger(trigger, sampleCreators);
    expect(matched).toBeDefined();
    expect(matched?.id).toBe('creator_lux');
  });

  it('falls back to referrer host/path rules when no vibe or UTM matches', () => {
    const url = 'https://store.example.com/';
    const referrer = 'https://instagram.com/p/12345';

    const trigger = parseTrigger(url, referrer);
    expect(trigger.type).toBe('referrer');
    expect(trigger.value).toBe('instagram.com');

    const matched = matchCreatorByTrigger(trigger, sampleCreators);
    expect(matched).toBeDefined();
    expect(matched?.id).toBe('creator_fit');
  });

  it('returns null when no trigger matches known creators', () => {
    const url = 'https://store.example.com/?utm_source=direct&utm_campaign=none';
    const referrer = 'https://example-blog.org';

    const trigger = parseTrigger(url, referrer);
    const matched = matchCreatorByTrigger(trigger, sampleCreators);
    expect(matched).toBeNull();
  });
});
