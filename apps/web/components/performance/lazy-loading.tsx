'use client';

import React, { Suspense, lazy, memo } from 'react';
import { useLanguage } from '@/lib/language-context';

// Loading fallback component
const LoadingSpinner = memo(function LoadingSpinner({ 
  message, 
  size = 'medium' 
}: { 
  message?: string; 
  size?: 'small' | 'medium' | 'large' 
}) {
  const { language } = useLanguage();
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      {message && (
        <p className="text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
});

// Error boundary fallback
const ErrorFallback = memo(function ErrorFallback({ 
  error, 
  retry 
}: { 
  error: Error; 
  retry?: () => void 
}) {
  const { language } = useLanguage();
  
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-start space-x-3">
        <div className="text-red-600">⚠️</div>
        <div>
          <h3 className="text-sm font-medium text-red-800">
            {language === 'he' ? 'שגיאה בטעינה' : 'Loading Error'}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {error.message || (language === 'he' ? 'משהו השתבש' : 'Something went wrong')}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              {language === 'he' ? 'נסה שוב' : 'Try again'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Lazy component wrapper with error boundary
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; retry?: () => void }>;
}

export class LazyWrapper extends React.Component<LazyWrapperProps, { hasError: boolean; error: Error | null }> {
  constructor(props: LazyWrapperProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyWrapper caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const ErrorComponent = this.props.errorFallback || ErrorFallback;
      return <ErrorComponent error={this.state.error!} retry={this.retry} />;
    }

    return (
      <Suspense fallback={this.props.fallback || <LoadingSpinner />}>
        {this.props.children}
      </Suspense>
    );
  }
}

// Higher-order component for lazy loading with performance optimizations
export function withLazyLoading<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options: {
    fallback?: React.ReactNode;
    errorFallback?: React.ComponentType<{ error: Error; retry?: () => void }>;
    preload?: boolean; // Whether to preload on hover/focus
  } = {}
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));

  return memo(function LazyLoadedComponent(props: T) {
    const [shouldPreload, setShouldPreload] = React.useState(false);

    const handleMouseEnter = React.useCallback(() => {
      if (options.preload && !shouldPreload) {
        setShouldPreload(true);
      }
    }, [shouldPreload]);

    return (
      <div
        onMouseEnter={handleMouseEnter}
        onFocus={handleMouseEnter}
      >
        <LazyWrapper
          fallback={options.fallback}
          errorFallback={options.errorFallback}
        >
          <LazyComponent {...(props as any)} />
        </LazyWrapper>
      </div>
    );
  });
}

// Intersection observer based lazy loading
export function useLazyIntersection(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the element is visible
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Lazy image component with loading states
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const { hasIntersected } = useLazyIntersection(imgRef);

  const handleLoad = React.useCallback(() => {
    setLoaded(true);
    setError(false);
  }, []);

  const handleError = React.useCallback(() => {
    setError(true);
    setLoaded(false);
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {hasIntersected && (
        <>
          <img
            src={error && fallbackSrc ? fallbackSrc : src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            {...props}
          />
          {!loaded && !error && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </>
      )}
      {!hasIntersected && (
        <div className="absolute inset-0 bg-gray-200" />
      )}
    </div>
  );
});

export { LoadingSpinner, ErrorFallback };