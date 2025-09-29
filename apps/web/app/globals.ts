// Global polyfills for server-side rendering
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  (global as any).self = global;
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Create a minimal window object with location for SSR compatibility
  (global as any).window = {
    ...global,
    location: {
      protocol: 'https:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      href: 'https://localhost:3000/'
    }
  };

  // Mock document object for SSR compatibility
  (global as any).document = {
    cookie: '',
    createElement: () => ({ style: {} }),
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}