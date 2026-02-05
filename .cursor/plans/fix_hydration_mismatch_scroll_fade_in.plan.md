# Fix Hydration Mismatch in ScrollFadeIn Component

## Problem
The `ScrollFadeIn` component causes hydration mismatches because it uses `useIsMobile()` which returns `undefined` during SSR but a boolean value on the client. This causes different CSS classes to be applied, leading to the error:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

## Root Cause
In `src/components/site/scroll-fade-in.tsx`:
- Line 29: `const isMobile = useIsMobile();`
- The `useIsMobile()` hook returns `undefined` when `!mounted` (during SSR)
- The `getAnimationClasses()` function uses `isMobile` to determine animation classes
- Server renders with `isMobile = undefined` (treated as falsy)
- Client renders with `isMobile = true/false` (actual boolean)
- This causes different class names: `translate-y-5` vs `translate-y-8`, etc.

## Solution
Ensure `ScrollFadeIn` renders the same initial state on both server and client by:
1. Defaulting `isMobile` to `false` during SSR (before mount)
2. Using a `mounted` state to prevent applying mobile-specific classes until after hydration
3. Ensuring initial render matches between server and client

## Files to Modify

### `src/components/site/scroll-fade-in.tsx`
- Add a `mounted` state to track when component has hydrated
- Default `isMobile` to `false` during SSR to match desktop behavior
- Only apply mobile-specific optimizations after component has mounted
- Ensure initial animation classes are consistent between server and client

## Implementation Details

**Current problematic code:**
```typescript
const isMobile = useIsMobile(); // Returns undefined on server, boolean on client
const effectiveDuration = isMobile ? Math.min(400, duration * 0.6) : duration;
const effectiveDelay = isMobile ? Math.max(0, delay * 0.5) : delay;
// ... used in getAnimationClasses() which causes different classes
```

**Fixed code:**
```typescript
const isMobile = useIsMobile();
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Use desktop defaults during SSR to match initial client render
const effectiveIsMobile = mounted ? (isMobile ?? false) : false;
const effectiveDuration = effectiveIsMobile ? Math.min(400, duration * 0.6) : duration;
const effectiveDelay = effectiveIsMobile ? Math.max(0, delay * 0.5) : delay;
// ... use effectiveIsMobile instead of isMobile in getAnimationClasses()
```

## Testing
After implementation, verify:
- No hydration mismatch errors in console
- Animations still work correctly after hydration
- Mobile optimizations still apply after component mounts
- Server-rendered HTML matches initial client render
