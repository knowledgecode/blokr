import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { RefObject } from 'react';
import { useBlokr } from '../src/react.ts';
import blokr from '../src/index.ts';

/**
 * Test helper to set ref.current value.
 * In production, React automatically sets ref.current, but in tests we need to set it manually.
 */
const setRef = <T extends Element>(ref: RefObject<T | null>, element: T): void => {
  Object.defineProperty(ref, 'current', {
    value: element,
    writable: true,
    configurable: true
  });
};

describe('useBlokr Hook', () => {
  describe('Basic Behavior', () => {
    it('should return a tuple with ref and three functions', () => {
      const { result, unmount } = renderHook(() => useBlokr());
      const { target, lock, unlock, isLocked } = result.current;

      expect(target).toBeDefined();
      expect(typeof lock).toBe('function');
      expect(typeof unlock).toBe('function');
      expect(typeof isLocked).toBe('function');

      unmount();
    });

    it('should have ref.current as null initially', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target } = result.current;

      expect(target.current).toBeNull();

      unmount();
    });

    it('should have lock, unlock, isLocked as functions', () => {
      const { result, unmount } = renderHook(() => useBlokr());
      const { lock, unlock, isLocked } = result.current;

      expect(lock).toBeInstanceOf(Function);
      expect(unlock).toBeInstanceOf(Function);
      expect(isLocked).toBeInstanceOf(Function);

      unmount();
    });
  });

  describe('Ref Assignment', () => {
    it('should assign ref to DOM element correctly', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      expect(target.current).toBe(div);

      unmount();
    });

    it('should handle multiple elements', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target } = result.current;

      const div1 = document.createElement('div');
      const div2 = document.createElement('div');

      setRef(target, div1);
      expect(target.current).toBe(div1);

      setRef(target, div2);
      expect(target.current).toBe(div2);

      unmount();
    });

    it('should support different element types via generics', () => {
      const { result: resultDiv, unmount: unmountDiv } = renderHook(() => useBlokr<HTMLDivElement>());
      const { result: resultButton, unmount: unmountButton } = renderHook(() => useBlokr<HTMLButtonElement>());

      const div = document.createElement('div');
      const button = document.createElement('button');

      setRef(resultDiv.current.target, div);
      setRef(resultButton.current.target, button);

      expect(resultDiv.current.target.current).toBe(div);
      expect(resultButton.current.target.current).toBe(button);

      unmountDiv();
      unmountButton();
    });
  });

  describe('Lock Function', () => {
    it('should return false if ref.current is null', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { lock } = result.current;

      let returnValue = true;

      act(() => {
        returnValue = lock();
      });

      expect(returnValue).toBe(false);

      unmount();
    });

    it('should return true when ref.current is set and lock succeeds', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      let returnValue = false;

      act(() => {
        returnValue = lock();
      });

      expect(returnValue).toBe(true);

      act(() => {
        unlock();
      });
      unmount();
    });

    it('should pass options to blokr().lock()', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      const spy = vi.spyOn(blokr(div), 'lock');

      act(() => {
        lock({ scope: 'inside', timeout: 5000 });
      });

      expect(spy).toHaveBeenCalledWith({ scope: 'inside', timeout: 5000 });

      act(() => {
        unlock();
      });
      spy.mockRestore();
      unmount();
    });

    it('should accept scope option with all valid values', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      const spy = vi.spyOn(blokr(div), 'lock');

      act(() => {
        lock({ scope: 'inside' });
      });

      expect(spy).toHaveBeenCalledWith({ scope: 'inside' });

      act(() => {
        unlock();
      });

      act(() => {
        lock({ scope: 'outside' });
      });

      expect(spy).toHaveBeenCalledWith({ scope: 'outside' });

      act(() => {
        unlock();
      });

      act(() => {
        lock({ scope: 'self' });
      });

      expect(spy).toHaveBeenCalledWith({ scope: 'self' });

      act(() => {
        unlock();
      });

      spy.mockRestore();
      unmount();
    });

    it('should return false if already locked', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      let firstLock: boolean | undefined;
      let secondLock: boolean | undefined;

      act(() => {
        firstLock = lock();
      });

      act(() => {
        secondLock = lock();
      });

      expect(firstLock).toBe(true);
      expect(secondLock).toBe(false);

      act(() => {
        unlock();
      });
      unmount();
    });

    it('should support timeout option', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      const spy = vi.spyOn(blokr(div), 'lock');

      act(() => {
        lock({ timeout: 3000 });
      });

      expect(spy).toHaveBeenCalledWith({ timeout: 3000 });

      act(() => {
        unlock();
      });
      spy.mockRestore();
      unmount();
    });
  });

  describe('Unlock Function', () => {
    it('should not throw error if ref.current is null', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { unlock } = result.current;

      expect(() => {
        act(() => {
          unlock();
        });
      }).not.toThrow();

      unmount();
    });

    it('should unlock after lock', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock, isLocked } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      act(() => {
        lock();
      });

      let locked = isLocked();
      expect(locked).toBe(true);

      act(() => {
        unlock();
      });

      locked = isLocked();
      expect(locked).toBe(false);

      unmount();
    });

    it('should not throw error if not locked', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      expect(() => {
        act(() => {
          unlock();
        });
      }).not.toThrow();

      unmount();
    });
  });

  describe('IsLocked Function', () => {
    it('should return false if ref.current is null', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { isLocked } = result.current;

      const locked = isLocked();
      expect(locked).toBe(false);

      unmount();
    });

    it('should return false when not locked', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, isLocked } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      const locked = isLocked();
      expect(locked).toBe(false);

      unmount();
    });

    it('should return true when locked', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock, isLocked } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      act(() => {
        lock();
      });

      const locked = isLocked();
      expect(locked).toBe(true);

      act(() => {
        unlock();
      });
      unmount();
    });

    it('should return false after unlock', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock, isLocked } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      act(() => {
        lock();
      });

      act(() => {
        unlock();
      });

      const locked = isLocked();
      expect(locked).toBe(false);

      unmount();
    });
  });

  describe('Function Memoization with useCallback', () => {
    it('should memoize all functions across re-renders', () => {
      const { result, rerender, unmount } = renderHook(() => useBlokr());
      const { lock: lock1, unlock: unlock1, isLocked: isLocked1 } = result.current;

      rerender();
      const { lock: lock2, unlock: unlock2, isLocked: isLocked2 } = result.current;

      expect(lock1).toBe(lock2);
      expect(unlock1).toBe(unlock2);
      expect(isLocked1).toBe(isLocked2);

      unmount();
    });

    it('should maintain memoization through multiple re-renders', () => {
      const { result, rerender, unmount } = renderHook(() => useBlokr());
      const { lock: lock1, unlock: unlock1, isLocked: isLocked1 } = result.current;

      for (let i = 0; i < 5; i++) {
        rerender();
      }

      const { lock: lock2, unlock: unlock2, isLocked: isLocked2 } = result.current;

      expect(lock1).toBe(lock2);
      expect(unlock1).toBe(unlock2);
      expect(isLocked1).toBe(isLocked2);

      unmount();
    });
  });

  describe('Integration Tests', () => {
    it('should actually block events when locked', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      document.body.appendChild(div);
      setRef(target, div);

      const handler = vi.fn();
      div.addEventListener('mousedown', handler);

      act(() => {
        lock();
      });

      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      div.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      act(() => {
        unlock();
      });
      div.removeEventListener('mousedown', handler);
      document.body.removeChild(div);
      unmount();
    });

    it('should allow events when not locked', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target } = result.current;

      const div = document.createElement('div');
      document.body.appendChild(div);
      setRef(target, div);

      const handler = vi.fn();
      div.addEventListener('mousedown', handler);

      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      div.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      // Cleanup
      div.removeEventListener('mousedown', handler);
      document.body.removeChild(div);
      unmount();
    });

    it('should block events with "inside" scope', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      const child = document.createElement('span');
      div.appendChild(child);
      document.body.appendChild(div);
      setRef(target, div);

      const divHandler = vi.fn();
      const childHandler = vi.fn();
      div.addEventListener('mousedown', divHandler);
      child.addEventListener('mousedown', childHandler);

      act(() => {
        lock({ scope: 'inside' });
      });

      const divEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      const childEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      div.dispatchEvent(divEvent);
      child.dispatchEvent(childEvent);

      expect(divHandler).not.toHaveBeenCalled();
      expect(childHandler).not.toHaveBeenCalled();

      act(() => {
        unlock();
      });
      div.removeEventListener('mousedown', divHandler);
      child.removeEventListener('mousedown', childHandler);
      document.body.removeChild(div);
      unmount();
    });

    it('should work independently with multiple instances', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() => useBlokr<HTMLDivElement>());
      const { result: result2, unmount: unmount2 } = renderHook(() => useBlokr<HTMLDivElement>());

      const { target: target1, lock: lock1, unlock: unlock1, isLocked: isLocked1 } = result1.current;
      const { target: target2, lock: lock2, unlock: unlock2, isLocked: isLocked2 } = result2.current;

      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      setRef(target1, div1);
      setRef(target2, div2);

      act(() => {
        lock1();
      });

      expect(isLocked1()).toBe(true);
      expect(isLocked2()).toBe(false);

      act(() => {
        lock2();
      });

      expect(isLocked1()).toBe(true);
      expect(isLocked2()).toBe(true);

      act(() => {
        unlock1();
      });

      expect(isLocked1()).toBe(false);
      expect(isLocked2()).toBe(true);

      act(() => {
        unlock2();
      });

      unmount1();
      unmount2();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useBlokr());
        unmount();
      }
    });

    it('should clean up properly on unmount', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      act(() => {
        lock();
      });

      expect(result.current.isLocked()).toBe(true);

      act(() => {
        unlock();
      });
      unmount();

      expect(() => {
        act(() => {
          unlock();
        });
      }).not.toThrow();
    });

    it('should be safe to call lock before element mount', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { lock } = result.current;

      let returnValue = true;

      act(() => {
        returnValue = lock();
      });

      expect(returnValue).toBe(false);

      unmount();
    });

    it('should support generic type parameter with specific types', () => {
      const { result: resultDiv, unmount: unmountDiv } = renderHook(() => useBlokr<HTMLDivElement>());
      const { result: resultButton, unmount: unmountButton } = renderHook(() => useBlokr<HTMLButtonElement>());
      const { result: resultInput, unmount: unmountInput } = renderHook(() => useBlokr<HTMLInputElement>());

      const div = document.createElement('div');
      const button = document.createElement('button');
      const input = document.createElement('input');

      setRef(resultDiv.current.target, div);
      setRef(resultButton.current.target, button);
      setRef(resultInput.current.target, input);

      expect(resultDiv.current.target.current?.tagName).toBe('DIV');
      expect(resultButton.current.target.current?.tagName).toBe('BUTTON');
      expect(resultInput.current.target.current?.tagName).toBe('INPUT');

      unmountDiv();
      unmountButton();
      unmountInput();
    });

    it('should handle ref change gracefully', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { target, lock, unlock, isLocked } = result.current;

      const div1 = document.createElement('div');
      const div2 = document.createElement('div');

      setRef(target, div1);

      act(() => {
        lock();
      });

      expect(isLocked()).toBe(true);

      // Change ref to different element
      setRef(target, div2);

      // New element should not be locked
      const newIsLocked = isLocked();
      expect(newIsLocked).toBe(false);

      act(() => {
        unlock();
      });
      unmount();
    });

    it('should work with default generic parameter', () => {
      const { result, unmount } = renderHook(() => useBlokr());
      const { target, lock, unlock } = result.current;

      const element = document.createElement('div');
      setRef(target, element);

      act(() => {
        lock();
      });

      expect(result.current.isLocked()).toBe(true);

      act(() => {
        unlock();
      });
      unmount();
    });
  });

  describe('allowGlobal Option', () => {
    it('should work with allowGlobal=true when ref.current is null', () => {
      const { result, unmount } = renderHook(() => useBlokr(true));
      const { lock, unlock, isLocked } = result.current;

      let returnValue = false;

      act(() => {
        returnValue = lock();
      });

      expect(returnValue).toBe(true);
      expect(isLocked()).toBe(true);

      act(() => {
        unlock();
      });

      expect(isLocked()).toBe(false);

      unmount();
    });

    it('should use global blokr instance when allowGlobal=true and ref is null', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>(true));
      const { lock, unlock } = result.current;

      const spy = vi.spyOn(blokr(undefined), 'lock');

      act(() => {
        lock({ timeout: 5000 });
      });

      expect(spy).toHaveBeenCalledWith({ timeout: 5000 });

      act(() => {
        unlock();
      });

      spy.mockRestore();
      unmount();
    });

    it('should prefer ref element over global when both allowGlobal=true and ref is set', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>(true));
      const { target, lock, unlock } = result.current;

      const div = document.createElement('div');
      setRef(target, div);

      const globalSpy = vi.spyOn(blokr(undefined), 'lock');
      const elementSpy = vi.spyOn(blokr(div), 'lock');

      act(() => {
        lock();
      });

      expect(elementSpy).toHaveBeenCalled();
      expect(globalSpy).not.toHaveBeenCalled();

      act(() => {
        unlock();
      });

      globalSpy.mockRestore();
      elementSpy.mockRestore();
      unmount();
    });

    it('should return false when allowGlobal=false (default) and ref.current is null', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { lock, isLocked } = result.current;

      let returnValue = true;

      act(() => {
        returnValue = lock();
      });

      expect(returnValue).toBe(false);
      expect(isLocked()).toBe(false);

      unmount();
    });

    it('should do nothing on unlock when allowGlobal=false and ref.current is null', () => {
      const { result, unmount } = renderHook(() => useBlokr<HTMLDivElement>());
      const { unlock, isLocked } = result.current;

      expect(() => {
        act(() => {
          unlock();
        });
      }).not.toThrow();

      expect(isLocked()).toBe(false);

      unmount();
    });

    it('should recreate functions when allowGlobal value changes', () => {
      const { result, rerender, unmount } = renderHook(
        ({ allowGlobal }) => useBlokr<HTMLDivElement>(allowGlobal),
        { initialProps: { allowGlobal: false } }
      );

      const { lock: lock1, unlock: unlock1, isLocked: isLocked1 } = result.current;

      rerender({ allowGlobal: true });

      const { lock: lock2, unlock: unlock2, isLocked: isLocked2 } = result.current;

      // Functions should be recreated when allowGlobal changes
      expect(lock1).not.toBe(lock2);
      expect(unlock1).not.toBe(unlock2);
      expect(isLocked1).not.toBe(isLocked2);

      unmount();
    });

    it('should switch behavior when allowGlobal changes from true to false', () => {
      const { result, rerender, unmount } = renderHook(
        ({ allowGlobal }) => useBlokr<HTMLDivElement>(allowGlobal),
        { initialProps: { allowGlobal: true } }
      );

      let returnValue = false;

      // With allowGlobal=true, should work even if ref.current is null
      act(() => {
        returnValue = result.current.lock();
      });

      expect(returnValue).toBe(true);

      act(() => {
        result.current.unlock();
      });

      // Change to allowGlobal=false
      rerender({ allowGlobal: false });

      // With allowGlobal=false, should return false if ref.current is null
      act(() => {
        returnValue = result.current.lock();
      });

      expect(returnValue).toBe(false);

      unmount();
    });

    it('should not affect other instances when using global instance', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() => useBlokr<HTMLDivElement>(true));
      const { result: result2, unmount: unmount2 } = renderHook(() => useBlokr<HTMLDivElement>(true));

      const { lock: lock1, unlock: unlock1, isLocked: isLocked1 } = result1.current;
      const { isLocked: isLocked2 } = result2.current;

      // Both should use the same global instance
      act(() => {
        lock1();
      });

      // Both should report as locked since they share the same global instance
      expect(isLocked1()).toBe(true);
      expect(isLocked2()).toBe(true);

      act(() => {
        unlock1();
      });

      // Both should report as unlocked
      expect(isLocked1()).toBe(false);
      expect(isLocked2()).toBe(false);

      unmount1();
      unmount2();
    });
  });
});
