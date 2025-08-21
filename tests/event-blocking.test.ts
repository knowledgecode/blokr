import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import blokr from '../src/blokr.ts';

describe('Event Blocking Integration', () => {
  let testElement: HTMLElement;

  beforeEach(() => {
    // Reset singleton state
    while (blokr.isLocked()) {
      blokr.unlock();
    }
    testElement = document.createElement('button');
    testElement.textContent = 'Test Button';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // Clean up locks
    while (blokr.isLocked()) {
      blokr.unlock();
    }
    document.body.removeChild(testElement);
  });

  describe('Mousedown Events', () => {
    it('should block mousedown events when locked', () => {
      const mousedownHandler = vi.fn();
      testElement.addEventListener('mousedown', mousedownHandler);

      blokr.lock();

      // Simulate mousedown event
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      testElement.dispatchEvent(mousedownEvent);

      expect(mousedownHandler).not.toHaveBeenCalled();
    });

    it('should allow mousedown events when unlocked', () => {
      const mousedownHandler = vi.fn();
      testElement.addEventListener('mousedown', mousedownHandler);

      // Don't lock

      // Simulate mousedown event
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      testElement.dispatchEvent(mousedownEvent);

      expect(mousedownHandler).toHaveBeenCalled();
    });
  });

  describe('Keyboard Events', () => {
    it('should block keydown events when locked', () => {
      const keydownHandler = vi.fn();
      document.addEventListener('keydown', keydownHandler);

      blokr.lock();

      // Simulate keydown event
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(keydownEvent);

      expect(keydownHandler).not.toHaveBeenCalled();

      document.removeEventListener('keydown', keydownHandler);
    });

    it('should allow keydown events when unlocked', () => {
      const keydownHandler = vi.fn();
      document.addEventListener('keydown', keydownHandler);

      // Don't lock

      // Simulate keydown event
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(keydownEvent);

      expect(keydownHandler).toHaveBeenCalled();

      document.removeEventListener('keydown', keydownHandler);
    });
  });

  describe('Mouse Events', () => {

    it('should block contextmenu events when locked', () => {
      const contextmenuHandler = vi.fn();
      testElement.addEventListener('contextmenu', contextmenuHandler);

      blokr.lock();

      // Simulate contextmenu event
      const contextmenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true
      });

      testElement.dispatchEvent(contextmenuEvent);

      expect(contextmenuHandler).not.toHaveBeenCalled();
    });

    it('should block wheel events when locked', () => {
      const wheelHandler = vi.fn();
      testElement.addEventListener('wheel', wheelHandler);

      blokr.lock();

      // Simulate wheel event
      const wheelEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: 100
      });

      testElement.dispatchEvent(wheelEvent);

      expect(wheelHandler).not.toHaveBeenCalled();
    });
  });

  describe('Touch Events', () => {
    it('should block touchstart events when locked', () => {
      const touchstartHandler = vi.fn();
      testElement.addEventListener('touchstart', touchstartHandler);

      blokr.lock();

      // Simulate touchstart event
      const touchstartEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
          identifier: 0,
          target: testElement,
          clientX: 100,
          clientY: 100
        })]
      });

      testElement.dispatchEvent(touchstartEvent);

      expect(touchstartHandler).not.toHaveBeenCalled();
    });

    it('should block touchmove events when locked', () => {
      const touchmoveHandler = vi.fn();
      testElement.addEventListener('touchmove', touchmoveHandler);

      blokr.lock();

      // Simulate touchmove event
      const touchmoveEvent = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
          identifier: 0,
          target: testElement,
          clientX: 110,
          clientY: 110
        })]
      });

      testElement.dispatchEvent(touchmoveEvent);

      expect(touchmoveHandler).not.toHaveBeenCalled();
    });
  });

  describe('Event Propagation', () => {
    it('should stop immediate propagation of blocked events', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      testElement.addEventListener('mousedown', handler1);
      testElement.addEventListener('mousedown', handler2);

      blokr.lock();

      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      testElement.dispatchEvent(mousedownEvent);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should prevent default behavior of blocked events', () => {
      blokr.lock();

      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      const preventDefaultSpy = vi.spyOn(mousedownEvent, 'preventDefault');

      testElement.dispatchEvent(mousedownEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Lock/Unlock State Changes', () => {
    it('should allow events after unlocking', () => {
      const mousedownHandler = vi.fn();
      testElement.addEventListener('mousedown', mousedownHandler);

      blokr.lock();
      blokr.unlock();

      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      testElement.dispatchEvent(mousedownEvent);

      expect(mousedownHandler).toHaveBeenCalled();
    });

    it('should handle rapid lock/unlock cycles', () => {
      const mousedownHandler = vi.fn();
      testElement.addEventListener('mousedown', mousedownHandler);

      blokr.lock();
      blokr.unlock();
      blokr.lock();
      blokr.unlock();

      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      testElement.dispatchEvent(mousedownEvent);

      expect(mousedownHandler).toHaveBeenCalled();
    });
  });
});