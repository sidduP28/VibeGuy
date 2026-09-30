import { useContext } from 'react';
import { VibeContext, type VibeContextValue } from './VibeProvider';

export function useVibe(): VibeContextValue {
  return useContext(VibeContext);
}
