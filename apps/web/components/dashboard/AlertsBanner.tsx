'use client';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertsBannerProps {
  alerts: Alert[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertStyles = (type: Alert['type']) => {
    const styles = {
      warning: {
        bg: '#f59e0b',
        icon: '⚠️',
      },
      error: {
        bg: '#ef4444',
        icon: '🚨',
      },
      info: {
        bg: '#2979FF',
        icon: 'ℹ️',
      },
      success: {
        bg: '#10b981',
        icon: '✓',
      },
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="px-6 pb-4 pt-2">
      <div className="space-y-2">
        {alerts.map((alert) => {
          const styles = getAlertStyles(alert.type);
          return (
            <div
              key={alert.id}
              className="rounded-lg px-4 py-3 flex items-center justify-between animate-fade-in"
              style={{
                background: styles.bg,
                color: 'var(--re-white)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{styles.icon}</span>
                <span className="font-medium">{alert.message}</span>
              </div>
              {alert.actionLabel && alert.onAction && (
                <button
                  onClick={alert.onAction}
                  className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-md font-semibold text-sm transition-all duration-200"
                >
                  {alert.actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
