'use client'

import React from 'react'
import { useLang } from '@/components/i18n/LangProvider'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Campaign Error Boundary
 * 
 * Catches and handles errors in campaign components gracefully.
 * Provides accessible error messages and recovery options.
 */
export class CampaignErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error for debugging
    console.error('Campaign Error Boundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, retry }: { error: Error | null; retry: () => void }) {
  const { t } = useLang()

  return (
    <div 
      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {t('campaigns.error.title') || 'Something went wrong'}
          </h3>
          <p className="text-red-700 mb-4">
            {t('campaigns.error.message') || 'An error occurred while loading the campaign interface.'}
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="text-left text-sm text-red-600 bg-red-100 rounded p-3 mb-4">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap overflow-auto">
                {error.name}: {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Retry loading campaigns"
          >
            {t('campaigns.error.retry') || 'Try Again'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Refresh the entire page"
          >
            {t('campaigns.error.refresh') || 'Refresh Page'}
          </button>
        </div>
        
        <p className="text-sm text-red-600">
          {t('campaigns.error.support') || 'If this problem persists, please contact support.'}
        </p>
      </div>
    </div>
  )
}

/**
 * Campaign Loading Error Component
 * 
 * Specialized error component for API loading failures
 */
export function CampaignLoadingError({ 
  error, 
  retry, 
  message 
}: { 
  error?: Error | string
  retry?: () => void
  message?: string 
}) {
  const { t } = useLang()

  return (
    <div 
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center space-x-2 mb-3">
        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path 
            fillRule="evenodd" 
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
        <h3 className="font-medium text-yellow-900">
          {t('campaigns.loading.error') || 'Loading Error'}
        </h3>
      </div>
      
      <p className="text-yellow-700 mb-4">
        {message || t('campaigns.loading.failed') || 'Failed to load campaigns. Please try again.'}
      </p>
      
      {error && typeof error === 'string' && (
        <p className="text-sm text-yellow-600 mb-4 font-mono bg-yellow-100 p-2 rounded">
          {error}
        </p>
      )}
      
      {retry && (
        <button
          onClick={retry}
          className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          aria-label="Retry loading campaigns"
        >
          {t('campaigns.loading.retry') || 'Retry'}
        </button>
      )}
    </div>
  )
}

/**
 * Campaign Form Validation Error Component
 */
export function CampaignValidationError({ 
  errors, 
  onDismiss 
}: { 
  errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }>
  onDismiss?: () => void 
}) {
  const { t } = useLang()
  const errorCount = errors.filter(e => e.severity === 'error').length
  const warningCount = errors.filter(e => e.severity === 'warning').length

  return (
    <div 
      className={`border rounded-lg p-4 ${
        errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className="flex-shrink-0">
            {errorCount > 0 ? (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              errorCount > 0 ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {errorCount > 0 
                ? (t('campaigns.validation.errors') || `${errorCount} validation error${errorCount > 1 ? 's' : ''}`)
                : (t('campaigns.validation.warnings') || `${warningCount} warning${warningCount > 1 ? 's' : ''}`)
              }
            </h3>
            <ul className={`mt-2 text-sm space-y-1 ${
              errorCount > 0 ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-medium mr-2">{error.field}:</span>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-4 ${
              errorCount > 0 ? 'text-red-600 hover:text-red-800' : 'text-yellow-600 hover:text-yellow-800'
            }`}
            aria-label="Dismiss validation messages"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}