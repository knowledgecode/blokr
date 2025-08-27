# Blokr

[![CI](https://github.com/knowledgecode/blokr/actions/workflows/ci.yml/badge.svg)](https://github.com/knowledgecode/blokr/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/blokr)](https://www.npmjs.com/package/blokr)

Lightweight library to block user interactions in browsers.

## Features

- **No overlay elements**: Blocks interactions without adding elements to the DOM
- **Event blocking**: Prevents mouse, keyboard, and touch interactions
- **Auto-timeout**: Configurable timeout to prevent permanent blocking (default: 10 seconds)
- **Lightweight**: Minimal footprint with no dependencies
- **TypeScript**: Full type support included
- **Singleton**: Simple, predictable API

## Use Cases

- **POST processing**: Block interactions during data submission
- **Form submission**: Prevent double-submission
- **Animations**: Disable interaction during transitions
- **Game pausing**: Temporarily disable game controls

## Installation

```bash
npm install blokr
```

## Usage

### ES Modules

```typescript
import blokr from 'blokr';

// Block user interactions
blokr.lock();

// Check if blocked
if (blokr.isLocked()) {
  console.log('User interactions are blocked');
}

// Unblock after some work
setTimeout(() => {
  blokr.unlock();
}, 2000);
```

### CDN

```html
<script src="https://unpkg.com/blokr/dist/blokr.js"></script>
<script>
  // Block interactions
  window.Blokr.lock();

  // Auto-unlock after 3 seconds
  setTimeout(() => {
    window.Blokr.unlock();
  }, 3000);
</script>
```

## API

### `blokr.lock()`

Blocks user interactions. Multiple calls are counted internally, requiring the same number of `unlock()` calls to fully unblock.

```typescript
blokr.lock();    // Call count: 1
blokr.lock();    // Call count: 2
blokr.unlock();  // Call count: 1 (still blocked)
blokr.unlock();  // Call count: 0 (unblocked)
```

### `blokr.unlock(abort?: boolean)`

Unblocks user interactions. By default, decrements the internal counter. When `abort` is `true`, immediately resets the counter to zero and releases all locks.

**Parameters:**

- `abort` (optional): When `true`, immediately unlocks all locks. Default: `false`

```typescript
// Normal unlock behavior (decrements counter)
blokr.lock();    // Lock count: 1
blokr.lock();    // Lock count: 2

blokr.unlock();  // Lock count: 1 (still locked)
blokr.unlock();  // Lock count: 0 (unlocked)

// Emergency unlock with abort
blokr.lock();        // Lock count: 1
blokr.lock();        // Lock count: 2
blokr.unlock(true);  // Lock count: 0 (immediately unlocked)
```

### `blokr.isLocked(): boolean`

Returns `true` if user interactions are currently blocked.

```typescript
blokr.isLocked(); // false
blokr.lock();
blokr.isLocked(); // true
```

### `blokr.setTimeout(timeout: number): boolean`

Sets the auto-unlock timeout in milliseconds (default: 10000). Cannot be changed while locked. Returns `true` if successfully set, `false` if currently locked.

```typescript
// Set 5-second timeout (only works when unlocked)
blokr.setTimeout(5000);

// Disable auto-timeout
blokr.setTimeout(0);

// Cannot change timeout while locked
blokr.lock();
blokr.setTimeout(1000); // returns false
```

## Example: POST Processing

```typescript
import blokr from 'blokr';

async function saveUserProfile(formData) {
  // Block all interactions during save
  blokr.lock();

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      showSuccessMessage();
    }
  } finally {
    blokr.unlock();
  }
}
```

## Example: Animation Blocking

```typescript
import blokr from 'blokr';

function slidePanel() {
  // Block interactions during animation
  blokr.lock();

  // Start CSS animation
  panel.classList.add('sliding');

  // Re-enable interactions when animation completes
  setTimeout(() => {
    blokr.unlock();
  }, 500);
}
```

## Limitations

- Only blocks genuine user interactions. Programmatically triggered events (e.g., `element.click()`) are not blocked.
- May not work when used with event delegation libraries. Loading Blokr before other libraries may resolve this issue.

## License

MIT
