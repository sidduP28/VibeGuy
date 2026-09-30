import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isVisitorInHoldout } from '@vibe/core';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const searchParams = url.searchParams;

  // 1. Resolve raw parameter from ?vp_creator, ?vibe, ?creator, ?ref, or utm_content
  const rawParam =
    searchParams.get('vp_creator') ||
    searchParams.get('vibe') ||
    searchParams.get('creator') ||
    searchParams.get('ref') ||
    searchParams.get('utm_content') ||
    '';

  // 2. Strict sanitization (alphanumeric, hyphens, underscores only)
  const isCleanSlug = /^[a-zA-Z0-9_-]+$/.test(rawParam);
  const normalizedParam = isCleanSlug ? rawParam.toLowerCase() : '';

  // 3. Visitor ID management
  let visitorId = req.cookies.get('visitor_id')?.value;
  let isNewVisitor = false;
  if (!visitorId) {
    visitorId = `vis_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    isNewVisitor = true;
  }

  // 4. Fall back to persistent cookie if available and no query param provided
  let requestedSlug = normalizedParam;
  let updateVibeCookie = Boolean(normalizedParam);
  if (!rawParam) {
    const savedCookie = req.cookies.get('aurora_vibe')?.value;
    if (savedCookie && /^[a-zA-Z0-9_-]+$/.test(savedCookie)) {
      requestedSlug = savedCookie.toLowerCase();
    }
  }

  // 5. 10% Holdout group check (deterministic via @vibe/core fnv1a)
  let group = req.cookies.get('aurora_group')?.value;
  if (!group) {
    const inHoldout = isVisitorInHoldout(visitorId, 'aurora_store', 10);
    group = inHoldout ? 'holdout' : 'treatment';
  }

  const forcePersonalize = searchParams.get('force_vibe') === '1' || searchParams.get('preview') === '1';
  const effectiveCreator = (group === 'holdout' && !forcePersonalize) ? null : requestedSlug;

  // 6. Forward headers to Root Layout (strictly ByteString-safe for HTTP headers)
  const toByteString = (val: string | null | undefined): string => {
    if (!val) return '';
    try {
      return encodeURIComponent(val);
    } catch {
      return '';
    }
  };

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-aurora-vibe', toByteString(effectiveCreator));
  requestHeaders.set('x-aurora-raw-param', toByteString(rawParam));
  requestHeaders.set('x-aurora-visitor', toByteString(visitorId));
  requestHeaders.set('x-aurora-group', toByteString(group));
  requestHeaders.set('x-aurora-debug', toByteString(searchParams.get('vibe_debug')));
  requestHeaders.set('x-aurora-preview', toByteString(searchParams.get('preview')));
  requestHeaders.set('x-aurora-force', toByteString(searchParams.get('force_vibe')));
  requestHeaders.set('x-aurora-draft-theme', toByteString(searchParams.get('draft_theme') || searchParams.get('theme')));
  requestHeaders.set('x-aurora-draft-slots', toByteString(searchParams.get('draft_slots')));

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  response.headers.set('Access-Control-Allow-Headers', '*');

  // 7. Write/update cookies
  if (isNewVisitor) {
    response.cookies.set('visitor_id', visitorId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  response.cookies.set('aurora_group', group, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });

  if (updateVibeCookie && requestedSlug) {
    response.cookies.set('aurora_vibe', requestedSlug, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
  } else if (rawParam && !isCleanSlug) {
    // Invalid param clears cookie
    response.cookies.set('aurora_vibe', '', { path: '/', maxAge: 0 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
