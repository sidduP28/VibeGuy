// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isSearchBot } from '../src/bot';
import { applyPreHide, removePreHide } from '../src/prehide';
import { applySlotContent } from '../src/slots';

describe('SDK Runtime Guards (G1 - G5)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = `
      <div id="hero" data-vibe-slot="headline">Original Brand Headline</div>
      <div id="sub" data-vibe-slot="subheadline">Original Subheadline</div>
      <div id="cta-btn" data-vibe-slot="cta">Buy Now</div>
    `;
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Bot Detection (G4 SEO Neutrality)', () => {
    it('detects search bots and bypasses personalization', () => {
      expect(isSearchBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
      expect(isSearchBot('Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true);
      expect(isSearchBot('Baiduspider+(+http://www.baidu.com/search/spider.htm)')).toBe(true);
      expect(isSearchBot('YandexBot/3.0; +http://yandex.com/bots')).toBe(true);
    });

    it('does NOT block Lighthouse user agent so performance audits succeed', () => {
      const lighthouseUA =
        'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse';
      expect(isSearchBot(lighthouseUA)).toBe(false);
    });

    it('identifies standard consumer mobile and desktop browsers as non-bots', () => {
      const chromeMac =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const iphoneSafari =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
      expect(isSearchBot(chromeMac)).toBe(false);
      expect(isSearchBot(iphoneSafari)).toBe(false);
    });
  });

  describe('Pre-hide Logic (G2 Layout Stability & G3 Fallback)', () => {
    it('injects minimal style with visibility:hidden on slots only', () => {
      applyPreHide();
      const styleEl = document.getElementById('vibe-prehide');
      expect(styleEl).not.toBeNull();
      expect(styleEl?.textContent).toContain('visibility: hidden');
      // Must NOT contain display: none, width, height, margin, or padding (G2)
      expect(styleEl?.textContent).not.toContain('display: none');
      expect(styleEl?.textContent).not.toContain('margin:');
      expect(styleEl?.textContent).not.toContain('padding:');
      expect(styleEl?.textContent).not.toContain('height:');
    });

    it('cleanly removes pre-hide style element on fallback or completion', () => {
      applyPreHide();
      expect(document.getElementById('vibe-prehide')).not.toBeNull();
      removePreHide();
      expect(document.getElementById('vibe-prehide')).toBeNull();
    });
  });

  describe('Slot Content Injection (G5 Security & G2 Zero Shift)', () => {
    it('updates slot text via textContent without altering layout properties or HTML', () => {
      const headlineEl = document.querySelector('[data-vibe-slot="headline"]') as HTMLElement;
      applySlotContent(headlineEl, 'headline', 'Personalized Creator Headline <script>alert(1)</script>');

      // Verifies textContent set and HTML is sanitized/escaped as text
      expect(headlineEl.textContent).toBe('Personalized Creator Headline <script>alert(1)</script>');
      expect(headlineEl.innerHTML).not.toContain('<script>');
    });
  });
});
