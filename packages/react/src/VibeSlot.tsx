'use client';

import React, { useContext } from 'react';
import { VibeContext } from './VibeProvider';

export interface VibeSlotProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  as?: React.ElementType;
  tag?: React.ElementType;
  children?: React.ReactNode;
  href?: string;
  /** Alt text used when the slot value is an image URL. Defaults to the slot name. */
  alt?: string;
}

/** Returns true when `value` looks like an image URL or local image path. */
function isImageUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.startsWith('/') && /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(value)) {
    return true;
  }
  if (value.startsWith('data:image/')) return true;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    // Match common image extensions OR known CDN patterns (unsplash, cloudinary, etc.)
    return (
      /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(url.pathname) ||
      url.hostname.includes('unsplash.com') ||
      url.hostname.includes('cloudinary.com') ||
      url.hostname.includes('imgix.net') ||
      url.hostname.includes('images.ctfassets.net')
    );
  } catch {
    return false;
  }
}

export function VibeSlot({
  name,
  as,
  tag,
  children,
  className,
  alt,
  ...rest
}: VibeSlotProps) {
  const Component = tag || as || 'div';
  const context = useContext(VibeContext);
  const personalizedContent = context.slots[name];

  // When the slot value is an image URL and the component isn't already <img>,
  // render the URL as an <img> inside the wrapper so it displays correctly.
  const resolvedChildren = (() => {
    if (personalizedContent !== undefined) {
      if (isImageUrl(personalizedContent) && Component !== 'img') {
        return (
          <img
            src={personalizedContent}
            alt={alt ?? name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        );
      }
      return personalizedContent;
    }
    return children;
  })();

  return (
    <Component data-vibe-slot={name} className={className} {...rest}>
      {resolvedChildren}
    </Component>
  );
}
