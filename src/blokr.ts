import lock from './lock.ts';
import type { Filter } from './lock.ts';

export type Scope = 'inside' | 'outside' | 'self';

export interface Options {
  scope?: Scope;
  timeout?: number;
}

const blokrs = new WeakMap<Element | typeof globalThis, Blokr>();

class Blokr {
  private _target: Element | undefined;

  private _timerId: number | undefined;

  private _filter: Filter | undefined;

  /**
   * Creates the Blokr singleton instance.
   */
  constructor (target?: Element) {
    this._target = target;
    this._timerId = undefined;
  }

  /**
   * Locks user interactions with optional timeout and scope configuration.
   * Returns false if already locked without making any changes.
   * @param [options] - Lock configuration options.
   * @returns true if lock was applied, false if already locked.
   */
  lock (options?: Options) {
    if (this.isLocked()) {
      return false;
    }

    const scope = options?.scope ?? 'inside';
    const timeout = options?.timeout ?? 0;

    this._filter = (eventTarget: Element) => {
      if (this._target) {
        if (scope === 'self') {
          return this._target === eventTarget;
        }
        const contains = this._target.contains(eventTarget);
        // For 'outside' scope, block events outside target; otherwise block events inside target
        return scope === 'outside' ? !contains : contains;
      }
      // No target specified: block all events
      return true;
    };
    lock.register(this._filter);

    if (timeout > 0) {
      this._timerId = globalThis.setTimeout(() => this.unlock(), timeout);
    }

    return true;
  }

  /**
   * Checks if user interactions are currently locked.
   * @returns true if locked, false otherwise.
   */
  isLocked () {
    return !!this._filter;
  }

  /**
   * Unlocks user interactions and clears any pending timeout.
   * Safe to call even when not locked.
   */
  unlock () {
    if (this._timerId) {
      globalThis.clearTimeout(this._timerId);
      this._timerId = undefined;
    }
    if (this._filter) {
      lock.unregister(this._filter);
    }
    this._filter = undefined;
  }
}

const blokr = (target?: Element) => {
  return blokrs.get(target ?? globalThis) ?? (() => {
    const instance = new Blokr(target);
    blokrs.set(target ?? globalThis, instance);
    return instance;
  })();
};

export default blokr;
