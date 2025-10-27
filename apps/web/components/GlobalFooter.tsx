'use client';

export function GlobalFooter() {
  // Only show in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const version = process.env.NEXT_PUBLIC_RELEASE || 'dev';

  return (
    <footer className="fixed bottom-2 right-2 z-50 pointer-events-none">
      <div className="pointer-events-auto bg-gray-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md shadow-lg font-mono">
        v{version}
      </div>
    </footer>
  );
}
