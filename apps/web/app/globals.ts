// Global polyfills for server-side rendering
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  (global as any).self = global;
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  (global as any).window = global;
}