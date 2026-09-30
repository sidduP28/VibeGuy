import { swapImageSafely } from './images';

export interface SlotPayload {
  [slotName: string]: string | undefined;
}

export function applySlotContent(
  element: HTMLElement,
  slotName: string,
  content: string,
  ctaUrl?: string
): void {
  if (!content && !ctaUrl) return;

  if (slotName === 'hero-image' || element.tagName.toLowerCase() === 'img') {
    const imgEl = element.tagName.toLowerCase() === 'img' ? (element as HTMLImageElement) : element.querySelector('img');
    if (imgEl) {
      swapImageSafely(imgEl, content, () => {
        element.style.visibility = 'visible';
      });
      return;
    }
  }

  if (slotName === 'cta') {
    element.textContent = content;
    if (element.tagName.toLowerCase() === 'a' && ctaUrl) {
      if (ctaUrl.startsWith('https://') || ctaUrl.startsWith('/')) {
        (element as HTMLAnchorElement).href = ctaUrl;
      }
    }
    element.style.visibility = 'visible';
    return;
  }

  // Guardrail G5: Strictly textContent, never innerHTML or eval
  element.textContent = content;
  element.style.visibility = 'visible';
}

export function observeAndApplySlots(
  payload: Record<string, string>,
  ctaUrl?: string,
  selectorMap?: Record<string, string>,
  onSlotApplied?: (slotName: string) => void
): () => void {
  const appliedSlots = new Set<string>();

  const checkElements = () => {
    // 1. Check data-vibe-slot elements
    const elements = document.querySelectorAll<HTMLElement>('[data-vibe-slot]');
    elements.forEach((el) => {
      const slotName = el.getAttribute('data-vibe-slot');
      if (slotName && payload[slotName] && !appliedSlots.has(slotName)) {
        appliedSlots.add(slotName);
        applySlotContent(el, slotName, payload[slotName], ctaUrl);
        onSlotApplied?.(slotName);
      }
    });

    // 2. Check custom mapped selectors
    if (selectorMap) {
      for (const [selector, slotName] of Object.entries(selectorMap)) {
        if (payload[slotName] && !appliedSlots.has(slotName)) {
          const el = document.querySelector<HTMLElement>(selector);
          if (el) {
            appliedSlots.add(slotName);
            applySlotContent(el, slotName, payload[slotName], ctaUrl);
            onSlotApplied?.(slotName);
          }
        }
      }
    }
  };

  // Immediate check
  checkElements();

  // Watch for streaming DOM elements as HTML arrives
  const observer = new MutationObserver(() => {
    checkElements();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      checkElements();
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

  return () => observer.disconnect();
}
