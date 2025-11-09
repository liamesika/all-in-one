import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '72px', marginBottom: '16px', color: '#2979FF' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          backgroundColor: '#2979FF',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '16px',
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
