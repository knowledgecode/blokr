import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import blokr from './index.ts';
import type { Options } from './index.ts';

/**
 * React hook to block user interaction on a target element.
 * @template T - The type of the target element.
 * @param allowGlobal - If true, allows lock/unlock operations even when target ref is not attached.
 * @returns An object containing the target ref and lock management functions.
 * - `target`: A ref object to be attached to the target element.
 * - `lock(options?)`: Function to lock the target element with optional settings.
 * - `unlock()`: Function to unlock the target element.
 * - `isLocked()`: Function to check if the target element is currently locked.
 * @public
 */
export const useBlokr: <T extends Element>(allowGlobal?: boolean) => {
  target: RefObject<T | null>;
  lock: (options?: Options) => boolean;
  unlock: () => void;
  isLocked: () => boolean;
} = <T extends Element>(allowGlobal = false) => {
  const target = useRef<T>(null);
  const lock = useCallback(
    (options?: Options) => target.current || allowGlobal ? blokr(target.current ?? undefined).lock(options) : false,
    [allowGlobal]
  );
  const unlock = useCallback(() => {
    if (target.current || allowGlobal) {
      blokr(target.current ?? undefined).unlock();
    }
  }, [allowGlobal]);
  const isLocked = useCallback(
    () => target.current || allowGlobal ? blokr(target.current ?? undefined).isLocked() : false,
    [allowGlobal]
  );

  return { target, lock, unlock, isLocked };
};
