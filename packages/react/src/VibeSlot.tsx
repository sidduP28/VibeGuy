'use client';

import React, { useContext } from 'react';
import { VibeContext } from './VibeProvider';

export interface VibeSlotProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  as?: React.ElementType;
  tag?: React.ElementType;
  children?: React.ReactNode;
  href?: string;
}

export function VibeSlot({
  name,
  as,
  tag,
  children,
  className,
  ...rest
}: VibeSlotProps) {
  const Component = tag || as || 'div';
  const context = useContext(VibeContext);
  const personalizedContent = context.slots[name];

  return (
    <Component data-vibe-slot={name} className={className} {...rest}>
      {personalizedContent !== undefined ? personalizedContent : children}
    </Component>
  );
}
