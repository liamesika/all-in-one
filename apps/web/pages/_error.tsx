function Error({ statusCode }: { statusCode: number }) {
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
      <h1 style={{ fontSize: '72px', marginBottom: '16px', color: '#EF4444' }}>
        {statusCode ? statusCode : 'Error'}
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        {statusCode === 404
          ? 'Page not found'
          : 'An error occurred'}
      </p>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
