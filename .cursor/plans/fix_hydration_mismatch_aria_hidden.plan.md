# Fix Hydration Mismatch with aria-hidden Attributes

## Problem
The `HomeProjectContent` component's `<section>` element is showing hydration mismatch errors with `aria-hidden` and `data-aria-hidden` attributes. The server renders with these attributes, but the client doesn't (or vice versa).

## Root Cause
The `ScrollFadeIn` component wraps the section and uses `isVisible` state that starts as `false`. The IntersectionObserver may immediately detect the element as visible on the client (if it's in the viewport), setting `isVisible = true` before React finishes hydrating. This causes:
1. Different class names between server (`opacity-0`) and client (`opacity-100`)
2. Potential `aria-hidden` attributes being added/removed by browser or accessibility tools
3. Hydration mismatch errors

## Solution
Ensure the `isVisible` state remains `false` until after the component has fully hydrated and the IntersectionObserver has been properly initialized. This ensures the initial client render matches the server render exactly.

## Files to Modify

### `src/components/site/scroll-fade-in.tsx`
- Ensure `isVisible` stays `false` during initial render to match SSR
- Only allow `isVisible` to change to `true` after the component has mounted and the IntersectionObserver has been set up
- Add a guard to prevent immediate visibility updates during hydration

## Implementation Details

**Current problematic behavior:**
- Server: `isVisible = false` → renders with `opacity-0`
- Client initial: `isVisible = false` → should render with `opacity-0`
- Client after IntersectionObserver: If element is in viewport, immediately sets `isVisible = true` → renders with `opacity-100`
- This causes a mismatch if the observer fires before React finishes hydrating

**Fixed behavior:**
- Server: `isVisible = false` → renders with `opacity-0`
- Client initial: `isVisible = false` → renders with `opacity-0` (matches server)
- Client after mount + observer setup: Only then allow `isVisible` to change
- Use `mounted` state to gate visibility updates

**Code changes:**
1. Ensure IntersectionObserver callback only updates `isVisible` after `mounted = true`
2. Add a small delay or use `requestAnimationFrame` to ensure hydration completes first
3. Or, use a ref to track if we're still hydrating and skip updates during that time

## Testing
After implementation, verify:
- No hydration mismatch errors in console
- Elements still animate correctly when scrolled into view
- Initial render matches between server and client
- No `aria-hidden` attribute mismatches
