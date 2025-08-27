import lock from './lock.ts';

class Blokr {
  private _timeout: number;

  private _timerId: number;

  private _counter: number;

  /**
   * Creates the Blokr singleton instance.
   */
  constructor () {
    this._timeout = 10000;  // Default timeout of 10 seconds
    this._timerId = 0;
    this._counter = 0;
  }

  /**
   * Prevents user interactions.
   */
  lock () {
    lock.on();
    this._counter++;

    if (this._timerId) {
      self.clearTimeout(this._timerId);
      this._timerId = 0;
    }
    if (this._timeout) {
      this._timerId = self.setTimeout(() => {
        this._timerId = 0;
        this._counter = 0;
        lock.off();
      }, this._timeout);
    }
  }

  /**
   * Checks if user interactions are currently prevented.
   * @returns {boolean} - Returns true if interactions are blocked, false otherwise.
   */
  isLocked () {
    return this._counter > 0;
  }

  /**
   * Sets the timeout duration for automatic unlock.
   * @param timeout - The timeout in milliseconds. Set to 0 to disable automatic unlock. Negative values are treated as 0.
   * @returns {boolean} - Returns true if the timeout was set successfully, false if currently locked.
   */
  setTimeout(timeout: number) {
    if (!this.isLocked()) {
      this._timeout = timeout < 0 ? 0 : timeout;
      return true;
    }
    return false;
  }

  /**
   * Decrements the internal counter and releases the lock when the counter reaches zero.
   * If abort is true, the counter is reset to zero immediately, effectively releasing the lock.
   * Clears any pending timeout and triggers the unlock event.
   * @param abort - If true, immediately resets the counter to zero and releases the lock
   */
  unlock (abort = false) {
    if (this._counter > 0) {
      this._counter--;

      if (abort) {
        this._counter = 0;
      }
      if (this._counter === 0) {
        if (this._timerId) {
          self.clearTimeout(this._timerId);
          this._timerId = 0;
        }
        lock.off();
      }
    }
  }
}

export default new Blokr();
