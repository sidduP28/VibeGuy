import { describe, it, expect, beforeAll } from 'vitest';
import { ensureSchema } from '../src/db';
import { compileSdkBundle } from '../src/lib/compile-sdk';
import { ingestEvents } from '../src/lib/ingest';
import { GET as getPx } from '../src/app/api/px/route';
import { POST as postSimulate } from '../src/app/api/simulate/route';
import { POST as postExtractProduct } from '../src/app/api/extract/product/route';
import { POST as postExtractVibe } from '../src/app/api/extract/vibe/route';
import { NextRequest } from 'next/server';

describe('Console Backend APIs', () => {
  beforeAll(async () => {
    await ensureSchema();
  });

  describe('/api/sdk/[siteId] Compilation', () => {
    it('compiles SDK bundle for seeded site_demo', async () => {
      const bundle = await compileSdkBundle('site_demo');
      expect(bundle).not.toBeNull();
      expect(bundle).toContain('window.__VIBE_CONFIG__=');
      expect(bundle).toContain('pk_live_vibepersonalize_2026');
      expect(bundle).toContain('fit2026');
      expect(bundle).toContain('minimal2026');
      expect(bundle).toContain('lux2026');
      expect(bundle).toContain('data-vibe-slot');
    });

    it('returns null for unknown site', async () => {
      const bundle = await compileSdkBundle('unknown_site_999');
      expect(bundle).toBeNull();
    });
  });

  describe('/api/collect & Ingestion Pipeline', () => {
    it('rejects invalid payload format', async () => {
      const res = await ingestEvents({ invalid: 'data' }, 'http://localhost:3000');
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(400);
        expect(res.error).toBe('invalid_payload');
      }
    });

    it('rejects unknown public key', async () => {
      const res = await ingestEvents(
        {
          publicKey: 'pk_fake_key_123',
          events: [
            {
              visitorId: 'vis_test',
              siteId: 'site_demo',
              campaignId: 'cmp_fit',
              variant: 'personalized',
              type: 'view',
            },
          ],
        },
        'http://localhost:3000'
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(401);
        expect(res.error).toBe('unknown_key');
      }
    });

    it('blocks unapproved origins', async () => {
      const res = await ingestEvents(
        {
          publicKey: 'pk_live_vibepersonalize_2026',
          events: [
            {
              visitorId: 'vis_test',
              siteId: 'site_demo',
              campaignId: 'cmp_fit',
              variant: 'personalized',
              type: 'view',
            },
          ],
        },
        'https://malicious-attacker.com'
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
        expect(res.error).toBe('origin_blocked');
      }
    });

    it('successfully ingests valid beacon event', async () => {
      const res = await ingestEvents(
        {
          publicKey: 'pk_live_vibepersonalize_2026',
          events: [
            {
              visitorId: 'vis_test_collect',
              siteId: 'site_demo',
              campaignId: 'cmp_fit',
              creatorId: 'cr_fit',
              variant: 'personalized',
              type: 'slot_applied',
              metrics: { execMs: 14, hideMs: 14, cls: 0, lcp: 350 },
            },
          ],
        },
        'http://localhost:3000'
      );
      expect(res.ok).toBe(true);
    });
  });

  describe('/api/px (1x1 GIF Tracker)', () => {
    it('serves 1x1 transparent gif with no-store headers', async () => {
      const response = await getPx();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/gif');
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      const buf = await response.arrayBuffer();
      expect(buf.byteLength).toBeGreaterThan(10);
    });
  });

  describe('/api/simulate', () => {
    it('generates simulated traffic events', async () => {
      const response = await postSimulate();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.inserted).toBeGreaterThan(0);
    });
  });

  describe('SSRF Protection on Extractors', () => {
    it('blocks internal private IPs on product extractor', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data' }),
      });
      const response = await postExtractProduct(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('blocks loopback address on vibe extractor', async () => {
      const req = new NextRequest('http://localhost:3000/api/extract/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'http://127.0.0.1:8080/admin' }),
      });
      const response = await postExtractVibe(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
