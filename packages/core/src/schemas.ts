import { z } from 'zod';

export const IngestEventSchema = z.object({
  visitorId: z.string().min(1).max(128),
  siteId: z.string().min(1).max(64),
  campaignId: z.string().min(1).max(64),
  creatorId: z.string().max(64).optional(),
  variant: z.enum(['personalized', 'control', 'fallback']),
  type: z.enum(['view', 'slot_applied', 'add_to_cart', 'checkout', 'purchase']),
  orderId: z.string().max(128).optional(),
  value: z.number().nonnegative().optional(),
  metrics: z
    .object({
      execMs: z.number().nonnegative().optional(),
      hideMs: z.number().nonnegative().optional(),
      cls: z.number().nonnegative().optional(),
      lcp: z.number().nonnegative().optional(),
    })
    .optional(),
  reason: z.string().max(256).optional(),
  timestamp: z.number().optional(),
});

export const IngestPayloadSchema = z.object({
  publicKey: z.string().min(1).max(128),
  events: z.array(IngestEventSchema).min(1).max(100),
});

export const CreateCampaignSchema = z.object({
  siteId: z.string().min(1),
  creatorId: z.string().min(1),
  name: z.string().min(1).max(128),
  productUrl: z.string().url().startsWith('https://'),
  productTitle: z.string().min(1).max(256),
  productDescription: z.string().max(2000).default(''),
  productImage: z.string().url().startsWith('https://'),
  productPrice: z.string().min(1).max(64),
  promoCode: z.string().max(64).default(''),
  offer: z.string().max(256).default(''),
  cta: z.string().min(1).max(64),
  hero: z.string().url().startsWith('https://'),
  headline: z.string().min(1).max(256),
  subheadline: z.string().max(512).default(''),
  testimonialIds: z.array(z.string()).default([]),
  themeId: z.string().min(1),
  holdoutPct: z.number().min(0).max(100).default(10),
  status: z.enum(['active', 'paused', 'expired']).default('active'),
  expiresAt: z.string().optional(),
});

export const ExtractUrlSchema = z.object({
  url: z.string().url().startsWith('https://'),
});
