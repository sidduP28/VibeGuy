import { redirect } from 'next/navigation';

/**
 * /discount/[code]?redirect=<url>
 * Creator affiliate / discount-code landing.
 * Stores the code in a cookie then redirects to the target URL (or homepage).
 *
 * Example: /discount/ALEX20?redirect=/products/hydro-fuel
 */
export default async function DiscountPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const target = sp.redirect ?? '/';

  // Validate the redirect is a relative path or same-origin URL to prevent open redirect
  let safeTarget = '/';
  try {
    // Relative paths are fine; absolute same-origin are fine; block external
    if (target.startsWith('/') && !target.startsWith('//')) {
      safeTarget = decodeURIComponent(target);
    }
  } catch {
    safeTarget = '/';
  }

  // Redirect with cookie set via search params (cookie must be set server-side via headers)
  // We'll set it via a middleware-friendly approach: pass code as query param for now
  const finalUrl = new URL(safeTarget, 'http://localhost');
  finalUrl.searchParams.set('discount', code.toUpperCase());

  redirect(finalUrl.pathname + (finalUrl.search !== '?' ? finalUrl.search : ''));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return {
    title: `Applying discount ${code.toUpperCase()} — APEX`,
    robots: 'noindex',
  };
}
