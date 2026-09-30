export function setupDebugOverlay(
  triggerInfo: any,
  campaignInfo: any,
  metrics: any
): void {
  if (typeof window === 'undefined') return;

  const debugFn = () => {
    console.log('[VibePersonalize]', { trigger: triggerInfo, campaign: campaignInfo, metrics });
    const slots = document.querySelectorAll<HTMLElement>('[data-vibe-slot]');
    slots.forEach((slot) => {
      slot.style.outline = '2px dashed #06b6d4';
    });
    return { trigger: triggerInfo, campaign: campaignInfo, metrics, slots: slots.length };
  };

  (window as any).vibe = (window as any).vibe || {};
  (window as any).vibe.debug = debugFn;
}
