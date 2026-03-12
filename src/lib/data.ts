// Dummy file to satisfy Turbopack HMR module resolution
// This file exists to prevent Turbopack from creating phantom references
// during hot module replacement with server actions
// 
// Turbopack sometimes creates phantom references to this module when
// server actions are imported in client components. This file satisfies
// that reference and prevents HMR errors.
// 
// Version: 2025-01-27 - Created to fix Turbopack HMR error with lib/data:43e20b

// Export empty object to satisfy module resolution
export const data = {};

// Named exports for compatibility
export function getData() {
  return {};
}

// Default export
export default {};
