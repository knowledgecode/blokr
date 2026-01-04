import { describe, it, expect, afterEach, vi } from 'vitest';
import blokr from '../src/blokr.ts';

describe('Blokr Factory Function', () => {
  afterEach(() => {
    // Clean up any locks after each test
    const globalInstance = blokr();
    if (globalInstance.isLocked()) {
      globalInstance.unlock();
    }
  });

  describe('Factory Behavior', () => {
    it('should return a Blokr instance', () => {
      const instance = blokr();
      expect(instance).toBeDefined();
      expect(typeof instance.lock).toBe('function');
      expect(typeof instance.unlock).toBe('function');
      expect(typeof instance.isLocked).toBe('function');
    });

    it('should return the same instance for global (no target)', () => {
      const instance1 = blokr();
      const instance2 = blokr();
      expect(instance1).toBe(instance2);
    });

    it('should return the same instance for same element', () => {
      const element = document.createElement('div');
      const instance1 = blokr(element);
      const instance2 = blokr(element);
      expect(instance1).toBe(instance2);
    });

    it('should return different instances for different elements', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      const instance1 = blokr(element1);
      const instance2 = blokr(element2);
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('lock()', () => {
    it('should lock and return true on first call', () => {
      const instance = blokr();
      const result = instance.lock();
      expect(result).toBe(true);
      expect(instance.isLocked()).toBe(true);
      instance.unlock();
    });

    it('should return false if already locked', () => {
      const instance = blokr();
      const result1 = instance.lock();
      expect(result1).toBe(true);

      const result2 = instance.lock();
      expect(result2).toBe(false);
      expect(instance.isLocked()).toBe(true);

      instance.unlock();
    });

    it('should accept timeout option', () => {
      const instance = blokr();
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      instance.lock({ timeout: 5000 });

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      expect(instance.isLocked()).toBe(true);

      setTimeoutSpy.mockRestore();
      instance.unlock();
    });

    it('should not set timeout when timeout is 0', () => {
      const instance = blokr();
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      instance.lock({ timeout: 0 });

      expect(setTimeoutSpy).not.toHaveBeenCalled();
      expect(instance.isLocked()).toBe(true);

      setTimeoutSpy.mockRestore();
      instance.unlock();
    });

    it('should accept scope option', () => {
      const instance = blokr(document.createElement('div'));

      const result1 = instance.lock({ scope: 'inside' });
      expect(result1).toBe(true);
      instance.unlock();

      const result2 = instance.lock({ scope: 'outside' });
      expect(result2).toBe(true);
      instance.unlock();

      const result3 = instance.lock({ scope: 'self' });
      expect(result3).toBe(true);
      instance.unlock();
    });

    it('should use default scope "inside" if not specified', () => {
      const instance = blokr(document.createElement('div'));
      const result = instance.lock();
      expect(result).toBe(true);
      expect(instance.isLocked()).toBe(true);
      instance.unlock();
    });
  });

  describe('unlock()', () => {
    it('should unlock when locked', () => {
      const instance = blokr();
      instance.lock();
      expect(instance.isLocked()).toBe(true);

      instance.unlock();
      expect(instance.isLocked()).toBe(false);
    });

    it('should do nothing when not locked', () => {
      const instance = blokr();
      expect(instance.isLocked()).toBe(false);

      instance.unlock();
      expect(instance.isLocked()).toBe(false);

      // Should not throw
      expect(() => instance.unlock()).not.toThrow();
    });

    it('should clear timeout when unlocking', () => {
      const instance = blokr();
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      instance.lock({ timeout: 5000 });
      instance.unlock();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should clear timeout only when timeout was set', () => {
      const instance = blokr();
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      instance.lock({ timeout: 0 });
      instance.unlock();

      expect(clearTimeoutSpy).not.toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('isLocked()', () => {
    it('should return false when not locked', () => {
      const instance = blokr();
      expect(instance.isLocked()).toBe(false);
    });

    it('should return true when locked', () => {
      const instance = blokr();
      instance.lock();
      expect(instance.isLocked()).toBe(true);
      instance.unlock();
    });

    it('should return false after unlock', () => {
      const instance = blokr();
      instance.lock();
      instance.unlock();
      expect(instance.isLocked()).toBe(false);
    });
  });

  describe('Timeout Behavior', () => {
    it('should auto-unlock after timeout', () => {
      vi.useFakeTimers();

      const instance = blokr();
      instance.lock({ timeout: 1000 });

      expect(instance.isLocked()).toBe(true);

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Should be unlocked after timeout
      expect(instance.isLocked()).toBe(false);

      vi.useRealTimers();
    });

    it('should not set timeout when timeout is 0', () => {
      const instance = blokr();
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      instance.lock({ timeout: 0 });

      expect(setTimeoutSpy).not.toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
      instance.unlock();
    });

    it('should clear timeout on manual unlock', () => {
      vi.useFakeTimers();

      const instance = blokr();
      instance.lock({ timeout: 5000 });

      // Unlock before timeout
      instance.unlock();

      // Fast-forward past the timeout
      vi.advanceTimersByTime(5000);

      // Should still be unlocked (timeout was cleared)
      expect(instance.isLocked()).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('Independent Instances', () => {
    it('should support independent locks on different elements', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      const instance1 = blokr(element1);
      const instance2 = blokr(element2);

      instance1.lock();
      expect(instance1.isLocked()).toBe(true);
      expect(instance2.isLocked()).toBe(false);

      instance2.lock();
      expect(instance1.isLocked()).toBe(true);
      expect(instance2.isLocked()).toBe(true);

      instance1.unlock();
      expect(instance1.isLocked()).toBe(false);
      expect(instance2.isLocked()).toBe(true);

      instance2.unlock();
    });

    it('should maintain independent timeout states', () => {
      vi.useFakeTimers();

      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      const instance1 = blokr(element1);
      const instance2 = blokr(element2);

      instance1.lock({ timeout: 1000 });
      instance2.lock({ timeout: 2000 });

      vi.advanceTimersByTime(1000);
      expect(instance1.isLocked()).toBe(false);
      expect(instance2.isLocked()).toBe(true);

      vi.advanceTimersByTime(1000);
      expect(instance1.isLocked()).toBe(false);
      expect(instance2.isLocked()).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('Global Instance', () => {
    it('should block all events when no target specified', () => {
      const instance = blokr();
      instance.lock();
      expect(instance.isLocked()).toBe(true);
      instance.unlock();
    });

    it('should use default scope "inside" for global instance', () => {
      const instance = blokr();
      // Global instance with no target should still work (no filtering)
      const result = instance.lock();
      expect(result).toBe(true);
      instance.unlock();
    });
  });
});
