// Vitest runs in plain Node, not under Next.js's "react-server" resolution
// condition, so the real `server-only` package (which throws unless that
// condition is set) can't be imported directly in tests. vitest.config.ts
// aliases `server-only` to this no-op stub for the test environment only;
// the real package still guards the module in the actual Next.js build.
export {};
