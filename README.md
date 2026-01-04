# Blokr

[![CI](https://github.com/knowledgecode/blokr/actions/workflows/ci.yml/badge.svg)](https://github.com/knowledgecode/blokr/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/blokr)](https://www.npmjs.com/package/blokr)

Lightweight library to block user interactions in browsers.

## ⚠️ Breaking Changes in v0.3.0

Version 0.3.0 introduces significant API changes from v0.2.x:

- **Factory function instead of singleton**: `blokr()` returns an instance instead of being a singleton object
- **Options-based API**: `lock({ timeout, scope })` instead of separate `setTimeout()` method
- **No reference counting**: Multiple `lock()` calls return `false` instead of incrementing a counter
- **No `setTimeout()` method**: Use `lock({ timeout })` option instead
- **No `unlock(abort)` parameter**: `unlock()` always releases the lock immediately

**Migration guide:** See [Migration from v0.2.x](#migration-from-v02x) below.

**Note:** This library is under active development. Future versions may introduce additional breaking changes. Please refer to the changelog before upgrading.

## Features

- **Factory-based API**: Support for both global and element-specific locks
- **Scope filtering**: Control which events to block (`inside`, `outside`, `self`)
- **No overlay elements**: Blocks interactions without adding elements to the DOM
- **All interaction types**: Blocks mouse, keyboard, touch, and wheel events
- **Per-lock timeout**: Optional automatic unlock after specified time
- **No dependencies**: Zero external dependencies
- **TypeScript**: Full type support included

## Why Blokr?

### Problems with CSS-based Solutions

While CSS `pointer-events: none` can disable interactions, it has several limitations:

1. **Cannot block keyboard events**: Tab navigation and keyboard shortcuts still work
2. **No timeout protection**: No automatic unlock if code fails to re-enable interactions
3. **Requires DOM manipulation**: Must add/remove CSS classes or inline styles
4. **Cannot scope events**: Cannot selectively block events inside/outside an element
5. **z-index issues**: Overlay approaches require careful z-index management

### How Blokr Solves These Problems

- ✅ **Blocks all interaction types**: Mouse, keyboard, touch, and wheel events
- ✅ **Optional timeout protection**: Automatically unlock after specified time
- ✅ **No DOM changes**: Works via event listeners only
- ✅ **Flexible scoping**: Block events inside, outside, or only on specific elements
- ✅ **No z-index conflicts**: No overlay elements needed
- ✅ **TypeScript support**: Full type definitions included

## Installation

```bash
npm install blokr
```

## Usage

### Basic Usage (ES Modules)

```typescript
import blokr from 'blokr';

// Global lock - blocks all user interactions
const instance = blokr();
instance.lock();

// Check if locked
if (instance.isLocked()) {
  console.log('User interactions are blocked');
}

// Unlock
instance.unlock();
```

### Element-specific Locking

```typescript
import blokr from 'blokr';

const container = document.querySelector('.container');
const instance = blokr(container);

// Block events inside the container (default scope)
instance.lock();

// Or explicitly specify scope
instance.lock({ scope: 'inside' });   // Block events inside container
instance.lock({ scope: 'outside' });  // Block events outside container
instance.lock({ scope: 'self' });     // Block events on container itself only
```

### Auto-timeout

```typescript
import blokr from 'blokr';

const instance = blokr();

// Auto-unlock after 5 seconds
instance.lock({ timeout: 5000 });

// Disable timeout (lock indefinitely)
instance.lock({ timeout: 0 });
```

### CDN Usage (UMD)

```html
<script src="https://unpkg.com/blokr/dist/blokr.js"></script>
<script>
  // Note: global name is 'blokr' (lowercase) in v0.3.0
  const instance = window.blokr();
  instance.lock();

  setTimeout(() => {
    instance.unlock();
  }, 3000);
</script>
```

### CDN Usage (ES Modules)

```html
<script type="module">
  import blokr from 'https://unpkg.com/blokr/dist/index.js';

  const instance = blokr();
  instance.lock({ timeout: 3000 });
</script>
```

## API Reference

### `blokr(target?: Element): BlokrInstance`

Returns a Blokr instance. If no target is specified, creates a global instance that blocks all events. If the same target is provided multiple times, returns the cached instance.

**Parameters:**
- `target` (optional): DOM element to scope the lock to

**Returns:** `BlokrInstance`

**Examples:**

```typescript
// Global instance (blocks all events)
const global = blokr();

// Element-specific instance
const container = document.querySelector('.modal');
const modal = blokr(container);

// Same element returns same instance
const modal2 = blokr(container);
console.log(modal === modal2); // true
```

### `instance.lock(options?: Options): boolean`

Locks user interactions. Returns `true` if lock was applied, `false` if already locked.

**Parameters:**
- `options.timeout` (optional): Auto-unlock timeout in milliseconds. Default: `0` (no timeout)
- `options.scope` (optional): Event blocking scope. Default: `'inside'`
  - `'inside'`: Block events inside target element (default)
  - `'outside'`: Block events outside target element
  - `'self'`: Block events on target element itself only

**Returns:** `true` if lock was applied, `false` if already locked

**Examples:**

```typescript
const instance = blokr();

// Basic lock
instance.lock(); // Returns true

// Already locked
instance.lock(); // Returns false

// Lock with timeout
instance.lock({ timeout: 5000 });

// Lock with scope (requires target element)
const container = document.querySelector('.panel');
const panelInstance = blokr(container);
panelInstance.lock({ scope: 'inside' });
```

### `instance.unlock(): void`

Unlocks user interactions and clears any pending timeout. Safe to call even when not locked.

**Examples:**

```typescript
const instance = blokr();
instance.lock();
instance.unlock();

// Safe to call multiple times
instance.unlock();
instance.unlock();
```

### `instance.isLocked(): boolean`

Returns `true` if user interactions are currently locked.

**Returns:** `boolean`

**Examples:**

```typescript
const instance = blokr();
console.log(instance.isLocked()); // false

instance.lock();
console.log(instance.isLocked()); // true

instance.unlock();
console.log(instance.isLocked()); // false
```

## Examples

### POST Processing with Timeout

```typescript
import blokr from 'blokr';

async function saveUserProfile(formData: FormData) {
  const instance = blokr();

  // Block all interactions with 10-second timeout
  instance.lock({ timeout: 10000 });

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      showSuccessMessage();
    }
  } finally {
    instance.unlock();
  }
}
```

### Modal Dialog

```typescript
import blokr from 'blokr';

function openModal() {
  const modal = document.querySelector('.modal');
  const instance = blokr(modal);

  modal.classList.add('visible');

  // Block all interactions outside the modal
  instance.lock({ scope: 'outside' });
}

function closeModal() {
  const modal = document.querySelector('.modal');
  const instance = blokr(modal);

  modal.classList.remove('visible');
  instance.unlock();
}
```

### Form Panel Lock

```typescript
import blokr from 'blokr';

function disableFormPanel() {
  const panel = document.querySelector('.settings-panel');
  const instance = blokr(panel);

  // Disable interactions only inside the panel
  instance.lock({ scope: 'inside' });
}

function enableFormPanel() {
  const panel = document.querySelector('.settings-panel');
  const instance = blokr(panel);

  instance.unlock();
}
```

### Loading Overlay Alternative

```typescript
import blokr from 'blokr';

async function loadData() {
  const instance = blokr();

  // No overlay element needed!
  instance.lock({ timeout: 30000 });

  try {
    const data = await fetch('/api/data').then(r => r.json());
    renderData(data);
  } finally {
    instance.unlock();
  }
}
```

## Migration from v0.2.x

### API Changes

| v0.2.x | v0.3.0 |
|--------|--------|
| `blokr.lock()` | `blokr().lock()` |
| `blokr.unlock()` | `blokr().unlock()` |
| `blokr.unlock(true)` | `blokr().unlock()` (always immediate) |
| `blokr.setTimeout(ms)` | `blokr().lock({ timeout: ms })` |
| `blokr.isLocked()` | `blokr().isLocked()` |
| `window.Blokr` (UMD) | `window.blokr` (UMD) |

### Reference Counting Removed

In v0.2.x, multiple `lock()` calls incremented a counter:

```typescript
// v0.2.x
blokr.lock();    // Count: 1
blokr.lock();    // Count: 2
blokr.unlock();  // Count: 1 (still locked)
blokr.unlock();  // Count: 0 (unlocked)
```

In v0.3.0, `lock()` returns `false` if already locked:

```typescript
// v0.3.0
const instance = blokr();
instance.lock();    // Returns true
instance.lock();    // Returns false (already locked)
instance.unlock();  // Unlocked
```

### Element-specific Locking (New Feature)

```typescript
// v0.3.0 only - new feature not available in v0.2.x
const container = document.querySelector('.container');
const instance = blokr(container);

// Block events inside container
instance.lock({ scope: 'inside' });

// Block events outside container
instance.lock({ scope: 'outside' });

// Block events on container itself only
instance.lock({ scope: 'self' });
```

## Limitations

- **Only blocks genuine user interactions**: Programmatically triggered events (e.g., `element.click()`) are not blocked.
- **Event listener priority**: Event listeners are registered at the capture phase. May not work correctly when used with event delegation libraries. Loading Blokr before other libraries may resolve this issue.
- **Target-specific locks accept Elements only**: The `blokr(target)` factory function only accepts DOM `Element` nodes. To block interactions across the entire page, use the global lock: `blokr()` (without a target parameter).

## License

MIT
