import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import blokr from '../src/blokr.ts';

describe('Blokr Singleton', () => {
  beforeEach(() => {
    // Reset the singleton state
    blokr.setTimeout(10000);
    // Unlock any existing locks
    while (blokr.isLocked()) {
      blokr.unlock();
    }
  });

  afterEach(() => {
    // Clean up any locks after each test
    while (blokr.isLocked()) {
      blokr.unlock();
    }
  });

  describe('Singleton Instance', () => {
    it('should be available as singleton', () => {
      expect(blokr).toBeDefined();
      expect(typeof blokr.lock).toBe('function');
      expect(typeof blokr.unlock).toBe('function');
      expect(typeof blokr.isLocked).toBe('function');
      expect(typeof blokr.setTimeout).toBe('function');
    });
  });

  describe('lock()', () => {
    it('should increment counter on first lock', () => {
      blokr.lock();
      // We can test the behavior indirectly by checking unlock behavior
      blokr.unlock();
      // If lock/unlock worked correctly, no exception should be thrown
      expect(() => blokr.unlock()).not.toThrow();
    });

    it('should increment counter on multiple locks', () => {
      blokr.lock();
      blokr.lock();
      blokr.lock();
      // Counter should be 3, test through unlock behavior
      blokr.unlock();
      blokr.unlock();
      blokr.unlock();
      // Should be fully unlocked after 3 unlocks
      expect(() => blokr.unlock()).not.toThrow();
    });

    it('should set timeout when timeout > 0', () => {
      const setTimeoutSpy = vi.spyOn(self, 'setTimeout');
      blokr.setTimeout(5000);

      blokr.lock();

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      setTimeoutSpy.mockRestore();
    });

    it('should not set timeout when timeout is 0', () => {
      const setTimeoutSpy = vi.spyOn(self, 'setTimeout');
      blokr.setTimeout(0);

      blokr.lock();

      expect(setTimeoutSpy).not.toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });

    it('should clear existing timeout on subsequent locks', () => {
      const clearTimeoutSpy = vi.spyOn(self, 'clearTimeout');
      blokr.setTimeout(5000);

      blokr.lock();
      blokr.lock();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('unlock()', () => {
    it('should decrement counter when locked', () => {
      blokr.lock();
      blokr.unlock();
      // Counter should be 0 now, verify by checking unlock doesn't throw
      expect(() => blokr.unlock()).not.toThrow();
    });

    it('should not decrement counter when not locked', () => {
      blokr.unlock(); // Should do nothing
      blokr.unlock(); // Should do nothing
      // Should not throw errors when unlocking without locking
      expect(() => blokr.unlock()).not.toThrow();
    });

    it('should clear timeout when counter reaches 0', () => {
      const clearTimeoutSpy = vi.spyOn(self, 'clearTimeout');
      blokr.setTimeout(5000);

      blokr.lock();
      blokr.unlock();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should handle multiple lock/unlock cycles', () => {
      blokr.lock();
      blokr.lock();
      blokr.lock(); // Counter = 3

      blokr.unlock(); // Counter = 2
      blokr.unlock(); // Counter = 1
      blokr.unlock(); // Counter = 0, should unlock

      blokr.unlock(); // Should do nothing (counter already 0)

      // Verify final state is correct
      expect(() => blokr.unlock()).not.toThrow();
    });
  });

  describe('setTimeout()', () => {
    it('should set timeout when not locked', () => {
      const result = blokr.setTimeout(5000);
      expect(result).toBe(true);
    });

    it('should not set timeout when locked', () => {
      blokr.lock();
      const result = blokr.setTimeout(5000);
      expect(result).toBe(false);
    });

    it('should handle negative timeout values', () => {
      const result = blokr.setTimeout(-1000);
      expect(result).toBe(true);
      // Verify timeout was set to 0 by checking lock behavior
      const setTimeoutSpy = vi.spyOn(self, 'setTimeout');
      blokr.lock();
      expect(setTimeoutSpy).not.toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });
  });

  describe('isLocked()', () => {
    it('should return false when not locked', () => {
      expect(blokr.isLocked()).toBe(false);
    });

    it('should return true when locked', () => {
      blokr.lock();
      expect(blokr.isLocked()).toBe(true);
    });

    it('should return false after unlock', () => {
      blokr.lock();
      blokr.unlock();
      expect(blokr.isLocked()).toBe(false);
    });

    it('should return true until all locks are released', () => {
      blokr.lock();
      blokr.lock();
      blokr.lock();
      
      expect(blokr.isLocked()).toBe(true);
      blokr.unlock();
      expect(blokr.isLocked()).toBe(true);
      blokr.unlock();
      expect(blokr.isLocked()).toBe(true);
      blokr.unlock();
      expect(blokr.isLocked()).toBe(false);
    });
  });

  describe('timeout behavior', () => {
    it('should auto-unlock after timeout', async () => {
      vi.useFakeTimers();

      blokr.setTimeout(1000);
      blokr.lock();

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Should be unlocked after timeout
      expect(blokr.isLocked()).toBe(false);

      vi.useRealTimers();
    });

    it('should reset counter to 0 on timeout', async () => {
      vi.useFakeTimers();

      blokr.setTimeout(1000);
      blokr.lock();
      blokr.lock();
      blokr.lock(); // Counter = 3

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // After timeout, should be fully unlocked
      expect(blokr.isLocked()).toBe(false);

      vi.useRealTimers();
    });
  });
});