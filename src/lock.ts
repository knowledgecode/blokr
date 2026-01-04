export type Filter = (eventTarget: Element) => boolean;

const eventNames = [
  'contextmenu', 'keydown', 'mousedown', 'touchmove', 'touchstart', 'wheel'
];

class Lock {
  private _filters: Set<Filter>;

  /**
   * Creates the Lock singleton instance.
   */
  constructor () {
    this._filters = new Set();

    if ('addEventListener' in globalThis) {
      eventNames.forEach(eventName => globalThis.addEventListener(
        eventName,
        this._listener.bind(this),
        { capture: true, passive: false }
      ));
    }
  }

  /**
   * Blocks user interactions when the lock is active.
   * @param evt - The event to be blocked.
   */
  private _listener (evt: Event) {
    if (evt.target instanceof Element) {
      for (const filter of this._filters.values()) {
        if (filter(evt.target)) {
          evt.stopImmediatePropagation();
          evt.stopPropagation();
          evt.preventDefault();
          break;
        }
      }
    }
  }

  /**
   * Registers a filter function to block events matching the filter criteria.
   * @param filter - Filter function that determines which events to block.
   */
  register (filter: Filter) {
    this._filters.add(filter);
  }

  /**
   * Unregisters a previously registered filter function.
   * @param filter - The filter function to remove.
   */
  unregister (filter: Filter) {
    this._filters.delete(filter);
  }
}

export default new Lock();
