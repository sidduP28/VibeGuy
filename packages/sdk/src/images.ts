export function swapImageSafely(
  imgElement: HTMLImageElement,
  newSrc: string,
  onApplied?: () => void
): void {
  if (!newSrc || !newSrc.startsWith('https://')) {
    onApplied?.();
    return;
  }

  // Pre-load and decode in memory before swapping to guarantee zero layout shift
  const preloader = new Image();
  preloader.src = newSrc;

  const performSwap = () => {
    imgElement.src = newSrc;
    // Reveal slot immediately
    imgElement.style.visibility = 'visible';
    onApplied?.();
  };

  if ('decode' in preloader) {
    preloader
      .decode()
      .then(performSwap)
      .catch(() => {
        // Fallback: swap anyway if decode fails
        performSwap();
      });
  } else {
    preloader.onload = performSwap;
    preloader.onerror = () => onApplied?.();
  }
}
