import { describe, it, expect, afterEach, vi } from 'vitest';
import blokr from '../src/blokr.ts';

describe('Event Blocking Integration', () => {
  afterEach(() => {
    // Clean up any locks after each test
    const globalInstance = blokr();
    if (globalInstance.isLocked()) {
      globalInstance.unlock();
    }
  });

  describe('Global Event Blocking', () => {
    it('should block mousedown events when locked globally', () => {
      const handler = vi.fn();
      const element = document.createElement('button');
      element.addEventListener('mousedown', handler);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });

    it('should allow mousedown events when unlocked', () => {
      const handler = vi.fn();
      const element = document.createElement('button');
      element.addEventListener('mousedown', handler);
      document.body.appendChild(element);

      // Don't lock

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      document.body.removeChild(element);
    });

    it('should block keydown events when locked globally', () => {
      const handler = vi.fn();
      const element = document.createElement('input');
      element.addEventListener('keydown', handler);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });

    it('should block contextmenu events when locked globally', () => {
      const handler = vi.fn();
      const element = document.createElement('div');
      element.addEventListener('contextmenu', handler);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });

    it('should block wheel events when locked globally', () => {
      const handler = vi.fn();
      const element = document.createElement('div');
      element.addEventListener('wheel', handler);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: 100
      });

      element.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });

    it('should block touchstart events when locked globally', () => {
      const handler = vi.fn();
      const element = document.createElement('div');
      element.addEventListener('touchstart', handler);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
          identifier: 0,
          target: element,
          clientX: 100,
          clientY: 100
        })]
      });

      element.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });

    it('should block touchmove events when locked globally', () => {
      const handler = vi.fn();
      const element = document.createElement('div');
      element.addEventListener('touchmove', handler);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
          identifier: 0,
          target: element,
          clientX: 110,
          clientY: 110
        })]
      });

      element.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });
  });

  describe('Target-specific Event Blocking (scope: inside)', () => {
    it('should block events inside target with default scope', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      const handler = vi.fn();
      button.addEventListener('mousedown', handler);
      container.appendChild(button);
      document.body.appendChild(container);

      const instance = blokr(container);
      instance.lock();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      button.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(container);
    });

    it('should allow events inside target when unlocked', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      const handler = vi.fn();
      button.addEventListener('mousedown', handler);
      container.appendChild(button);
      document.body.appendChild(container);

      const instance = blokr(container);
      instance.lock();
      instance.unlock();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      button.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      document.body.removeChild(container);
    });

    it('should block events on child elements of target', () => {
      const container = document.createElement('div');
      const child = document.createElement('span');
      const handler = vi.fn();
      child.addEventListener('mousedown', handler);
      container.appendChild(child);
      document.body.appendChild(container);

      const instance = blokr(container);
      instance.lock({ scope: 'inside' });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      child.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(container);
    });
  });

  describe('Target-specific Event Blocking (scope: outside)', () => {
    it('should block events outside target', () => {
      const container = document.createElement('div');
      const outside = document.createElement('button');
      const handler = vi.fn();
      outside.addEventListener('mousedown', handler);
      document.body.appendChild(container);
      document.body.appendChild(outside);

      const instance = blokr(container);
      instance.lock({ scope: 'outside' });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      outside.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(container);
      document.body.removeChild(outside);
    });

    it('should allow events inside target with scope outside', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      const handler = vi.fn();
      button.addEventListener('mousedown', handler);
      container.appendChild(button);
      document.body.appendChild(container);

      const instance = blokr(container);
      instance.lock({ scope: 'outside' });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      button.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(container);
    });
  });

  describe('Target-specific Event Blocking (scope: self)', () => {
    it('should block events on target itself', () => {
      const target = document.createElement('button');
      const handler = vi.fn();
      target.addEventListener('mousedown', handler);
      document.body.appendChild(target);

      const instance = blokr(target);
      instance.lock({ scope: 'self' });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      target.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(target);
    });

    it('should allow events on child elements with scope self', () => {
      const parent = document.createElement('div');
      const child = document.createElement('button');
      const handler = vi.fn();
      child.addEventListener('mousedown', handler);
      parent.appendChild(child);
      document.body.appendChild(parent);

      const instance = blokr(parent);
      instance.lock({ scope: 'self' });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      child.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(parent);
    });

    it('should allow events outside target with scope self', () => {
      const target = document.createElement('div');
      const outside = document.createElement('button');
      const handler = vi.fn();
      outside.addEventListener('mousedown', handler);
      document.body.appendChild(target);
      document.body.appendChild(outside);

      const instance = blokr(target);
      instance.lock({ scope: 'self' });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      outside.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(target);
      document.body.removeChild(outside);
    });
  });

  describe('Event Propagation', () => {
    it('should stop immediate propagation of blocked events', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const element = document.createElement('button');
      element.addEventListener('mousedown', handler1);
      element.addEventListener('mousedown', handler2);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });

    it('should prevent default behavior of blocked events', () => {
      const element = document.createElement('a');
      element.href = '#';
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      element.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();

      instance.unlock();
      document.body.removeChild(element);
    });
  });

  describe('Multiple Independent Locks', () => {
    it('should support independent locks on different targets', () => {
      const container1 = document.createElement('div');
      const button1 = document.createElement('button');
      const handler1 = vi.fn();
      button1.addEventListener('mousedown', handler1);
      container1.appendChild(button1);
      document.body.appendChild(container1);

      const container2 = document.createElement('div');
      const button2 = document.createElement('button');
      const handler2 = vi.fn();
      button2.addEventListener('mousedown', handler2);
      container2.appendChild(button2);
      document.body.appendChild(container2);

      const instance1 = blokr(container1);
      const instance2 = blokr(container2);

      // Lock only container1
      instance1.lock();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      button1.dispatchEvent(event);
      button2.dispatchEvent(event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();

      // Lock container2
      instance2.lock();
      handler2.mockClear();

      button1.dispatchEvent(event);
      button2.dispatchEvent(event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();

      instance1.unlock();
      instance2.unlock();
      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });

    it('should respect each instance scope independently', () => {
      const container1 = document.createElement('div');
      const button1 = document.createElement('button');
      const handler1 = vi.fn();
      button1.addEventListener('mousedown', handler1);
      container1.appendChild(button1);
      document.body.appendChild(container1);

      const container2 = document.createElement('div');
      const button2 = document.createElement('button');
      const handler2 = vi.fn();
      button2.addEventListener('mousedown', handler2);
      container2.appendChild(button2);
      document.body.appendChild(container2);

      const outside = document.createElement('button');
      const outsideHandler = vi.fn();
      outside.addEventListener('mousedown', outsideHandler);
      document.body.appendChild(outside);

      const instance1 = blokr(container1);
      const instance2 = blokr(container2);

      // Container1: scope inside (blocks events inside container1)
      instance1.lock({ scope: 'inside' });
      // Container2: scope outside (blocks events outside container2)
      instance2.lock({ scope: 'outside' });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      // Event inside container1 - should be blocked by instance1
      button1.dispatchEvent(event);
      expect(handler1).not.toHaveBeenCalled();

      // Event inside container2 - should not be blocked (outside scope)
      button2.dispatchEvent(event);
      expect(handler2).toHaveBeenCalled();

      // Event outside both containers - should be blocked by instance2
      outside.dispatchEvent(event);
      expect(outsideHandler).not.toHaveBeenCalled();

      instance1.unlock();
      instance2.unlock();
      document.body.removeChild(container1);
      document.body.removeChild(container2);
      document.body.removeChild(outside);
    });
  });

  describe('Lock/Unlock State Changes', () => {
    it('should allow events after unlocking', () => {
      const handler = vi.fn();
      const element = document.createElement('button');
      element.addEventListener('mousedown', handler);
      document.body.appendChild(element);

      const instance = blokr();
      instance.lock();
      instance.unlock();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      element.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      document.body.removeChild(element);
    });

    it('should handle rapid lock/unlock cycles', () => {
      const handler = vi.fn();
      const element = document.createElement('button');
      element.addEventListener('mousedown', handler);
      document.body.appendChild(element);

      const instance = blokr();

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });

      // Rapid cycle
      instance.lock();
      instance.unlock();
      instance.lock();
      instance.unlock();

      element.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();

      document.body.removeChild(element);
    });
  });
});
