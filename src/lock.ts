const eventNames = [
  'contextmenu', 'keydown', 'mousedown', 'touchmove', 'touchstart', 'wheel'
];

const options = { capture: true, passive: false };

class Lock {
  private _locked: boolean;

  constructor () {
    this._locked = false;
    this._listener = this._listener.bind(this);
    if (typeof self !== 'undefined') {
      eventNames.forEach(eventName => self.addEventListener(eventName, this._listener, options));
    }
  }

  private _listener (evt: Event) {
    if (this._locked) {
      evt.stopImmediatePropagation();
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  on () {
    if (this._locked) {
      return false;
    }
    this._locked = true;

    return true;
  }

  off () {
    if (!this._locked) {
      return;
    }
    this._locked = false;
  }
}

export default new Lock();
