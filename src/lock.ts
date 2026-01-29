export type Filter = (eventTarget: Element) => boolean;

const eventNames = [
  'click', 'contextmenu', 'dragstart', 'keydown', 'mousedown', 'mouseup',
  'pointerdown', 'pointermove', 'pointerup', 'selectstart', 'touchmove',
  'touchstart', 'wheel'
];
class Lock {
  /**
   * Event listener that blocks events based on registered filters.
   */
  private _listener: (ev: Event) => void;

  /**
   * Indicates whether the global event listener is currently active.
   */
  private _isActive: boolean;

  /**
   * Set of registered filter functions to determine which events to block.
   */
  private _filters: Set<Filter>;

  /**
   * Creates the Lock singleton instance.
   */
  constructor () {
    this._listener = (ev: Event) => {
      if (ev.target instanceof Element) {
        for (const filter of this._filters.values()) {
          if (filter(ev.target)) {
            ev.stopImmediatePropagation();
            ev.stopPropagation();
            ev.preventDefault();
            break;
          }
        }
      }
    };
    this._isActive = false;
    this._filters = new Set();
  }

  /**
   * Activates the global event listener to block events based on registered filters.
   */
  private _activate () {
    if (!this._isActive) {
      if ('addEventListener' in globalThis) {
        eventNames.forEach(eventName => globalThis.addEventListener(
          eventName,
          this._listener,
          { capture: true, passive: false }
        ));
        this._isActive = true;
      }
    }
  }

  /**
   * Deactivates the global event listener when no filters are registered.
   */
  private _deactivate () {
    if (this._isActive) {
      if ('removeEventListener' in globalThis) {
        eventNames.forEach(eventName => globalThis.removeEventListener(
          eventName,
          this._listener,
          { capture: true }
        ));
        this._isActive = false;
      }
    }
  }

  /**
   * Registers a filter function to block events on matching targets.
   * @param filter - Filter function that determines which events to block.
   */
  register (filter: Filter) {
    this._activate();
    this._filters.add(filter);
  }

  /**
   * Unregisters a previously registered filter function.
   * If no filters remain, the global event listener is deactivated.
   * @param filter - The filter function to remove.
   */
  unregister (filter: Filter) {
    this._filters.delete(filter);
    if (this._filters.size === 0) {
      this._deactivate();
    }
  }
}

export default new Lock();
