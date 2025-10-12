'use client';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertCardProps {
  alerts: Alert[];
}

export function AlertCard({ alerts }: AlertCardProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertStyles = (type: Alert['type']) => {
    const styles = {
      warning: {
        bg: '#f59e0b20',
        border: '#f59e0b40',
        icon: '#f59e0b',
        text: '#f59e0b',
      },
      error: {
        bg: '#ef444420',
        border: '#ef444440',
        icon: '#ef4444',
        text: '#ef4444',
      },
      info: {
        bg: '#2979FF20',
        border: '#2979FF40',
        icon: '#2979FF',
        text: '#6EA8FE',
      },
      success: {
        bg: '#10b98120',
        border: '#10b98140',
        icon: '#10b981',
        text: '#10b981',
      },
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        );
      case 'error':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      case 'success':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        return (
          <div
            key={alert.id}
            className="rounded-xl p-4 transition-all duration-300"
            style={{
              background: styles.bg,
              border: `1px solid ${styles.border}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 flex-shrink-0"
                style={{ color: styles.icon }}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {getIcon(alert.type)}
                </svg>
              </div>
              <div className="flex-1">
                <h4
                  className="font-semibold text-sm mb-1"
                  style={{ color: 'var(--re-white)' }}
                >
                  {alert.title}
                </h4>
                <p
                  className="text-sm"
                  style={{ color: 'var(--re-steel-gray)' }}
                >
                  {alert.message}
                </p>
                {alert.actionLabel && alert.onAction && (
                  <button
                    onClick={alert.onAction}
                    className="mt-2 text-sm font-semibold hover:underline transition-all duration-200"
                    style={{ color: styles.text }}
                  >
                    {alert.actionLabel} →
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
