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
   * Stops preventing user interactions.
   */
  unlock () {
    if (this._counter > 0) {
      this._counter--;

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
