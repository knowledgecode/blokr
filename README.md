# Blokr

[![CI](https://github.com/knowledgecode/blokr/actions/workflows/ci.yml/badge.svg)](https://github.com/knowledgecode/blokr/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/blokr)](https://www.npmjs.com/package/blokr)

Lightweight library to block user interactions in browsers.

## Features

- **Factory-based API**: Support for both global and element-specific locks
- **No overlay elements**: Blocks interactions without adding elements to the DOM
- **Scope filtering**: Control which events to block (`inside`, `outside`, `self`)
- **Per-lock timeout**: Optional automatic unlock after specified time
- **TypeScript**: Full type support included
- **React Hook**: Built-in `useBlokr()` hook for React components

## Why Blokr?

### Comparison with Alternative Solutions

Blokr provides a unique approach to blocking user interactions. Here's how it compares with other techniques:

#### The `inert` Attribute

The HTML5 `inert` attribute marks an element as "inert," preventing user interactions including keyboard navigation.

#### CSS `pointer-events: none`

CSS `pointer-events: none` disables mouse and touch events on elements, but cannot block keyboard events or prevent tab navigation.

#### The `<dialog>` Element

The HTML5 `<dialog>` element creates a modal dialog but adds a DOM element and provides limited scope flexibility for non-modal use cases.

#### Comparison Summary

| Feature | Blokr | inert | pointer-events | dialog |
|---------|-------|-------|----------------|--------|
| Blocks keyboard events | ✅ | ✅ | ❌ | ✅ |
| Global interaction lock | ✅ | ❌ | ❌ | ❌ |
| Inside/outside scope | ✅ | ❌ | ❌ | ❌ |
| Timeout protection | ✅ | ❌ | ❌ | ❌ |
| No DOM overlay | ✅ | ✅ | ✅ | ❌ |
| No DOM modifications | ✅ | ❌ | ✅ | ❌ |

**Key differentiators:**

- **Global interaction lock**: Blokr can block interactions across the entire page, not just within specific elements
- **Inside/outside scope**: Unique ability to selectively block events inside or outside a target element
- **Timeout protection**: Automatic unlock prevents permanent locks due to errors or forgotten cleanup
- **No DOM modifications**: Works purely via event listeners without modifying DOM structure or attributes

## What's New in v0.4.0

- **React Hook support**: New `useBlokr()` hook for React applications (React 18+ required)

## ⚠️ Breaking Changes in v0.4.0

- **UMD format removed**: CDN usage now requires ES modules only (`blokr/dist/index.js`)
- **No breaking changes to core API**: All v0.3.0 JavaScript APIs remain unchanged

For changes from v0.2.x, see the [Migration from v0.2.x](#migration-from-v02x) section below.

**Note:** This library is under active development. Future versions may introduce additional breaking changes. Please refer to the changelog before upgrading.

## Installation

```bash
npm install blokr
```

### React Hook Support

The `useBlokr()` React Hook is included in the same package. React 18.0+ or React 19.0+ is required to use the hook:

```bash
npm install blokr react
```

The `react` package is an optional peer dependency. If you don't use React, you can ignore this requirement.

## Usage (Vanilla)

### Basic Usage

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
instance.lock({ scope: 'self' });     // Block events on the container only
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
  - `'inside'`: Block events inside the target element (default)
  - `'outside'`: Block events outside the target element
  - `'self'`: Block events on the target element only

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

## React Hook

The `useBlokr()` hook provides a React-friendly way to manage user interaction blocking. It works seamlessly with the factory-based API and manages refs automatically.

### Import

```typescript
import { useBlokr } from 'blokr/react';
```

### Basic Usage

```tsx
import { useBlokr } from 'blokr/react';

export function PageWithLinks() {
  const { target, lock, unlock, isLocked } = useBlokr<HTMLDivElement>();

  const handleLock = () => {
    lock({ timeout: 5000 }); // Auto-unlock after 5 seconds
  };

  return (
    <>
      <div ref={target}>
        <a href="/page1">Go to Page 1</a>
      </div>
      <button onClick={handleLock}>Lock Link</button>
      <button onClick={unlock}>Unlock</button>
    </>
  );
}
```

### Options

The `lock()` function accepts the same options as the core API:

```tsx
const { target, lock, unlock } = useBlokr<HTMLDivElement>();

// With timeout (auto-unlock after 5 seconds)
lock({ timeout: 5000 });

// With scope
lock({ scope: 'inside' });    // Block inside the element
lock({ scope: 'outside' });   // Block outside the element
lock({ scope: 'self' });      // Block on the element only

// With both options
lock({ scope: 'inside', timeout: 5000 });
```

### Hook API

#### `useBlokr<T = Element>(allowGlobal?: boolean): { target: RefObject<T | null>; lock: (options?: Options) => boolean; unlock: () => void; isLocked: () => boolean }`

Returns an object containing a ref and three control functions for managing user interaction blocking.

**Type Parameters:**
- `T` (optional): The DOM element type. Default: `Element`

**Parameters:**
- `allowGlobal` (optional): If `true`, enables global lock mode that blocks interactions across the entire page instead of a specific element. When using global lock, the `target` ref is not needed. Default: `false`

**Returns:** An object with:
- `target`: A React ref to assign to the target element (`RefObject<T | null>`)
- `lock`: Function to lock user interactions on the element (`(options?: Options) => boolean`)
- `unlock`: Function to unlock user interactions (`() => void`)
- `isLocked`: Function to check if currently locked (`() => boolean`)

**Parameters (lock function):**
- `options.timeout` (optional): Auto-unlock timeout in milliseconds
- `options.scope` (optional): Event blocking scope (`'inside'`, `'outside'`, or `'self'`)

**Returns (lock function):** `true` if lock was applied, `false` if already locked or if the ref is not set (when using element-specific lock)

### allowGlobal Parameter

The `allowGlobal` parameter enables global lock mode, which blocks user interactions across the entire page instead of scoping to a specific element.

**Global Lock (`allowGlobal=true`):**
```tsx
// No need to destructure 'target' since we're not using element-specific locking
const { lock, unlock, isLocked } = useBlokr(true);

// Locks all interactions across the entire page
lock();  // Blocks all user interactions globally
```

**Element-Specific Lock (Default: `allowGlobal=false`):**
```tsx
const { target, lock, unlock, isLocked } = useBlokr<HTMLDivElement>();

// Attach target to an element
<div ref={target}>Content</div>

// Lock only affects this specific element (by default, scope='inside')
lock();  // Blocks interactions inside the div
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

- **Event listener priority**: Event listeners are registered at the capture phase. May not work correctly when used with event delegation libraries.

## License

MIT
