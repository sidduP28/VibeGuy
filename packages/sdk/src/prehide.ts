const PREHIDE_STYLE_ID = 'vibe-prehide';

export function applyPreHide(customSelectors: string[] = []): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PREHIDE_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = PREHIDE_STYLE_ID;

  // Guardrail G2: ONLY visibility: hidden; NEVER display: none or layout dimensions
  let selectorList = '[data-vibe-slot]';
  if (customSelectors.length > 0) {
    selectorList += `, ${customSelectors.join(', ')}`;
  }

  style.textContent = `${selectorList} { visibility: hidden !important; }`;

  const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  head.appendChild(style);
}

export function removePreHide(): void {
  if (typeof document === 'undefined') return;
  const style = document.getElementById(PREHIDE_STYLE_ID);
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }
}
